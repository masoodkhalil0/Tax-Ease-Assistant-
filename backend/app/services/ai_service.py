"""
AI Service for extracting tax-related data from documents
Uses OpenAI GPT-4 Vision for both image and PDF documents
"""
import os
import json
import base64
from openai import OpenAI
from typing import Dict, Optional, List
from pathlib import Path
import PyPDF2
from pdf2image import convert_from_path
from PIL import Image
import io

from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Prompt for extracting salary data
SALARY_EXTRACTION_PROMPT = """
You are a tax assistant helping Pakistani salaried employees file their taxes with FBR.

Analyze this document (salary slip, bank statement, or employment letter) and extract the following information in JSON format.

**IMPORTANT FOR BANK STATEMENTS:**
If this is a bank statement, look for:
- SALARY CREDITS: Look for regular monthly credits with descriptions like "SALARY", "SAL CR", "PAYROLL", "MONTHLY PAY", or credits from employer name
- RENT DEBITS: Regular debits for rent payments (look for "RENT", "LANDLORD", "HOUSE RENT")
- UTILITY PAYMENTS: Payments to LESCO, SNGPL, PTCL, K-Electric, etc.
- The LARGEST regular credit transaction is likely the monthly salary
- Pattern: If same amount credited every month = salary
- Calculate annual salary by: monthly_salary × 12

Extract the following in JSON format:

{
  "employee_name": "Account holder name from bank statement OR employee name from salary slip",
  "cnic": "13-digit CNIC if available",
  "employer_name": "Company name OR employer name appearing in salary credits",
  "designation": "Job title if mentioned",
  
  "salary_details": {
    "basic_salary": "Extract from salary slip OR if bank statement: estimate as 50-60% of gross salary",
    "gross_salary": "Total monthly salary from slip OR largest regular monthly credit in bank statement",
    "annual_gross_salary": "monthly gross salary × 12"
  },
  
  "allowances": {
    "house_rent": "From salary slip OR if bank statement: estimate as 40-45% of basic salary",
    "medical": "From salary slip OR estimate as 10% of basic if bank statement",
    "conveyance": "From salary slip OR standard Rs. 8000/month if bank statement",
    "utility": "From salary slip OR 0",
    "other": "Any other allowances"
  },
  
  "deductions": {
    "income_tax": "Tax deducted shown in salary slip OR look for 'TAX' debits in bank statement",
    "provident_fund": "PF deduction OR look for 'PROVIDENT' in bank statement",
    "eobi": "EOBI deduction if shown",
    "social_security": "Social security if shown"
  },
  
  "bank_details": {
    "account_number": "Bank account number",
    "bank_name": "Bank name (UBL, HBL, MCB, etc.)",
    "monthly_salary_credit": "Amount and date of monthly salary credit if bank statement",
    "total_credits": "Sum of all credits in the period",
    "total_debits": "Sum of all debits in the period"
  },
  
  "other_expenses": {
    "rent_paid": "Monthly rent amount - look for regular debits to landlord/rent in bank statement",
    "utilities_paid": "Utility bills - sum of LESCO, SNGPL, PTCL, K-Electric payments",
    "education": "Education expenses if visible",
    "medical_expenses": "Medical expenses if visible"
  },
  
  "period": "Statement period OR salary month",
  "document_type": "salary slip OR bank statement OR employment letter",
  "confidence": "High/Medium/Low based on data clarity"
}

**EXTRACTION STRATEGY:**

For BANK STATEMENTS:
1. Identify SALARY CREDITS:
   - Look for credits with "SALARY", "SAL", "PAYROLL" in description
   - Or look for largest regular monthly credit (likely salary)
   - Check if employer name appears in credit description
   - Example: "Credit: Rs. 85,000 - SALARY FROM ABC COMPANY"

2. Calculate SALARY BREAKDOWN:
   - Gross Salary = Monthly salary credit amount
   - Basic Salary ≈ 50-60% of gross (Pakistani standard)
   - House Rent Allowance ≈ 40-45% of basic
   - Medical Allowance ≈ 10% of basic
   - Conveyance ≈ Rs. 8000/month (standard)

3. Find EXPENSES:
   - Rent: Look for regular debits with "RENT", "LANDLORD"
   - Utilities: LESCO, SNGPL, PTCL, K-Electric, Water Board
   - Tax: Look for "TAX" debits

4. IMPORTANT: 
   - Use actual numbers found in transactions
   - If you can't find salary slip data, USE TRANSACTION PATTERNS
   - Don't just say "Not found" - analyze and estimate from transactions!

For SALARY SLIPS:
- Extract exact amounts shown
- All fields should have data
- Don't estimate if actual data exists

**Response Rules:**
1. Always extract available data - don't use "Not found" if data exists in transactions
2. For bank statements: ANALYZE TRANSACTION PATTERNS to find salary
3. All amounts must be NUMBERS ONLY (no Rs., commas, or text)
4. If you see a regular monthly credit of Rs. 85,000, that's the gross salary
5. Calculate basic, allowances from gross using Pakistani standards
6. Be intelligent about transaction patterns

Respond with ONLY valid JSON, no additional text.
"""


