from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class TaxCalculation(Base):
    """
    Stores calculated tax information for salary persons
    """
    __tablename__ = "tax_calculations"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    # Employee Information
    employee_name = Column(String(255), nullable=True)
    employer_name = Column(String(255), nullable=True)
    cnic = Column(String(20), nullable=True)
    
    # Salary Information (Annual amounts in PKR)
    gross_salary = Column(Float, nullable=False)
    basic_salary = Column(Float, nullable=True)
    allowances = Column(Float, default=0.0)  # House rent, medical, etc.
    
    # Deductions
    tax_already_paid = Column(Float, default=0.0)
    charity_donations = Column(Float, default=0.0)
    other_deductions = Column(Float, default=0.0)
    
    # Taxable Income
    taxable_income = Column(Float, nullable=False)
    
    # Tax Calculation Results
    calculated_tax = Column(Float, nullable=False)
    tax_due = Column(Float, nullable=False)  # Tax due or refund
    tax_slab = Column(String(100), nullable=True)  # Which tax bracket
    
    # Additional Information
    tax_year = Column(String(10), nullable=True)  # e.g., "2024-25"
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<TaxCalculation(id={self.id}, taxable_income={self.taxable_income}, calculated_tax={self.calculated_tax})>"