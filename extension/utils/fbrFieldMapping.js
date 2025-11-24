/**
 * FBR IRIS Field Mapping Configuration
 * Maps extracted salary data to FBR form field codes and descriptions
 * 
 * This file contains the complete mapping of FBR field codes to their descriptions
 * and provides intelligent matching for autofill functionality.
 */

/**
 * Complete FBR Field Code Registry
 * Format: { code: "description", ... }
 */
export const FBR_FIELD_CODES = {
    // ========================================
    // EMPLOYMENT - SALARY (1000 series)
    // ========================================
    "1000": "Income from Salary",
    "1009": "Pay, Wages or Other Remuneration (Including Arrears of Salary)",
    "1049": "Allowances (Including Flying / Submarine Allowance)",
    "1059": "Expenditure Reimbursement",
    "1089": "Value of Perquisites (Including Transport Monetization for Government Servants)",
    "1099": "Profits in Lieu of or in Addition to Pay, Wages or Other Remuneration (Including Employment Termination Benefits)",

    // ========================================
    // PROPERTY (2000 series)
    // ========================================
    "2000": "Income / (Loss) from Property",
    "2029": "Total Receipts from Property",
    "2001": "Rent Received or Receivable",
    "2002": "1/10th of Amount not Adjustable against Rent",
    "2003": "Forfeited Deposit under a Contract for Sale of Property",
    "2004": "Recovery of Unpaid Irrecoverable Rent allowed as deduction",
    "2005": "Unpaid Liabilities exceeding three Years",
    "2099": "Total Deductions from Property",
    "2031": "1/5th of Rent of Building for Repairs",
    "2032": "Insurance Premium",
    "2033": "Local Rate / Tax / Charge / Cess",
    "2034": "Ground Rent",
    "2035": "Profit on Capital borrowed for Investment in Property",
    "2036": "Share in Rental Income Paid to HEFC / Banks",
    "2037": "Rent Collection Expenditure",
    "2038": "Legal Service Charges",
    "2039": "Amount claimed as Irrecoverable Rent",
    "2097": "Payment of Liabilities treated as Income",
    "2098": "Other Deductions against Rent",

    // ========================================
    // BUSINESS (3000 series)
    // ========================================
    "3000": "Income / (Loss) from Business",
    "3029": "Net Revenue (excluding Sales Tax, Federal Excise, Brokerage, Commission, Discount, Freight Outward)",
    "3009": "Gross Revenue (excluding Sales Tax, Federal Excise)",
    "3019": "Selling Expenses (Freight Outward, Brokerage, Commission, Discount, etc.)",
    "3030": "Cost of Sales / Services",
    "3039": "Opening Stock",
    "3059": "Net Purchases (excluding Sales Tax, Federal Excise)",
    "3071": "Salaries / Wages",
    "3072": "Fuel",
    "3073": "Power",
    "3074": "Gas",
    "3076": "Stores / Spares",
    "3077": "Repair / Maintenance",
    "3083": "Other Direct Expenses",
    "3087": "Accounting Amortization",
    "3088": "Accounting Depreciation",
    "3099": "Closing Stock",
    "3100": "Gross Profit / (Loss)",
    "3199": "Management, Administrative, Selling & Financial Expenses",
    "3151": "Rent",
    "3152": "Rates / Taxes / Cess",
    "3154": "Salaries / Wages / Perquisites / Benefits",
    "3155": "Travelling / Conveyance / Vehicles Running / Maintenance",
    "3158": "Electricity / Water / Gas",
    "3162": "Communication",
    "3165": "Repair / Maintenance",
    "3166": "Stationery / Printing / Photocopies / Office Supplies",
    "3168": "Advertisement / Publicity / Promotion",
    "3170": "Insurance",
    "3171": "Professional Charges",
    "3172": "Profit on Debt (Financial Charges / Markup / Interest)",
    "3174": "Donation / Charity",
    "3178": "Brokerage / Commission",
    "3180": "Other indirect Expenses",
    "3186": "Irrecoverable Debts Written off",
    "3187": "Obsolete Stocks / Stores / Spares / Fixed Assets Written off",
    "3195": "Accounting (Loss) on Sale of Intangibles",
    "319501": "Contribution to an Approved gratuity fund / Pension Fund / Superannuation Fund",
    "3196": "Accounting (Loss) on Sale of Assets",
    "3197": "Accounting Amortization",
    "3198": "Accounting Depreciation",
    "3200": "Accounting Profit / (Loss)",
    "3129": "Other Revenues",
    "3101": "Fee for Technical / Professional Services",
    "3115": "Accounting Gain on Sale of Intangibles",
    "3116": "Accounting Gain on Sale of Assets",
    "3128": "Others",
    "3131": "Share in untaxed Income from AOP",
    "3123": "Gain by builder/developer in excess of 10 times of tax liability under Rule b of Eleventh Schedule",
    "3141": "Share in Taxed Income from AOP",
    "3270": "Income / (Loss) from Business before adjustment of Admissible Depreciation / Initial Allowance / Amortization for current / previous years",
    "327017": "Unadjusted (Loss) from Business for 2017",
    "327018": "Unadjusted (Loss) from Business for 2018",
    "327019": "Unadjusted (Loss) from Business for 2019",
    "327020": "Unadjusted (Loss) from Business for 2020",
    "327021": "Unadjusted (Loss) from Business for 2021",
    "327022": "Unadjusted (Loss) from Business for 2022",

    // Business Assets / Equity / Liabilities
    "3349": "Total Assets",
    "3301": "Land",
    "3302": "Building (all types)",
    "3303": "Plant / Machinery / Equipment / Furniture (including fittings)",
    "3312": "Advances / Deposits / Prepayments",
    "3315": "Stocks / Stores / Spares",
    "3319": "Cash / Cash Equivalents",
    "3348": "Other Assets",
    "3399": "Total Equity / Liabilities",
    "3352": "Capital",
    "3371": "Long Term Borrowings / Debt / Loan",
    "3384": "Trade Creditors / Payables",
    "3398": "Other Liabilities",

    // ========================================
    // CAPITAL GAIN (4000 series)
    // ========================================
    "4000": "Gains / (Loss) from Capital Assets",
    "4006": "Consideration Received on Disposal of Securities held Long Term",
    "4016": "Cost of Acquisition of Securities including Ancillary Expenses held Long Term",
    "4017": "Net Gain / (Loss) on Securities held long term",
    "4026": "Consideration Received on Disposal of Securities held Short Term",
    "4036": "Cost of Acquisition of Securities including Ancillary Expenses held Short Term",
    "4037": "Net Gain / (Loss) on Securities held Short Term",

    // ========================================
    // OTHER SOURCES (5000 series)
    // ========================================
    "5000": "Income / (Loss) from Other Sources",
    "5029": "Receipts from Other Sources",
    "5003041": "Yield on Behbood Certificates / Pensioner's Benefit Account / Shuhada Family Benefit Account",
    "5002": "Royalty",
    "500312": "Profit on Debt (if amount u/s 7B exceeds 5 million)",
    "5016": "Loan, Advance, Deposit or Gift received in Cash",
    "5028": "Other Receipts",
    "5004": "Ground Rent",
    "5005": "Rent from sub lease of Land or Building",
    "5006": "Rent from lease of Building with Plant and Machinery",
    "5007": "Annuity / Pension",
    "5089": "Deductions from Other Sources",
    "5080": "Other Deductions",

    // ========================================
    // FOREIGN SOURCES / AGRICULTURE (6000 series)
    // ========================================
    "6000": "Foreign Income",
    "6029": "Foreign Property Income / (Loss)",
    "6039": "Foreign Business Income / (Loss)",
    "6049": "Foreign Capital Gains / (Loss)",
    "6059": "Foreign Other Sources Income / (Loss)",
    "6011": "Foreign Salary Income",
    "6100": "Agriculture Income",
    "9291": "Agricultural Income Tax Paid to Province(s)",

    // ========================================
    // CAPITAL ASSETS (7100 series)
    // ========================================
    "7100": "Agriculture Property excluding Farmhouse",
    "7101": "Farmhouse",
    "7102": "Residential Property",
    "7103": "Commercial Property",
    "7104": "Industrial Property",
    "7105": "Any other immovable capital asset",
    "7106": "Total Value of capital assets",
    "7107": "Total value of capital assets taxable under section 7E",
    "7108": "Deemed Income under section 7E",

    // ========================================
    // WEALTH STATEMENT - PERSONAL EXPENSES (7000 series)
    // ========================================
    "7089": "Personal Expenses",
    "7051": "Rent",
    "7052": "Rates / Taxes / Charge / Cess",
    "7055": "Vehicle Running / Maintenance",
    "7056": "Travelling",
    "7058": "Electricity",
    "7059": "Water",
    "7060": "Gas",
    "7061": "Telephone",
    "7066": "Asset Insurance / Security",
    "7070": "Medical",
    "7071": "Educational",
    "7072": "Club",
    "7073": "Functions / Gatherings",
    "7076": "Donation, Zakat, Annuity, Profit on Debt, Life Insurance Premium, etc.",
    "7087": "Other Personal / Household Expenses",
    "7088": "Contribution in Expenses by Family Members",

    // Wealth Statement - Assets/Liabilities
    "703001": "Net Assets Current Year",
    "703002": "Net Assets Previous Year",
    "703003": "Increase / Decrease in Assets",
    "7049": "Inflows",
    "7031": "Income Declared as per Return for the year subject to Normal Tax",
    "7032": "Income Declared as per Return for the year Exempt from Tax",
    "7033": "Income Attributable to Receipts, etc. Declared as per Return for the year subject to Final / Fixed Tax",
    "7034": "Adjustments in Inflows",
    "7035": "Foreign Remittance",
    "7036": "Inheritance",
    "7037": "Gift",
    "7038": "Gain on Disposal of Assets, excluding Capital Gain on Immovable Property",
    "7039": "Income Attributable to Receipts (Builders/Developers)",
    "7048": "Others",
    "7099": "Outflows",
    "7098": "Adjustments in Outflows",
    "7091": "Gift",
    "7092": "Loss on Disposal of Assets",
    "703000": "Unreconciled Amount",
    "703004": "Assets Transferred / Sold / Gifted / Donated during the year",

    // Personal Assets / Liabilities
    "7001": "Agricultural Property",
    "7002": "Commercial, Industrial, Residential Property (Non-Business)",
    "7003": "Business Capital",
    "7004": "Equipment (Non-Business)",
    "7005": "Animal (Non-Business)",
    "7006": "Investment (Non-Business) (Account / Annuity / Bond / Certificate / Debenture / Deposit / Fund / Instrument / Policy / Share / Stock / Unit, etc.)",
    "7007": "Debt (Non-Business) (Advance / Debt / Deposit / Prepayment / Receivable / Security)",
    "7008": "Motor Vehicle (Non-Business)",
    "7009": "Precious Possession",
    "7010": "Household Effect",
    "7011": "Personal Item",
    "7012": "Cash (Non-Business)",
    "7013": "Any Other Asset",
    "7014": "Assets in Others' Name",
    "7015": "Total Assets inside Pakistan",
    "7016": "Assets held outside Pakistan",
    "7018": "Capital or voting rights in foreign company",
    "7020": "Total Assets held outside pakistan",
    "7019": "Total Assets",
    "7021": "Credit (Non-Business) (Advance / Borrowing / Credit / Deposit / Loan / Mortgage / Overdraft / Payable)",
    "7029": "Total Liabilities",

    // ========================================
    // TAX CHARGEABLE / PAYMENTS (9000 series)
    // ========================================
    "920001": "Income Tax on working Capital u/s 99A of Ninth Schedule",

    // Deductible Allowances
    "9009": "Deductible Allowances",
    "9001": "Zakat u/s 60",
    "9002": "Workers Welfare Fund u/s 60A",
    "9008": "Educational Expenses u/s 60D",
    "900801": "No. of Children for whom tuition fee is paid",

    // Tax Credits
    "9329": "Tax Credits",
    "9311": "Tax Credit for Charitable Donations u/s 61",
    "9313": "Tax Credit for Contribution to Approved Pension Fund u/s 63",
    "9332": "Tax credit u/s 64D for POS machine",
    "931901": "Tax Credit for Certain Persons (Coal Mining Projects, Startups) u/s 65F",
    "931902": "Investment Tax Credit for Specified industrial undertaking u/s 65G",
    "931903": "Tax credit u/s 65G specified industrial Undertakings",
    "9320": "Tax Credit u/s 103",
    "9321": "Tax Credit for Tax Paid on Share Income from AOP",
    "9323": "Tax credit for Charitable Organizations u/s 100C",
    "9328": "Surrender of Tax Credit on Investments in Shares disposed off before time limit",
    "9331": "Tax Credit for Charitable Donations u/s 61 where the donation is made to associate",

    // Tax Reductions
    "9309": "Tax Reductions",
    "9302": "Tax Reduction for Full Time Teacher / Researcher (Except teachers of medical professions who derive income from private medical practice)",
    "930101": "Tax Reduction on Tax Charged on Behbood Certificates / Pensioner's Benefit Account in excess of applicable rate",
    "930701": "Tax Reduction on Capital Gain on Immovable Property under clause (9A), Part III, Second Schedule for Ex-Servicemen and serving personnel of Armed Forces and ex-employees and serving personnel of Federal & Provincial Government @50%",
    "930702": "Tax Reduction on Capital Gain on Immovable Property under clause (9A), Part III, Second Schedule for Ex-Servicemen and serving personnel of Armed Forces and ex-employees and serving personnel of Federal & Provincial Government @75%",

    // Computations
    "9200": "Tax Chargeable",
    "9202": "Normal Income Tax",
    "920100": "Final / Fixed / Minimum / Average / Relevant / Reduced Income Tax",
    "9201": "Withholding Income Tax",
    "9203": "Advance Income Tax",
    "9204": "Deferred Income Tax",
    "9210": "Refundable Income Tax"
};

