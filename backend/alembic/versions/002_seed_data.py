"""seed initial data - Pakistan FBR tax data FY 2025-26

Revision ID: 002
Revises: 001
Create Date: 2024-01-01 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Insert Tax Slabs for Salaried Persons (FY 2025-26) - UPPERCASE
    op.execute("""
        INSERT INTO tax_slabs (category, tax_year, min_income, max_income, fixed_tax, tax_rate, description, is_active)
        VALUES
        ('SALARIED', '2025-26', 0, 600000, 0, 0, 'No tax up to Rs. 600,000', true),
        ('SALARIED', '2025-26', 600001, 1200000, 0, 1, '1% of amount exceeding Rs. 600,000', true),
        ('SALARIED', '2025-26', 1200001, 2200000, 6000, 11, 'Rs. 6,000 + 11% of amount exceeding Rs. 1,200,000', true),
        ('SALARIED', '2025-26', 2200001, 3200000, 116000, 23, 'Rs. 116,000 + 23% of amount exceeding Rs. 2,200,000', true),
        ('SALARIED', '2025-26', 3200001, 4100000, 346000, 30, 'Rs. 346,000 + 30% of amount exceeding Rs. 3,200,000', true),
        ('SALARIED', '2025-26', 4100001, NULL, 616000, 35, 'Rs. 616,000 + 35% of amount exceeding Rs. 4,100,000', true)
    """)
    
    # Insert Allowance Types (FY 2025-26) - UPPERCASE
    op.execute("""
        INSERT INTO allowance_types (name, description, is_fully_exempt, exempt_percentage, max_exempt_amount, applicable_category, is_active)
        VALUES
        ('House Rent Allowance', '45% of basic salary or actual rent paid (whichever is lower) — FY 2025-26', false, 45, NULL, 'SALARIED', true),
        ('Medical Allowance', '10% of basic salary (minimum Rs. 10,000 per month) — FY 2025-26', false, 10, 120000, 'SALARIED', true),
        ('Conveyance Allowance', 'Up to Rs. 8,000 per month for transport — FY 2025-26', true, 0, 96000, 'SALARIED', true),
        ('Utility Allowance', 'Electricity, gas, water bills — FY 2025-26', false, 10, NULL, 'SALARIED', true)
    """)
    
    # Insert Deduction Types (FY 2025-26) - UPPERCASE
    op.execute("""
        INSERT INTO deduction_types (name, description, max_deduction_percentage, max_deduction_amount, applicable_category, is_active)
        VALUES
        ('Charitable Donations', 'Donations to approved charitable organizations — FY 2025-26', 30, NULL, 'SALARIED', true),
        ('Zakat', 'Islamic religious obligation — FY 2025-26', 100, NULL, 'SALARIED', true),
        ('Life Insurance Premium', 'Premium paid for life insurance — FY 2025-26', NULL, 150000, 'SALARIED', true)
    """)
    
    # Insert System Settings (FY 2025-26)
    op.execute("""
        INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
        VALUES
        ('current_tax_year', '2025-26', 'string', 'Current active tax year'),
        ('max_file_size_mb', '10', 'number', 'Maximum file upload size in MB'),
        ('allowed_file_types', 'pdf,jpg,jpeg', 'string', 'Allowed file extensions for upload')
    """)
    
    # Insert Admin User
    op.execute("""
        INSERT INTO users (username, email, hashed_password, full_name, is_admin, is_active)
        VALUES
        ('admin', 'admin@taxease.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eCgbOJZwFvXq', 'System Administrator', true, true)
    """)


def downgrade():
    # Delete seeded data
    op.execute("DELETE FROM users WHERE username = 'admin'")
    op.execute("DELETE FROM system_settings")
    op.execute("DELETE FROM deduction_types")
    op.execute("DELETE FROM allowance_types")
    op.execute("DELETE FROM tax_slabs WHERE tax_year = '2025-26'")