from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from enum import Enum

from app.database import get_db
from app.models import TaxSlab, AllowanceType, DeductionType, SystemSettings, TaxCategory
from app.schemas.admin import (
    TaxSlabCreate, TaxSlabResponse, TaxSlabUpdate,
    AllowanceTypeCreate, AllowanceTypeResponse,
    DeductionTypeCreate, DeductionTypeResponse,
    SystemSettingCreate, SystemSettingResponse
)

router = APIRouter()

# Enum for resource types
class ResourceType(str, Enum):
    TAX_SLABS = "tax-slabs"
    ALLOWANCES = "allowances"
    DEDUCTIONS = "deductions"
    SETTINGS = "settings"

class OperationType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"

# ==================== UNIFIED GET ENDPOINT ====================

@router.get("")
async def get_admin_data(
    resource: ResourceType = Query(..., description="Type of resource to fetch"),
    category: Optional[TaxCategory] = Query(None, description="Filter by category"),
    tax_year: Optional[str] = Query(None, description="Filter by tax year"),
    db: Session = Depends(get_db)
):
    """
    Unified admin GET endpoint - Get any admin resource with dropdown filters
    
    Usage:
    - GET /api/admin?resource=tax-slabs&category=salaried&tax_year=2025-26
    - GET /api/admin?resource=allowances&category=salaried
    - GET /api/admin?resource=deductions
    - GET /api/admin?resource=settings
    """
    
    if resource == ResourceType.TAX_SLABS:
        query = db.query(TaxSlab).filter(TaxSlab.is_active == True)
        
        if category:
            query = query.filter(TaxSlab.category == category)
        if tax_year:
            query = query.filter(TaxSlab.tax_year == tax_year)
        
        slabs = query.order_by(TaxSlab.min_income).all()
        return {
            "resource_type": "tax_slabs",
            "total": len(slabs),
            "data": [TaxSlabResponse.from_orm(slab) for slab in slabs]
        }
    
    elif resource == ResourceType.ALLOWANCES:
        query = db.query(AllowanceType).filter(AllowanceType.is_active == True)
        
        if category:
            query = query.filter(AllowanceType.applicable_category == category)
        
        allowances = query.all()
        return {
            "resource_type": "allowances",
            "total": len(allowances),
            "data": [AllowanceTypeResponse.from_orm(a) for a in allowances]
        }
    
    elif resource == ResourceType.DEDUCTIONS:
        query = db.query(DeductionType).filter(DeductionType.is_active == True)
        
        if category:
            query = query.filter(DeductionType.applicable_category == category)
        
        deductions = query.all()
        return {
            "resource_type": "deductions",
            "total": len(deductions),
            "data": [DeductionTypeResponse.from_orm(d) for d in deductions]
        }
    
    elif resource == ResourceType.SETTINGS:
        settings = db.query(SystemSettings).all()
        return {
            "resource_type": "settings",
            "total": len(settings),
            "data": [SystemSettingResponse.from_orm(s) for s in settings]
        }


# ==================== UNIFIED POST ENDPOINT (CREATE) ====================

@router.post("")
async def create_admin_resource(
    resource: ResourceType = Query(..., description="Type of resource to create"),
    data: Dict[str, Any] = Body(..., description="Resource data"),
    db: Session = Depends(get_db)
):
    """
    Unified admin POST endpoint - Create any admin resource
    
    Usage:
    - POST /api/admin?resource=tax-slabs
    - POST /api/admin?resource=allowances
    - POST /api/admin?resource=deductions
    - POST /api/admin?resource=settings
    
    Body: JSON with resource-specific fields
    """
    
    try:
        if resource == ResourceType.TAX_SLABS:
            slab = TaxSlab(**data)
            db.add(slab)
            db.commit()
            db.refresh(slab)
            return {
                "success": True,
                "message": "Tax slab created successfully",
                "resource_type": "tax_slabs",
                "data": TaxSlabResponse.from_orm(slab)
            }
        
        elif resource == ResourceType.ALLOWANCES:
            allowance = AllowanceType(**data)
            db.add(allowance)
            db.commit()
            db.refresh(allowance)
            return {
                "success": True,
                "message": "Allowance created successfully",
                "resource_type": "allowances",
                "data": AllowanceTypeResponse.from_orm(allowance)
            }
        
        elif resource == ResourceType.DEDUCTIONS:
            deduction = DeductionType(**data)
            db.add(deduction)
            db.commit()
            db.refresh(deduction)
            return {
                "success": True,
                "message": "Deduction created successfully",
                "resource_type": "deductions",
                "data": DeductionTypeResponse.from_orm(deduction)
            }
        
        elif resource == ResourceType.SETTINGS:
            # Check if setting already exists
            existing = db.query(SystemSettings).filter(
                SystemSettings.setting_key == data.get('setting_key')
            ).first()
            
            if existing:
                raise HTTPException(status_code=400, detail="Setting already exists")
            
            setting = SystemSettings(**data)
            db.add(setting)
            db.commit()
            db.refresh(setting)
            return {
                "success": True,
                "message": "Setting created successfully",
                "resource_type": "settings",
                "data": SystemSettingResponse.from_orm(setting)
            }
            
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create {resource.value}: {str(e)}"
        )


# ==================== UNIFIED PUT ENDPOINT (UPDATE) ====================

