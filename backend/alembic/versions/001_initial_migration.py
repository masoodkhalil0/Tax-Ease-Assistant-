"""initial migration - create all tables

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_admin', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('cnic', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Create documents table
    op.create_table('documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='uploaded'),
        sa.Column('extracted_data', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)

    # Create tax_slabs table
    op.create_table('tax_slabs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('tax_year', sa.String(length=10), nullable=False),
        sa.Column('min_income', sa.Float(), nullable=False),
        sa.Column('max_income', sa.Float(), nullable=True),
        sa.Column('fixed_tax', sa.Float(), nullable=True, server_default='0'),
        sa.Column('tax_rate', sa.Float(), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tax_slabs_id'), 'tax_slabs', ['id'], unique=False)

    # Create allowance_types table
    op.create_table('allowance_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_fully_exempt', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('exempt_percentage', sa.Float(), nullable=True, server_default='0'),
        sa.Column('max_exempt_amount', sa.Float(), nullable=True),
        sa.Column('applicable_category', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_allowance_types_id'), 'allowance_types', ['id'], unique=False)

    # Create deduction_types table
    op.create_table('deduction_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('max_deduction_percentage', sa.Float(), nullable=True),
        sa.Column('max_deduction_amount', sa.Float(), nullable=True),
        sa.Column('applicable_category', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_deduction_types_id'), 'deduction_types', ['id'], unique=False)

    # Create system_settings table
    op.create_table('system_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('setting_key', sa.String(length=100), nullable=False),
        sa.Column('setting_value', sa.Text(), nullable=False),
        sa.Column('setting_type', sa.String(length=50), nullable=True, server_default='string'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('setting_key')
    )
    op.create_index(op.f('ix_system_settings_id'), 'system_settings', ['id'], unique=False)
    op.create_index(op.f('ix_system_settings_setting_key'), 'system_settings', ['setting_key'], unique=True)

    # Create tax_calculations table
    op.create_table('tax_calculations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('document_id', sa.Integer(), nullable=True),
        sa.Column('employee_name', sa.String(length=255), nullable=True),
        sa.Column('employer_name', sa.String(length=255), nullable=True),
        sa.Column('cnic', sa.String(length=20), nullable=True),
        sa.Column('gross_salary', sa.Float(), nullable=False),
        sa.Column('basic_salary', sa.Float(), nullable=True),
        sa.Column('allowances', sa.Float(), nullable=True, server_default='0'),
        sa.Column('tax_already_paid', sa.Float(), nullable=True, server_default='0'),
        sa.Column('charity_donations', sa.Float(), nullable=True, server_default='0'),
        sa.Column('other_deductions', sa.Float(), nullable=True, server_default='0'),
        sa.Column('taxable_income', sa.Float(), nullable=False),
        sa.Column('calculated_tax', sa.Float(), nullable=False),
        sa.Column('tax_due', sa.Float(), nullable=False),
        sa.Column('tax_slab', sa.String(length=100), nullable=True),
        sa.Column('tax_year', sa.String(length=10), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tax_calculations_id'), 'tax_calculations', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_tax_calculations_id'), table_name='tax_calculations')
    op.drop_table('tax_calculations')
    op.drop_index(op.f('ix_system_settings_setting_key'), table_name='system_settings')
    op.drop_index(op.f('ix_system_settings_id'), table_name='system_settings')
    op.drop_table('system_settings')
    op.drop_index(op.f('ix_deduction_types_id'), table_name='deduction_types')
    op.drop_table('deduction_types')
    op.drop_index(op.f('ix_allowance_types_id'), table_name='allowance_types')
    op.drop_table('allowance_types')
    op.drop_index(op.f('ix_tax_slabs_id'), table_name='tax_slabs')
    op.drop_table('tax_slabs')
    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_table('documents')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')