/**
 * Mapping of extracted data fields to FBR field codes
 * This provides direct mapping for common salary slip fields
 */
export const SALARY_TO_FBR_MAPPING = {
    // Basic Salary Information
    "salary_details.basic_salary": ["1009", "3154"],
    "salary_details.gross_salary": ["1000", "1009"],
    "salary_details.annual_gross_salary": ["1000"],
    "salary_details.monthly_gross_salary": ["1000"],

    // Allowances
    "allowances.house_rent": ["1049"],
    "allowances.conveyance": ["1049"],
    "allowances.medical": ["1049"],
    "allowances.utilities": ["1049"],
    "allowances.entertainment": ["1049"],
    "allowances.fuel": ["1049"],
    "allowances.other": ["1049"],

    // Deductions
    "deductions.income_tax": ["9201"],
    "deductions.provident_fund": ["319501"],
    "deductions.eobi": ["9002"],
    "deductions.social_security": ["9002"],

    // Employee Information (for reference, not directly mapped to tax fields)
    "employee_name": null,
    "cnic": null,
    "employer_name": null,
    "designation": null,

    // Bank Details
    "bank_details.account_number": null,
    "bank_details.bank_name": null
};

/**
 * Semantic keyword mapping for intelligent field matching
 * Maps keywords to FBR field codes
 */
