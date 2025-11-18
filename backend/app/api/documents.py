from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import json 
from pathlib import Path
from datetime import datetime

from app.database import get_db
from app.models import Document, DocumentStatus
from app.schemas.document import DocumentResponse, DocumentList
from app.config import settings
from app.services.ai_service import extract_salary_data_from_document, search_in_documents

router = APIRouter()

ALLOWED_EXTENSIONS = {'pdf', 'jpg', 'jpeg'}

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a tax document (PDF or JPG only)
    """
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: PDF, JPG, JPEG only"
        )
    
    # Check file size
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        )
    
    # Reset file position after reading
    await file.seek(0)
    
    # Generate unique filename
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Create upload path
    upload_path = settings.get_upload_path()
    file_path = upload_path / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Create database record
    document = Document(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_type=file_extension,
        file_size=file_size,
        status=DocumentStatus.UPLOADED
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document


@router.get("", response_model=List[DocumentResponse])
async def get_documents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all uploaded documents
    """
    documents = db.query(Document)\
        .order_by(Document.uploaded_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific document by ID
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document


@router.post("/analyze/{document_id}")
async def analyze_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Analyze a document with AI to extract salary and tax data
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if already processed
    if document.status == DocumentStatus.COMPLETED:
        import json
        return {
            "success": True,
            "message": "Document already analyzed",
            "document_id": document_id,
            "extracted_data": json.loads(document.extracted_data) if document.extracted_data else None
        }
    
    # Update status to processing
    document.status = DocumentStatus.PROCESSING
    db.commit()
    
    try:
        # Extract data using AI
        result = await extract_salary_data_from_document(
            document.file_path,
            document.file_type
        )
        
        if result["success"]:
            # Store extracted data as JSON string
            import json
            document.extracted_data = json.dumps(result["data"])
            document.status = DocumentStatus.COMPLETED
            document.processed_at = datetime.now()
            
            db.commit()
            db.refresh(document)
            
            return {
                "success": True,
                "message": "Document analyzed successfully",
                "document_id": document_id,
                "extracted_data": result["data"],
                "tokens_used": result.get("tokens_used", 0)
            }
        else:
            document.status = DocumentStatus.FAILED
            document.error_message = result.get("error", "Unknown error")
            db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI analysis failed: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        document.status = DocumentStatus.FAILED
        document.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis error: {str(e)}"
        )

@router.post("/search")
async def search_documents(
    query: str,
    db: Session = Depends(get_db)
):
    """
    Search across all uploaded documents for specific information
    """
    # Get all completed documents
    documents = db.query(Document).filter(
        Document.status == DocumentStatus.COMPLETED,
        Document.extracted_data.isnot(None)
    ).all()
    
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No processed documents found. Please upload and analyze documents first."
        )
    
    # Extract text from documents
    document_texts = []
    for doc in documents:
        if doc.extracted_data:
            document_texts.append(doc.extracted_data)
    
    try:
        result = await search_in_documents(query, document_texts)
        
        if result["success"]:
            return {
                "success": True,
                "query": query,
                "answer": result["answer"],
                "documents_searched": len(documents)
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Search failed: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search error: {str(e)}"
        )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file from filesystem
    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return None