def check_pdf_has_text(pdf_path: str) -> bool:
    """
    Check if PDF has extractable text
    Returns True if text found, False if image-based PDF
    """
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            # Check first 2 pages
            for page_num in range(min(2, len(pdf_reader.pages))):
                text += pdf_reader.pages[page_num].extract_text()
            
            # If we got meaningful text (more than 50 chars), it's text-based
            return len(text.strip()) > 50
    except Exception as e:
        print(f"Error checking PDF text: {e}")
        return False


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from text-based PDF file"""
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")


def pdf_to_images(pdf_path: str, max_pages: int = 3) -> List[Image.Image]:
    """
    Convert PDF pages to images for Vision API
    Only converts first few pages to save costs
    """
    try:
        # Convert PDF to images (first 3 pages only to save costs)
        images = convert_from_path(
            pdf_path,
            dpi=200,  # Good quality for text recognition
            first_page=1,
            last_page=max_pages
        )
        return images
    except Exception as e:
        raise Exception(f"Error converting PDF to images: {str(e)}")


def image_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffered = io.BytesIO()
    # Convert to RGB if necessary
    if image.mode in ('RGBA', 'LA', 'P'):
        image = image.convert('RGB')
    image.save(buffered, format="JPEG", quality=85)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')


def encode_image_file_to_base64(image_path: str) -> str:
    """Convert image file to base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')
    

def analyze_bank_transactions_post_processing(extracted_data: dict) -> dict:
    """
    Post-process bank statement data to make intelligent estimates
    This runs AFTER AI extraction to fill in missing salary data
    """
    # If most salary fields are "Not found" but we have bank details
    bank_details = extracted_data.get("bank_details", {})
    salary_details = extracted_data.get("salary_details", {})
    
    # Check if we have any transaction info but no salary
    if (bank_details.get("transactions") and 
        bank_details.get("transactions") != "Not found" and
        salary_details.get("gross_salary") == "Not found"):
        
        print("🔍 Bank statement detected with transactions - attempting intelligent estimation")
        
        # For Pakistani salaried employees, make educated estimates
        # Based on account type and transaction patterns
        
        # Estimate based on standard Pakistani salary structures
        # Average tech/corporate salary in Pakistan: 50K-150K
        estimated_gross = 75000  # Conservative middle estimate
        
        extracted_data["salary_details"] = {
            "basic_salary": int(estimated_gross * 0.55),  # 55% of gross
            "gross_salary": estimated_gross,
            "annual_gross_salary": estimated_gross * 12
        }
        
        extracted_data["allowances"] = {
            "house_rent": int(estimated_gross * 0.55 * 0.45),  # 45% of basic
            "medical": int(estimated_gross * 0.55 * 0.10),  # 10% of basic
            "conveyance": 8000,  # Standard in Pakistan
            "utility": int(estimated_gross * 0.55 * 0.10),  # 10% of basic
            "other": 0
        }
        
        extracted_data["confidence"] = "Low - Estimated from standard Pakistani salary structure"
        print("⚠️ Used estimation model - recommend uploading actual salary slip for accuracy")
    
    return extracted_data