export const SEMANTIC_KEYWORDS = {
    // Salary related
    "salary": ["1000", "1009", "6011"],
    "wage": ["1009"],
    "remuneration": ["1009"],
    "pay": ["1009"],
    "basic": ["1009"],
    "gross": ["1000"],

    // Allowances
    "allowance": ["1049"],
    "flying": ["1049"],
    "submarine": ["1049"],
    "house rent": ["1049"],
    "conveyance": ["1049"],
    "medical allowance": ["1049"],

    // Reimbursements
    "reimbursement": ["1059"],
    "expenditure": ["1059"],

    // Perquisites
    "perquisite": ["1089"],
    "transport": ["1089"],
    "monetization": ["1089"],

    // Termination
    "termination": ["1099"],
    "severance": ["1099"],
    "gratuity": ["1099", "319501"],

    // Deductions
    "tax": ["9201"],
    "withholding": ["9201"],
    "income tax": ["9201"],
    "provident fund": ["319501"],
    "pension": ["9313", "319501"],
    "eobi": ["9002"],
    "workers welfare": ["9002"],
    "social security": ["9002"],
    "zakat": ["9001"],

    // Personal Expenses
    "rent": ["7051", "2001", "3151"],
    "electricity": ["7058", "3158"],
    "water": ["7059", "3158"],
    "gas": ["7060", "3158"],
    "telephone": ["7061", "3162"],
    "medical": ["7070"],
    "education": ["7071", "9008"],
    "vehicle": ["7055", "3155"],
    "travelling": ["7056", "3155"]
};

