from app.database import Base  # Import Base from database
from app.models.document import Document, DocumentStatus
from app.models.tax_data import TaxCalculation
from app.models.admin import (
    User,
    TaxSlab,
    AllowanceType,
    DeductionType,
    SystemSettings,
    TaxCategory
)

__all__ = [
    "Base",  # Add this!
    "Document",
    "DocumentStatus",
    "TaxCalculation",
    "User",
    "TaxSlab",
    "AllowanceType",
    "DeductionType",
    "SystemSettings",
    "TaxCategory"
]