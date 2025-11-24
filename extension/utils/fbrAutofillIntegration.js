/**
 * FBR Autofill Integration for Content Script
 * This file contains the FBR-specific autofill logic
 * Add this to content.js or load it separately
 */

// ===== FBR FIELD MAPPING DATA =====
// Maps extracted data keys to potential FBR field codes.
// We use arrays to support mapping one data point to multiple potential fields across different tabs.
const FBR_SALARY_MAPPING = {
    // Salary Tab (114(1))
    'salary_details.annual_gross_salary': ['1000'],
    'salary_details.gross_salary': ['1000'],
    'salary_details.basic_salary': ['1009'],
    'salary_details.monthly_basic': ['1009'],

    // Allowances -> Can map to Salary Income (1049) OR Personal Expenses (7000 series)
    // This allows the same data to fill "House Rent Allowance" on Salary tab AND "Rent" on Expenses tab
    'allowances.house_rent': ['1049', '7051'], // 7051 = Rent
    'allowances.conveyance': ['1049', '7056', '7055'], // 7056 = Travelling, 7055 = Vehicle Maint
    'allowances.medical': ['1049', '7070'], // 7070 = Medical
    'allowances.utilities': ['1049', '7058', '7059', '7060'], // Electricity, Water, Gas
    'allowances.fuel': ['1049', '7055'], // Vehicle Running
    'allowances.entertainment': ['1049', '7087'], // Other Personal Expenses
    'allowances.other': ['1049', '7087'],

    // Deductions -> Tax & Wealth Statement
    'deductions.income_tax': ['9201', '7099'], // 9201 = Withholding Tax, 7099 = Outflows (generic)
    'deductions.provident_fund': ['319501', '7087'],
    'deductions.pension': ['9313'],
    'deductions.eobi': ['9002'],
    'deductions.social_security': ['9002'],
    'deductions.zakat': ['9001', '7076'] // 7076 = Donation/Zakat
};

// FBR Field descriptions for semantic matching fallback
const FBR_FIELD_DESCRIPTIONS = {
    '1000': ['Income from Salary', 'Annual Gross Salary', 'Gross Salary'],
    '1009': ['Pay, Wages or Other Remuneration', 'Basic Salary', 'Basic Pay'],
    '1049': ['Allowances', 'House Rent', 'Conveyance', 'Medical', 'Utilities'],
    '7051': ['Rent', 'House Rent'],
    '7056': ['Travelling', 'Conveyance'],
    '7055': ['Vehicle Running', 'Maintenance'],
    '7070': ['Medical', 'Hospitalization'],
    '7058': ['Electricity'],
    '7059': ['Water'],
    '7060': ['Gas'],
    '9201': ['Withholding Income Tax', 'Income Tax'],
    '319501': ['Contribution to Pension Fund', 'Provident Fund'],
    '9001': ['Zakat']
};

/**
 * Enhanced FBR-aware autofill function
 */
function performFBRAutofill(extractedData) {
    console.log('🚀 Starting FBR-Aware Autofill...');
    console.log('📦 Data:', extractedData);

    const results = {
        filled: [],
        failed: [],
        totalAttempts: 0
    };

    // Step 1: Flatten the data
    const flatData = flattenObject(extractedData);

    // Step 2: Calculate total allowances if needed
    if (extractedData.allowances) {
        const totalAllowances = calculateTotalAllowances(extractedData.allowances);
        if (totalAllowances > 0) {
            flatData['allowances_total'] = totalAllowances;
        }
    }

    // Step 3: Try to fill each field
    for (const [dataPath, value] of Object.entries(flatData)) {
        if (!value || value === 'Not found' || value === null || value === undefined) {
            continue;
        }

        // Get potential FBR field codes (ensure it's an array)
        let fbrCodes = FBR_SALARY_MAPPING[dataPath];
        if (!fbrCodes) continue;

        if (!Array.isArray(fbrCodes)) {
            fbrCodes = [fbrCodes];
        }

        // Try each code in the list
        for (const fbrCode of fbrCodes) {
            results.totalAttempts++;
            let field = null;
            let matchType = '';

            // Strategy A: Try exact FBR ID (Primary)
            const fieldId = `field_${fbrCode}_total`;
            field = document.getElementById(fieldId);

            if (field) {
                matchType = 'FBR_ID';
            } else {
                // Strategy B: Try finding by description/label (Fallback for localhost/changed IDs)
                // Only try this if we are desperate or on localhost
                if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
                    field = findFieldByDescription(fbrCode);
                    if (field) matchType = 'SEMANTIC';
                }
            }

            if (field) {
                try {
                    const cleanedValue = cleanValue(value);
                    fillField(field, cleanedValue);
                    results.filled.push({
                        dataPath,
                        fbrCode,
                        fieldId: field.id || 'unknown',
                        matchType,
                        value: cleanedValue
                    });
                    console.log(`✅ Filled ${field.id || 'field'} = ${cleanedValue} (${matchType} match for ${dataPath})`);
                } catch (error) {
                    results.failed.push({
                        dataPath,
                        fbrCode,
                        error: error.message
                    });
                }
            }
        }
    }

    console.log(`🎉 Autofill complete: ${results.filled.length} fields filled`);

    return {
        success: results.filled.length > 0,
        matchedFields: results.filled.length,
        totalAttempts: results.totalAttempts,
        filled: results.filled,
        failed: results.failed
    };
}

/**
 * Find a field by matching its label or placeholder against FBR descriptions
 */
function findFieldByDescription(fbrCode) {
    const descriptions = FBR_FIELD_DESCRIPTIONS[fbrCode];
    if (!descriptions) return null;

    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');

    for (const input of inputs) {
        const labelText = getLabelText(input).toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();

        for (const desc of descriptions) {
            const term = desc.toLowerCase();
            if (labelText.includes(term) ||
                placeholder.includes(term) ||
                name.includes(term) ||
                id.includes(term)) {
                return input;
            }
        }
    }
    return null;
}

/**
 * Get the label text for an input element
 */
function getLabelText(element) {
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent;
    }
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent;
    if (element.getAttribute('aria-label')) return element.getAttribute('aria-label');
    return '';
}

/**
 * Fill a field with proper React/Vue event handling
 */
function fillField(element, value) {
    if (!element) return;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    ).set;

    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(element, value);
    } else {
        element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    element.style.backgroundColor = '#d4edda';
    element.style.transition = 'background-color 0.3s';
    setTimeout(() => {
        element.style.backgroundColor = '';
    }, 1500);
}

/**
 * Flatten nested object
 */
function flattenObject(obj, prefix = '') {
    const flattened = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === 'document_id' || key === 'confidence') continue;
        const path = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(flattened, flattenObject(value, path));
        } else {
            flattened[path] = value;
        }
    }
    return flattened;
}

/**
 * Calculate total allowances
 */
function calculateTotalAllowances(allowances) {
    if (!allowances || typeof allowances !== 'object') return 0;
    let total = 0;
    for (const value of Object.values(allowances)) {
        const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num > 0) {
            total += num;
        }
    }
    return total;
}

/**
 * Clean value for form input
 */
function cleanValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        return value.replace(/Rs\.?|,|\s/g, '').trim();
    }
    return value;
}

// Expose to window
window.performFBRAutofill = performFBRAutofill;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { performFBRAutofill };
}
