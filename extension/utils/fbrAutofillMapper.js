/**
 * Enhanced Autofill Mapper for FBR IRIS Forms
 * Uses dynamic field code and description matching
 */

// Import FBR field mapping (will be loaded via script tag in manifest)
// For now, we'll inline the key functions

/**
 * Enhanced autofill mapper that uses both field codes and descriptions
 * @param {Object} extractedData - Data extracted from salary slip
 * @param {Array} domFields - Available DOM fields from the page
 * @returns {Array} - Array of {element, value, matchType} objects
 */
export function mapFieldsWithFBR(extractedData, domFields) {
    console.log('🔍 Starting FBR-aware field mapping...');
    console.log('📦 Extracted data:', extractedData);
    console.log('🎯 Available DOM fields:', domFields.length);

    const mappings = [];

    // Step 1: Try direct FBR field code matching
    const codeMatches = matchByFieldCode(extractedData, domFields);
    mappings.push(...codeMatches);
    console.log(`✅ Found ${codeMatches.length} code-based matches`);

    // Step 2: Try description/semantic matching
    const descMatches = matchByDescription(extractedData, domFields, mappings);
    mappings.push(...descMatches);
    console.log(`✅ Found ${descMatches.length} description-based matches`);

    // Step 3: Try fuzzy/heuristic matching for remaining fields
    const fuzzyMatches = matchByHeuristics(extractedData, domFields, mappings);
    mappings.push(...fuzzyMatches);
    console.log(`✅ Found ${fuzzyMatches.length} heuristic matches`);

    console.log(`🎉 Total mappings found: ${mappings.length}`);
    return mappings;
}

/**
 * Match fields by FBR field codes (e.g., field_1009_total)
 */
function matchByFieldCode(data, domFields) {
    const matches = [];

    // Define mappings from data fields to FBR codes
    const dataToFBRCode = {
        // Salary fields
        'salary_details.annual_gross_salary': '1000',
        'salary_details.gross_salary': '1000',
        'salary_details.basic_salary': '1009',
        'salary_details.monthly_basic': '1009',

        // Allowances - all map to 1049
        'allowances.house_rent': '1049',
        'allowances.conveyance': '1049',
        'allowances.medical': '1049',
        'allowances.utilities': '1049',
        'allowances.fuel': '1049',
        'allowances.entertainment': '1049',
        'allowances.other': '1049',

        // Calculate total allowances
        'allowances_total': '1049',

        // Deductions
        'deductions.income_tax': '9201',
        'deductions.provident_fund': '319501',
        'deductions.pension': '9313',
        'deductions.eobi': '9002',
        'deductions.social_security': '9002',
        'deductions.zakat': '9001'
    };

    // Flatten the extracted data
    const flatData = flattenObject(data);

    // Try to match each data field
    for (const [dataPath, value] of Object.entries(flatData)) {
        if (value === null || value === undefined || value === '' || value === 'Not found') {
            continue;
        }

        const fbrCode = dataToFBRCode[dataPath];
        if (!fbrCode) continue;

        // Look for field with this code
        const fieldId = `field_${fbrCode}_total`;
        const field = domFields.find(f => f.id === fieldId);

        if (field) {
            matches.push({
                element: field.element,
                value: cleanValue(value),
                matchType: 'FBR_CODE',
                confidence: 1.0,
                dataPath,
                fbrCode,
                fieldId
            });
            console.log(`✅ Code match: ${dataPath} → ${fieldId} (${value})`);
        }
    }

    // Special case: Calculate total allowances if not already present
    if (data.allowances && !flatData['allowances_total']) {
        const totalAllowances = calculateTotalAllowances(data.allowances);
        if (totalAllowances > 0) {
            const field = domFields.find(f => f.id === 'field_1049_total');
            if (field) {
                matches.push({
                    element: field.element,
                    value: totalAllowances,
                    matchType: 'FBR_CODE_CALCULATED',
                    confidence: 1.0,
                    dataPath: 'allowances_total',
                    fbrCode: '1049',
                    fieldId: 'field_1049_total'
                });
                console.log(`✅ Calculated allowances total: ${totalAllowances} → field_1049_total`);
            }
        }
    }

    return matches;
}

/**
 * Match fields by description/semantic meaning
 */
function matchByDescription(data, domFields, existingMappings) {
    const matches = [];
    const mappedElements = new Set(existingMappings.map(m => m.element));

    // Semantic keywords for matching
    const semanticMap = {
        'salary': ['salary', 'pay', 'wage', 'remuneration', 'gross', 'income from salary'],
        'basic_salary': ['basic', 'basic salary', 'basic pay'],
        'allowance': ['allowance', 'allowances'],
        'house_rent': ['house rent', 'rent allowance', 'hra'],
        'medical': ['medical', 'medical allowance'],
        'conveyance': ['conveyance', 'transport', 'travel allowance'],
        'tax': ['tax', 'income tax', 'withholding'],
        'provident': ['provident', 'pf', 'pension fund'],
        'eobi': ['eobi', 'social security']
    };

    const flatData = flattenObject(data);

    for (const [dataPath, value] of Object.entries(flatData)) {
        if (value === null || value === undefined || value === '' || value === 'Not found') {
            continue;
        }

        // Extract the field name from path
        const fieldName = dataPath.split('.').pop();
        const keywords = semanticMap[fieldName] || [fieldName.replace(/_/g, ' ')];

        // Try to find matching DOM field
        for (const domField of domFields) {
            if (mappedElements.has(domField.element)) continue;

            const searchText = domField.searchableText;
            const matched = keywords.some(keyword =>
                searchText.includes(keyword.toLowerCase())
            );

            if (matched) {
                matches.push({
                    element: domField.element,
                    value: cleanValue(value),
                    matchType: 'SEMANTIC',
                    confidence: 0.8,
                    dataPath,
                    keywords: keywords.join(', ')
                });
                mappedElements.add(domField.element);
                console.log(`✅ Semantic match: ${dataPath} → ${domField.id} (${value})`);
                break;
            }
        }
    }

    return matches;
}