async def extract_salary_data_from_document(file_path: str, file_type: str) -> Dict:
    """
    Extract salary and tax-related data from document using AI
    Automatically detects if PDF is text-based or image-based
    
    Args:
        file_path: Path to the document file
        file_type: Type of file (pdf, jpg, jpeg)
        
    Returns:
        Dictionary containing extracted data
    """
    
    if not settings.OPENAI_API_KEY:
        raise Exception("OpenAI API key not configured")
    
    try:
        if file_type == "pdf":
            # First, check if PDF has extractable text
            has_text = check_pdf_has_text(file_path)
            
            if has_text:
                # Text-based PDF - extract text and use cheaper model
                print("📄 Text-based PDF detected - using text extraction")
                pdf_text = extract_text_from_pdf(file_path)
                
                response = client.chat.completions.create(
                    model="gpt-4o",  # or gpt-4-turbo for cheaper
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a tax assistant specializing in Pakistani tax returns. Extract financial data accurately."
                        },
                        {
                            "role": "user",
                            "content": f"{SALARY_EXTRACTION_PROMPT}\n\nDocument Text:\n{pdf_text}"
                        }
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
            else:
                # Image-based PDF (scanned) - use Vision API
                print("🖼️ Image-based PDF detected - using Vision API")
                
                # Convert PDF pages to images
                images = pdf_to_images(file_path, max_pages=2)  # Only first 2 pages to save costs
                
                # Prepare content with all images
                content = [
                    {
                        "type": "text",
                        "text": SALARY_EXTRACTION_PROMPT
                    }
                ]
                
                # Add each page as an image
                for idx, img in enumerate(images):
                    base64_image = image_to_base64(img)
                    content.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                            "detail": "high"  # High detail for better text recognition
                        }
                    })
                    print(f"📄 Added page {idx + 1} to analysis")
                
                response = client.chat.completions.create(
                    model="gpt-4o",  # Vision model
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a tax assistant specializing in Pakistani tax returns. Extract financial data accurately from images."
                        },
                        {
                            "role": "user",
                            "content": content
                        }
                    ],
                    temperature=0.1,
                    max_tokens=2000,
                    response_format={"type": "json_object"}
                )
        
        else:  # jpg, jpeg - use vision model directly
            print("🖼️ Image file - using Vision API")
            base64_image = encode_image_file_to_base64(file_path)
            
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a tax assistant specializing in Pakistani tax returns. Extract financial data accurately from images."
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": SALARY_EXTRACTION_PROMPT
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                temperature=0.1,
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
        
        # At the end of extract_salary_data_from_document, before returning:

        # Parse the response
        extracted_data = json.loads(response.choices[0].message.content)

        # Post-process for bank statements
        if extracted_data.get("document_type") == "bank statement":
            extracted_data = analyze_bank_transactions_post_processing(extracted_data)

        print(f"✅ Extraction complete - {response.usage.total_tokens} tokens used")

        return {
            "success": True,
            "data": extracted_data,
            "tokens_used": response.usage.total_tokens
        }
        
    except Exception as e:
        print(f"❌ Error during extraction: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "data": None
        }


async def search_in_documents(query: str, document_texts: list) -> Dict:
    """
    Search for specific information across multiple documents
    
    Args:
        query: User's search query (e.g., "What was my rent in January?")
        document_texts: List of extracted document texts
        
    Returns:
        Dictionary with search results
    """
    
    if not settings.OPENAI_API_KEY:
        raise Exception("OpenAI API key not configured")
    
    try:
        # Combine all document texts
        combined_text = "\n\n---DOCUMENT SEPARATOR---\n\n".join(document_texts)
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that searches through salary and expense documents to answer user questions. Provide specific amounts and dates when available."
                },
                {
                    "role": "user",
                    "content": f"Search Query: {query}\n\nDocuments:\n{combined_text}\n\nPlease answer the query based on the documents. If the information is not found, say so clearly."
                }
            ],
            temperature=0.3
        )
        
        return {
            "success": True,
            "answer": response.choices[0].message.content
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "answer": None
        }