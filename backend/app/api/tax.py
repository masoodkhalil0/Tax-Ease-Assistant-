from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import json

from app.database import get_db
from app.models.document import Document
from app.models.tax_data import TaxCalculation
from app.models.admin import TaxSlab

router = APIRouter()

@router.get("/slab", response_model=dict)
async def get_tax_slab(
    income: float,
    category: str = "SALARIED",
    tax_year: str = "2025-26",
    db: Session = Depends(get_db)
):
    """
    Get tax slab for a given income from database
    """
    try:
        # Query tax slab from database using SQLAlchemy
        query = db.query(TaxSlab).filter(
            TaxSlab.category == category,
            TaxSlab.tax_year == tax_year,
            TaxSlab.is_active == True,
            TaxSlab.min_income <= income
        ).filter(
            (TaxSlab.max_income >= income) | (TaxSlab.max_income.is_(None))
        ).order_by(TaxSlab.min_income.desc())
        
        slab = query.first()
        
        if not slab:
            raise HTTPException(status_code=404, detail="Tax slab not found for this income")
        
        # Calculate tax based on FBR formula
        excess_income = income - slab.min_income
        variable_tax = excess_income * (slab.tax_rate / 100)
        total_tax = slab.fixed_tax + variable_tax
        
        return {
            "slab": {
                "category": slab.category,
                "tax_year": slab.tax_year,
                "min_income": slab.min_income,
                "max_income": slab.max_income,
                "fixed_tax": slab.fixed_tax,
                "tax_rate": slab.tax_rate,
                "description": slab.description
            },
            "calculated_tax": round(total_tax, 0)
        }
        
    except Exception as e:
        print(f"Tax slab error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate/{document_id}")
async def calculate_and_save_tax(
    document_id: int,
    db: Session = Depends(get_db)
):
    """
    Calculate tax for a document and save to tax_calculations table
    """
    try:
        # Get document with extracted data
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document or not document.extracted_data:
            raise HTTPException(status_code=404, detail="Document not found or not analyzed")
        
        # Parse extracted data
        extracted_data = json.loads(document.extracted_data)
        
        # Calculate totals for FBR IRIS fields
        annual_gross = float(extracted_data.get("salary_details", {}).get("annual_gross_salary", 0))
        basic_salary = float(extracted_data.get("salary_details", {}).get("basic_salary", 0))
        
        # Sum all allowances
        allowances = extracted_data.get("allowances", {})
        total_allowances = sum([
            float(allowances.get("house_rent", 0)),
            float(allowances.get("medical", 0)),
            float(allowances.get("conveyance", 0)),
            float(allowances.get("utility", 0)),
            float(allowances.get("other", 0))
        ])
        
        # Sum deductions
        deductions = extracted_data.get("deductions", {})
        tax_already_paid = float(deductions.get("income_tax", 0))
        provident_fund = float(deductions.get("provident_fund", 0))
        other_deductions = float(deductions.get("eobi", 0)) + float(deductions.get("social_security", 0))
        
        # Taxable income calculation (per FBR rules)
        taxable_income = annual_gross - total_allowances - provident_fund - other_deductions
        taxable_income = max(0, taxable_income)  # Ensure non-negative
        
        # Get tax slab and calculate tax
        tax_slab_result = await get_tax_slab(taxable_income)
        calculated_tax = tax_slab_result["calculated_tax"]
        tax_due = calculated_tax - tax_already_paid
        
        # Save to database
        tax_calc = TaxCalculation(
            document_id=document_id,
            employee_name=extracted_data.get("employee_name"),
            employer_name=extracted_data.get("employer_name"),
            cnic=extracted_data.get("cnic"),
            gross_salary=annual_gross,
            basic_salary=basic_salary,
            allowances=total_allowances,
            tax_already_paid=tax_already_paid,
            charity_donations=0,  # Not extracted from documents yet
            other_deductions=other_deductions,
            taxable_income=taxable_income,
            calculated_tax=calculated_tax,
            tax_due=tax_due,
            tax_slab=tax_slab_result["slab"]["description"],
            tax_year="2025-26",
            notes=f"Auto-calculated from document {document_id}"
        )
        
        db.add(tax_calc)
        db.commit()
        db.refresh(tax_calc)
        
        return {
            "success": True,
            "message": "Tax calculation saved successfully",
            "tax_calculation_id": tax_calc.id,
            "taxable_income": taxable_income,
            "calculated_tax": calculated_tax,
            "tax_due": tax_due,
            "slab": tax_slab_result["slab"]
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))