@router.put("")
async def update_admin_resource(
    resource: ResourceType = Query(..., description="Type of resource to update"),
    resource_id: Optional[int] = Query(None, description="ID of resource to update (for tax-slabs, allowances, deductions)"),
    key: Optional[str] = Query(None, description="Key of setting to update (for settings)"),
    data: Dict[str, Any] = Body(..., description="Updated resource data"),
    db: Session = Depends(get_db)
):
    """
    Unified admin PUT endpoint - Update any admin resource
    
    Usage:
    - PUT /api/admin?resource=tax-slabs&resource_id=1
    - PUT /api/admin?resource=allowances&resource_id=2
    - PUT /api/admin?resource=deductions&resource_id=3
    - PUT /api/admin?resource=settings&key=current_tax_year
    
    Body: JSON with fields to update
    """
    
    try:
        if resource == ResourceType.TAX_SLABS:
            if not resource_id:
                raise HTTPException(status_code=400, detail="resource_id is required")
            
            db_slab = db.query(TaxSlab).filter(TaxSlab.id == resource_id).first()
            if not db_slab:
                raise HTTPException(status_code=404, detail="Tax slab not found")
            
            for key, value in data.items():
                setattr(db_slab, key, value)
            
            db.commit()
            db.refresh(db_slab)
            return {
                "success": True,
                "message": "Tax slab updated successfully",
                "resource_type": "tax_slabs",
                "data": TaxSlabResponse.from_orm(db_slab)
            }
        
        elif resource == ResourceType.ALLOWANCES:
            if not resource_id:
                raise HTTPException(status_code=400, detail="resource_id is required")
            
            db_allowance = db.query(AllowanceType).filter(AllowanceType.id == resource_id).first()
            if not db_allowance:
                raise HTTPException(status_code=404, detail="Allowance not found")
            
            for key, value in data.items():
                setattr(db_allowance, key, value)
            
            db.commit()
            db.refresh(db_allowance)
            return {
                "success": True,
                "message": "Allowance updated successfully",
                "resource_type": "allowances",
                "data": AllowanceTypeResponse.from_orm(db_allowance)
            }
        
        elif resource == ResourceType.DEDUCTIONS:
            if not resource_id:
                raise HTTPException(status_code=400, detail="resource_id is required")
            
            db_deduction = db.query(DeductionType).filter(DeductionType.id == resource_id).first()
            if not db_deduction:
                raise HTTPException(status_code=404, detail="Deduction not found")
            
            for key, value in data.items():
                setattr(db_deduction, key, value)
            
            db.commit()
            db.refresh(db_deduction)
            return {
                "success": True,
                "message": "Deduction updated successfully",
                "resource_type": "deductions",
                "data": DeductionTypeResponse.from_orm(db_deduction)
            }
        
        elif resource == ResourceType.SETTINGS:
            if not key:
                raise HTTPException(status_code=400, detail="key is required for settings")
            
            db_setting = db.query(SystemSettings).filter(SystemSettings.setting_key == key).first()
            if not db_setting:
                raise HTTPException(status_code=404, detail="Setting not found")
            
            for k, v in data.items():
                setattr(db_setting, k, v)
            
            db.commit()
            db.refresh(db_setting)
            return {
                "success": True,
                "message": "Setting updated successfully",
                "resource_type": "settings",
                "data": SystemSettingResponse.from_orm(db_setting)
            }
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update {resource.value}: {str(e)}"
        )


# ==================== UNIFIED DELETE ENDPOINT ====================

@router.delete("")
async def delete_admin_resource(
    resource: ResourceType = Query(..., description="Type of resource to delete"),
    resource_id: int = Query(..., description="ID of resource to delete"),
    db: Session = Depends(get_db)
):
    """
    Unified admin DELETE endpoint - Delete (deactivate) any admin resource
    
    Usage:
    - DELETE /api/admin?resource=tax-slabs&resource_id=1
    - DELETE /api/admin?resource=allowances&resource_id=2
    - DELETE /api/admin?resource=deductions&resource_id=3
    
    Note: This sets is_active = false, doesn't actually delete from database
    """
    
    try:
        if resource == ResourceType.TAX_SLABS:
            db_slab = db.query(TaxSlab).filter(TaxSlab.id == resource_id).first()
            if not db_slab:
                raise HTTPException(status_code=404, detail="Tax slab not found")
            
            db_slab.is_active = False
            db.commit()
            return {
                "success": True,
                "message": "Tax slab deleted successfully",
                "resource_type": "tax_slabs"
            }
        
        elif resource == ResourceType.ALLOWANCES:
            db_allowance = db.query(AllowanceType).filter(AllowanceType.id == resource_id).first()
            if not db_allowance:
                raise HTTPException(status_code=404, detail="Allowance not found")
            
            db_allowance.is_active = False
            db.commit()
            return {
                "success": True,
                "message": "Allowance deleted successfully",
                "resource_type": "allowances"
            }
        
        elif resource == ResourceType.DEDUCTIONS:
            db_deduction = db.query(DeductionType).filter(DeductionType.id == resource_id).first()
            if not db_deduction:
                raise HTTPException(status_code=404, detail="Deduction not found")
            
            db_deduction.is_active = False
            db.commit()
            return {
                "success": True,
                "message": "Deduction deleted successfully",
                "resource_type": "deductions"
            }
        
        elif resource == ResourceType.SETTINGS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Settings cannot be deleted, use PUT to update them"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete {resource.value}: {str(e)}"
        )

## ✅ **Summary of Changes**

### **Now You Have Only 4 Endpoints Total:**

# 1. **GET /api/admin** - Get any resource with dropdown filters
# 2. **POST /api/admin** - Create any resource with dropdown selection
# 3. **PUT /api/admin** - Update any resource with dropdown selection
# 4. **DELETE /api/admin** - Delete any resource with dropdown selection

### **All Operations Use Query Parameters:**

# GET    /api/admin?resource=tax-slabs&category=salaried&tax_year=2025-26
# POST   /api/admin?resource=tax-slabs  + Body
# PUT    /api/admin?resource=tax-slabs&resource_id=1  + Body
# DELETE /api/admin?resource=tax-slabs&resource_id=1