/**
 * Match fields using heuristics (fuzzy matching, partial matches)
 */
function matchByHeuristics(data, domFields, existingMappings) {
    const matches = [];
    const mappedElements = new Set(existingMappings.map(m => m.element));

    const flatData = flattenObject(data);

    for (const [dataPath, value] of Object.entries(flatData)) {
        if (value === null || value === undefined || value === '' || value === 'Not found') {
            continue;
        }

        const fieldName = dataPath.split('.').pop().replace(/_/g, ' ');

        for (const domField of domFields) {
            if (mappedElements.has(domField.element)) continue;

            // Calculate similarity score
            const score = calculateSimilarity(fieldName, domField.searchableText);

            if (score > 0.6) {
                matches.push({
                    element: domField.element,
                    value: cleanValue(value),
                    matchType: 'HEURISTIC',
                    confidence: score,
                    dataPath,
                    similarity: score
                });
                mappedElements.add(domField.element);
                console.log(`✅ Heuristic match: ${dataPath} → ${domField.id} (score: ${score.toFixed(2)})`);
                break;
            }
        }
    }

    return matches;
}

/**
 * Flatten nested object into dot-notation paths
 */
function flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const [key, value] of Object.entries(obj)) {
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
        const num = parseFloat(value);
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
        // Remove currency symbols, commas
        return value.replace(/[Rs.,\s]/g, '').trim();
    }
    return value;
}

/**
 * Calculate similarity between two strings (simple Jaccard similarity)
 */
function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
}

/**
 * Main autofill function
 */
export async function performAutofill(extractedData) {
    console.log('🚀 Starting FBR Autofill Process...');

    // Scan for all input fields
    const domFields = scanForFields();
    console.log(`Found ${domFields.length} potential fields`);

    // Log available fields for debugging
    console.log('Available DOM fields:', domFields.map(f => ({
        id: f.id,
        name: f.name,
        label: f.label,
        placeholder: f.placeholder
    })));

    // Map data to fields
    const mappings = mapFieldsWithFBR(extractedData, domFields);

    if (mappings.length === 0) {
        console.warn('⚠️ No matching fields found!');
        return { success: false, matchedFields: 0, error: 'No matching fields found' };
    }

    // Fill the fields
    let filledCount = 0;
    for (const mapping of mappings) {
        try {
            await fillField(mapping.element, mapping.value);
            filledCount++;
            console.log(`✅ Filled: ${mapping.dataPath} = ${mapping.value}`);
        } catch (error) {
            console.error(`❌ Failed to fill ${mapping.dataPath}:`, error);
        }
    }

    console.log(`🎉 Autofill complete! Filled ${filledCount}/${mappings.length} fields`);

    return {
        success: filledCount > 0,
        matchedFields: filledCount,
        totalMappings: mappings.length,
        mappings: mappings.map(m => ({
            dataPath: m.dataPath,
            fieldId: m.element.id,
            value: m.value,
            matchType: m.matchType,
            confidence: m.confidence
        }))
    };
}

/**
 * Scan for input fields on the page
 */
function scanForFields() {
    const fields = [];
    const inputs = document.querySelectorAll('input, select, textarea');

    inputs.forEach(element => {
        const metadata = extractMetadata(element);
        if (metadata) {
            fields.push({ element, ...metadata });
        }
    });

    return fields;
}

/**
 * Extract metadata from DOM element
 */
function extractMetadata(element) {
    const id = element.id || '';
    const name = element.name || '';
    const placeholder = element.placeholder || '';
    const type = element.type || 'text';

    // Get label text
    let label = '';
    const labelElement = element.labels?.[0] || document.querySelector(`label[for="${element.id}"]`);
    if (labelElement) {
        label = labelElement.textContent.trim();
    }

    // Get aria-label
    const ariaLabel = element.getAttribute('aria-label') || '';

    return {
        id,
        name,
        label,
        placeholder,
        ariaLabel,
        type,
        searchableText: `${id} ${name} ${label} ${placeholder} ${ariaLabel}`.toLowerCase()
    };
}

/**
 * Fill a field with value (handles React/Vue)
 */
async function fillField(element, value) {
    if (!element) return;

    // Set the value
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    ).set;

    nativeInputValueSetter.call(element, value);

    // Trigger events for React/Vue
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    // Visual feedback
    element.style.backgroundColor = '#d4edda';
    setTimeout(() => {
        element.style.backgroundColor = '';
    }, 1000);
}
