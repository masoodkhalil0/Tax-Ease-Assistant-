from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.models.admin import TaxCategory

# Tax Slab Schemas
class TaxSlabBase(BaseModel):
    category: TaxCategory
    tax_year: str
    min_income: float
    max_income: Optional[float] = None
    fixed_tax: float = 0.0
    tax_rate: float
    description: Optional[str] = None
    is_active: bool = True

class TaxSlabCreate(TaxSlabBase):
    pass

class TaxSlabUpdate(BaseModel):
    category: Optional[TaxCategory] = None
    tax_year: Optional[str] = None
    min_income: Optional[float] = None
    max_income: Optional[float] = None
    fixed_tax: Optional[float] = None
    tax_rate: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class TaxSlabResponse(TaxSlabBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Allowance Type Schemas
class AllowanceTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_fully_exempt: bool = False
    exempt_percentage: float = 0.0
    max_exempt_amount: Optional[float] = None
    applicable_category: TaxCategory
    is_active: bool = True

class AllowanceTypeCreate(AllowanceTypeBase):
    pass

class AllowanceTypeResponse(AllowanceTypeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Deduction Type Schemas
class DeductionTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_deduction_percentage: Optional[float] = None
    max_deduction_amount: Optional[float] = None
    applicable_category: TaxCategory
    is_active: bool = True

class DeductionTypeCreate(DeductionTypeBase):
    pass

class DeductionTypeResponse(DeductionTypeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# System Settings Schemas
class SystemSettingBase(BaseModel):
    setting_key: str
    setting_value: str
    setting_type: str = "string"
    description: Optional[str] = None

class SystemSettingCreate(SystemSettingBase):
    pass

class SystemSettingResponse(SystemSettingBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    cnic: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_admin: bool = False

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True