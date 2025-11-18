"""
Seed script to populate initial data for TaxEase
Run this after creating database tables: python seed_data.py
"""
from app.database import SessionLocal, engine, Base
from app.models import TaxSlab, AllowanceType, DeductionType, SystemSettings, TaxCategory, User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")

def seed_tax_slabs():
    """Seed Pakistan FBR Tax Slabs for Salaried Persons (FY 2025-26)"""
    db = SessionLocal()
    
    print("\n📊 Seeding Tax Slabs for Salaried Persons (2025-26)...")
    
    slabs = [
        {
            "category": TaxCategory.SALARIED,
            "tax_year": "2025-26",
            "min_income": 0,
            "max_income": 600000,
            "fixed_tax": 0,
            "tax_rate": 0,
            "description": "No tax up to Rs. 600,000"
        },
        {
            "category": TaxCategory.SALARIED,
            "tax_year": "2025-26",
            "min_income": 600001,
            "max_income": 1200000,
            "fixed_tax": 0,
            "tax_rate": 1,
            "description": "1% of amount exceeding Rs. 600,000"
        },
        {
            "category": TaxCategory.SALARIED,
            "tax_year": "2025-26",
            "min_income": 1200001,
            "max_income": 2200000,
            "fixed_tax": 6000,
            "tax_rate": 11,
            "description": "Rs. 6,000 + 11% of amount exceeding Rs. 1,200,000"
        },
        {
            "category": TaxCategory.SALARIED,
            "tax_year": "2025-26",
            "min_income": 2200001,
            "max_income": 3200000,
            "fixed_tax": 116000,
            "tax_rate": 23,
            "description": "Rs. 116,000 + 23% of amount exceeding Rs. 2,200,000"
        },
        {
            "category": TaxCategory.SALARIED,
            "tax_year": "2025-26",
            "min_income": 3200001,
            "max_income": 4100000,
            "fixed_tax": 346000,
            "tax_rate": 30,
            "description": "Rs. 346,000 + 30% of amount exceeding Rs. 3,200,000"
        },
        {
            "category": TaxCategory.SALARIED,
            "tax_year": "2025-26",
            "min_income": 4100001,
            "max_income": None,
            "fixed_tax": 616000,
            "tax_rate": 35,
            "description": "Rs. 616,000 + 35% of amount exceeding Rs. 4,100,000"
        }
    ]
    
    for slab_data in slabs:
        slab = TaxSlab(**slab_data)
        db.add(slab)
    
    db.commit()
    print(f"✅ Added {len(slabs)} tax slabs")
    db.close()

def seed_allowances():
    """Seed common allowances for salaried persons (values unchanged for 2025-26)"""
    db = SessionLocal()
    
    print("\n💰 Seeding Allowance Types (2025-26)...")
    
    allowances = [
        {
            "name": "House Rent Allowance",
            "description": "45% of basic salary or actual rent paid (whichever is lower) — FY 2025-26",
            "is_fully_exempt": False,
            "exempt_percentage": 45,
            "applicable_category": TaxCategory.SALARIED
        },
        {
            "name": "Medical Allowance",
            "description": "10% of basic salary (minimum Rs. 10,000 per month) — FY 2025-26",
            "is_fully_exempt": False,
            "exempt_percentage": 10,
            "max_exempt_amount": 120000,
            "applicable_category": TaxCategory.SALARIED
        },
        {
            "name": "Conveyance Allowance",
            "description": "Up to Rs. 8,000 per month for transport — FY 2025-26",
            "is_fully_exempt": True,
            "max_exempt_amount": 96000,
            "applicable_category": TaxCategory.SALARIED
        },
        {
            "name": "Utility Allowance",
            "description": "Electricity, gas, water bills — FY 2025-26",
            "is_fully_exempt": False,
            "exempt_percentage": 10,
            "applicable_category": TaxCategory.SALARIED
        }
    ]
    
    for allowance_data in allowances:
        allowance = AllowanceType(**allowance_data)
        db.add(allowance)
    
    db.commit()
    print(f"✅ Added {len(allowances)} allowance types")
    db.close()

def seed_deductions():
    """Seed common deductions (values unchanged for 2025-26)"""
    db = SessionLocal()
    
    print("\n📉 Seeding Deduction Types (2025-26)...")
    
    deductions = [
        {
            "name": "Charitable Donations",
            "description": "Donations to approved charitable organizations — FY 2025-26",
            "max_deduction_percentage": 30,
            "applicable_category": TaxCategory.SALARIED
        },
        {
            "name": "Zakat",
            "description": "Islamic religious obligation — FY 2025-26",
            "max_deduction_percentage": 100,
            "applicable_category": TaxCategory.SALARIED
        },
        {
            "name": "Life Insurance Premium",
            "description": "Premium paid for life insurance — FY 2025-26",
            "max_deduction_amount": 150000,
            "applicable_category": TaxCategory.SALARIED
        }
    ]
    
    for deduction_data in deductions:
        deduction = DeductionType(**deduction_data)
        db.add(deduction)
    
    db.commit()
    print(f"✅ Added {len(deductions)} deduction types")
    db.close()

def seed_system_settings():
    """Seed system settings"""
    db = SessionLocal()
    
    print("\n⚙️  Seeding System Settings...")
    
    settings = [
        {
            "setting_key": "current_tax_year",
            "setting_value": "2025-26",
            "setting_type": "string",
            "description": "Current active tax year"
        },
        {
            "setting_key": "max_file_size_mb",
            "setting_value": "10",
            "setting_type": "number",
            "description": "Maximum file upload size in MB"
        },
        {
            "setting_key": "allowed_file_types",
            "setting_value": "pdf,png,jpg,jpeg,xlsx,csv",
            "setting_type": "string",
            "description": "Allowed file extensions for upload"
        }
    ]
    
    for setting_data in settings:
        setting = SystemSettings(**setting_data)
        db.add(setting)
    
    db.commit()
    print(f"✅ Added {len(settings)} system settings")
    db.close()

def create_admin_user():
    """Create default admin user"""
    db = SessionLocal()
    
    print("\n👤 Creating Admin User...")
    
    # Check if admin already exists
    existing = db.query(User).filter(User.username == "admin").first()
    if existing:
        print("⚠️  Admin user already exists!")
        db.close()
        return
    
    admin = User(
        username="admin",
        email="admin@taxease.com",
        hashed_password="admin123",
        full_name="System Administrator",
        is_admin=True,
        is_active=True
    )
    
    db.add(admin)
    db.commit()
    
    print("✅ Admin user created!")
    print("   Username: admin")
    print("   Password: admin123")
    print("   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!")
    
    db.close()

if __name__ == "__main__":
    print("🌱 Starting TaxEase Database Seeding...\n")
    
    # Create tables first
    create_tables()
    
    # Seed data
    seed_tax_slabs()
    seed_allowances()
    seed_deductions()
    seed_system_settings()
    create_admin_user()
    
    print("\n🎉 Database seeding completed successfully!")
    print("\n📝 Next steps:")
    print("   1. Start your FastAPI server: python app/main.py")
    print("   2. Login to admin panel with username: admin, password: admin123")
    print("   3. Configure additional settings as needed")
