from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models.document import DocumentStatus

class DocumentBase(BaseModel):
    """Base schema for document"""
    filename: str
    file_type: str

class DocumentCreate(DocumentBase):
    """Schema for creating a document"""
    original_filename: str
    file_path: str
    file_size: int

class DocumentResponse(DocumentBase):
    """Schema for document response"""
    id: int
    original_filename: str
    file_size: int
    status: DocumentStatus
    extracted_data: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # For SQLAlchemy models

class DocumentList(BaseModel):
    """Schema for list of documents"""
    total: int
    documents: list[DocumentResponse]