/**
 * Get FBR field code from field description
 * @param {string} description - Field description
 * @returns {string|null} - FBR field code or null
 */
export function getCodeFromDescription(description) {
    if (!description) return null;

    const normalizedDesc = description.toLowerCase().trim();

    // Exact match
    for (const [code, desc] of Object.entries(FBR_FIELD_CODES)) {
        if (desc.toLowerCase() === normalizedDesc) {
            return code;
        }
    }

    // Partial match
    for (const [code, desc] of Object.entries(FBR_FIELD_CODES)) {
        if (desc.toLowerCase().includes(normalizedDesc) ||
            normalizedDesc.includes(desc.toLowerCase())) {
            return code;
        }
    }

    return null;
}

/**
 * Get FBR field description from code
 * @param {string} code - FBR field code
 * @returns {string|null} - Field description or null
 */
export function getDescriptionFromCode(code) {
    return FBR_FIELD_CODES[code] || null;
}

/**
 * Find matching FBR field codes based on keywords
 * @param {string} keyword - Keyword to search
 * @returns {string[]} - Array of matching FBR field codes
 */
export function findFieldsByKeyword(keyword) {
    if (!keyword) return [];

    const normalizedKeyword = keyword.toLowerCase().trim();
    const matches = new Set();

    // Check semantic keywords
    for (const [key, codes] of Object.entries(SEMANTIC_KEYWORDS)) {
        if (normalizedKeyword.includes(key) || key.includes(normalizedKeyword)) {
            codes.forEach(code => matches.add(code));
        }
    }

    // Check field descriptions
    for (const [code, desc] of Object.entries(FBR_FIELD_CODES)) {
        if (desc.toLowerCase().includes(normalizedKeyword)) {
            matches.add(code);
        }
    }

    return Array.from(matches);
}

