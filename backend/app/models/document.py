from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum

class DocumentStatus(str, enum.Enum):
    """Status of document processing"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Document(Base):
    """
    Stores uploaded tax documents (salary slips, bank statements, etc.)
    """
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, image, excel
    file_size = Column(Integer, nullable=False)  # in bytes
    
    # Processing status
    status = Column(
        Enum(DocumentStatus),
        default=DocumentStatus.UPLOADED,
        nullable=False
    )
    
    # AI extracted data (stored as JSON text for flexibility)
    extracted_data = Column(Text, nullable=True)  # JSON string
    
    # Error handling
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}', status='{self.status}')>"