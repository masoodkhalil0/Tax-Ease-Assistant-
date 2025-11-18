from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class TaxCategory(str, enum.Enum):
    """Types of taxpayers"""
    SALARIED = "salaried"
    BUSINESS = "business"
    FREELANCER = "freelancer"
    FARMER = "farmer"
    OTHER = "other"

class User(Base):
    """
    Admin and regular users
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # User type
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Profile
    full_name = Column(String(255), nullable=True)
    cnic = Column(String(20), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', is_admin={self.is_admin})>"


class TaxSlab(Base):
    """
    Tax slabs configuration - Admin can modify these
    """
    __tablename__ = "tax_slabs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Tax Category
    category = Column(
        Enum(TaxCategory),
        default=TaxCategory.SALARIED,
        nullable=False
    )
    
    # Tax Year
    tax_year = Column(String(10), nullable=False)  # e.g., "2024-25"
    
    # Income Range (in PKR)
    min_income = Column(Float, nullable=False)  # Minimum annual income
    max_income = Column(Float, nullable=True)   # Maximum (NULL = no limit)
    
    # Tax Calculation
    fixed_tax = Column(Float, default=0.0)  # Fixed amount
    tax_rate = Column(Float, nullable=False)  # Percentage (e.g., 15 = 15%)
    
    # Description
    description = Column(String(255), nullable=True)
    
    # Active status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<TaxSlab(category={self.category}, {self.min_income}-{self.max_income}, rate={self.tax_rate}%)>"


class AllowanceType(Base):
    """
    Types of allowances that are tax-exempt or partially exempt
    """
    __tablename__ = "allowance_types"
    
    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False, unique=True)  # e.g., "House Rent"
    description = Column(Text, nullable=True)
    
    # Exemption details
    is_fully_exempt = Column(Boolean, default=False)  # Fully tax-free?
    exempt_percentage = Column(Float, default=0.0)    # If partial, what %
    max_exempt_amount = Column(Float, nullable=True)  # Maximum exempt amount
    
    # Which category does this apply to
    applicable_category = Column(
        Enum(TaxCategory),
        default=TaxCategory.SALARIED
    )
    
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<AllowanceType(name='{self.name}', exempt={self.exempt_percentage}%)>"


class DeductionType(Base):
    """
    Types of deductions that can be claimed
    """
    __tablename__ = "deduction_types"
    
    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False, unique=True)  # e.g., "Charity"
    description = Column(Text, nullable=True)
    
    # Deduction limits
    max_deduction_percentage = Column(Float, nullable=True)  # % of taxable income
    max_deduction_amount = Column(Float, nullable=True)      # Absolute max
    
    # Which category can claim this
    applicable_category = Column(
        Enum(TaxCategory),
        default=TaxCategory.SALARIED
    )
    
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<DeductionType(name='{self.name}')>"


class SystemSettings(Base):
    """
    Global system settings configurable by admin
    """
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    setting_key = Column(String(100), unique=True, nullable=False, index=True)
    setting_value = Column(Text, nullable=False)
    setting_type = Column(String(50), default="string")  # string, number, boolean, json
    
    description = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<SystemSettings(key='{self.setting_key}', value='{self.setting_value}')>"