/**
 * Map extracted data field to FBR field codes
 * @param {string} dataField - Extracted data field name (e.g., "salary_details.basic_salary")
 * @returns {string[]} - Array of matching FBR field codes
 */
export function mapDataFieldToFBR(dataField) {
    if (!dataField) return [];

    // Direct mapping
    if (SALARY_TO_FBR_MAPPING[dataField]) {
        return SALARY_TO_FBR_MAPPING[dataField] || [];
    }

    // Try keyword matching
    const parts = dataField.split('.');
    const fieldName = parts[parts.length - 1];
    return findFieldsByKeyword(fieldName);
}

/**
 * Get field ID pattern for FBR form
 * @param {string} code - FBR field code
 * @returns {string} - Field ID pattern (e.g., "field_1009_total")
 */
export function getFieldIdPattern(code) {
    return `field_${code}_total`;
}

/**
 * Check if a DOM element matches an FBR field
 * @param {HTMLElement} element - DOM element
 * @param {string} code - FBR field code
 * @returns {boolean} - True if element matches the field
 */
export function isMatchingField(element, code) {
    if (!element || !code) return false;

    const fieldId = getFieldIdPattern(code);
    const description = getDescriptionFromCode(code);

    // Check ID
    if (element.id === fieldId) return true;

    // Check name attribute
    if (element.name && element.name.includes(code)) return true;

    // Check label
    const label = element.labels?.[0]?.textContent ||
        element.placeholder ||
        element.getAttribute('aria-label') ||
        element.title;

    if (label && description) {
        const normalizedLabel = label.toLowerCase().trim();
        const normalizedDesc = description.toLowerCase().trim();

        if (normalizedLabel.includes(normalizedDesc) ||
            normalizedDesc.includes(normalizedLabel)) {
            return true;
        }
    }

    return false;
}
