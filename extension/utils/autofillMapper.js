/**
 * Autofill Mapper Engine
 * Matches extracted data to DOM fields using fuzzy matching and heuristics
 */

// Thresholds
const SIMILARITY_THRESHOLD = 0.6; // Minimum score to consider a match
const HIGH_CONFIDENCE_THRESHOLD = 0.85;

export class AutofillMapper {
    constructor() {
        // Common field synonyms for fallback matching
        this.synonyms = {
            'salary': ['pay', 'wages', 'remuneration', 'income', 'basic pay'],
            'tax': ['income tax', 'deduction', 'withholding'],
            'allowance': ['benefit', 'perquisite', 'bonus'],
            'rent': ['house rent', 'accommodation'],
            'medical': ['health', 'medical allowance'],
            'utility': ['utilities', 'electricity', 'gas', 'water'],
            'provident': ['pf', 'fund', 'provident fund'],
            'eobi': ['pension', 'old age'],
        };
    }

    /**
     * Main entry point: Maps data object to DOM fields
     * @param {object} data - Extracted JSON data
     * @param {Array<HTMLElement>} domFields - List of DOM input elements
     * @returns {Array<object>} - List of operations { element, value, confidence, reason }
     */
    mapDataToFields(data, domFields) {
        const operations = [];
        const flatData = this.flattenData(data);

        // Pre-process DOM fields to extract metadata once
        const fieldMetadata = domFields.map(field => ({
            element: field,
            meta: this.extractFieldMetadata(field)
        }));

        // For each data point, find the best matching field
        for (const [key, value] of Object.entries(flatData)) {
            if (value === null || value === undefined || value === '') continue;

            const bestMatch = this.findBestMatch(key, value, fieldMetadata);

            if (bestMatch && bestMatch.confidence >= SIMILARITY_THRESHOLD) {
                operations.push({
                    element: bestMatch.field.element,
                    value: this.formatValue(value),
                    confidence: bestMatch.confidence,
                    key: key,
                    matchReason: bestMatch.reason
                });
            }
        }

        // Sort by confidence (descending) to prioritize better matches
        // If multiple data points map to same field, highest confidence wins
        operations.sort((a, b) => b.confidence - a.confidence);

        // Deduplicate: Ensure one field is only filled once (by the best match)
        const uniqueOperations = [];
        const usedElements = new Set();

        for (const op of operations) {
            if (!usedElements.has(op.element)) {
                uniqueOperations.push(op);
                usedElements.add(op.element);
            }
        }

        return uniqueOperations;
    }

    /**
     * Flattens nested JSON object into dot-notation keys
     * e.g. { salary: { basic: 100 } } -> { "salary.basic": 100 }
     */
    flattenData(data, prefix = '') {
        let result = {};
        for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                const nested = this.flattenData(data[key], prefix + key + '.');
                result = { ...result, ...nested };
            } else {
                result[prefix + key] = data[key];
            }
        }
        return result;
    }

    /**
     * Extracts useful metadata from a DOM element for matching
     */
    extractFieldMetadata(element) {
        const meta = {
            id: element.id || '',
            name: element.name || '',
            placeholder: element.placeholder || '',
            ariaLabel: element.getAttribute('aria-label') || '',
            labelText: '',
            type: element.type || 'text'
        };

        // Find associated label
        // 1. Explicit 'for' attribute
        if (meta.id) {
            const label = document.querySelector(`label[for="${meta.id}"]`);
            if (label) meta.labelText = label.textContent;
        }

        // 2. Parent label
        if (!meta.labelText) {
            const parentLabel = element.closest('label');
            if (parentLabel) meta.labelText = parentLabel.textContent;
        }

        // 3. Preceding sibling (common in some layouts)
        if (!meta.labelText) {
            const prev = element.previousElementSibling;
            if (prev && (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV')) {
                meta.labelText = prev.textContent;
            }
        }

        // 4. Parent's previous sibling (common in table layouts or grid)
        if (!meta.labelText && element.parentElement) {
            const parentPrev = element.parentElement.previousElementSibling;
            if (parentPrev) {
                meta.labelText = parentPrev.textContent;
            }
        }

        // Normalize all text
        meta.normalizedText = [
            meta.id,
            meta.name,
            meta.placeholder,
            meta.ariaLabel,
            meta.labelText
        ].map(s => this.normalizeString(s)).join(' ');

        return meta;
    }

    /**
     * Finds the best matching field for a given data key
     */
    findBestMatch(dataKey, dataValue, fieldMetadataList) {
        let bestScore = 0;
        let bestField = null;
        let matchReason = '';

        const normalizedKey = this.normalizeString(dataKey);
        const keyParts = normalizedKey.split(/[\._\s]+/); // Split "salary.basic" -> ["salary", "basic"]

        for (const field of fieldMetadataList) {
            let score = 0;
            let reason = '';

            // 1. Exact ID/Name Match (Highest Confidence)
            // Check if any part of the key matches the ID exactly
            if (field.meta.id && normalizedKey.includes(this.normalizeString(field.meta.id))) {
                score = 1.0;
                reason = 'Exact ID match';
            }
            // 2. Label Semantic Match
            else {
                // Calculate similarity between key parts and field label/text
                const textScore = this.calculateSimilarity(normalizedKey, field.meta.normalizedText);

                // Boost score if the last part of the key (most specific) matches well
                const lastKeyPart = keyParts[keyParts.length - 1];
                const specificScore = this.calculateSimilarity(lastKeyPart, field.meta.normalizedText);

                score = Math.max(textScore, specificScore);
                reason = 'Fuzzy text match';
            }

            // 3. Type Safety Check
            // Don't fill text into checkboxes or numbers into emails blindly (simplified)
            if (field.meta.type === 'number' && isNaN(Number(dataValue))) {
                score = 0; // Incompatible
            }

            if (score > bestScore) {
                bestScore = score;
                bestField = field;
                matchReason = reason;
            }
        }

        return bestField ? { field: bestField, confidence: bestScore, reason: matchReason } : null;
    }

    /**
     * Normalizes string: lowercase, remove special chars
     */
    normalizeString(str) {
        if (!str) return '';
        return str.toString()
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ') // Replace special chars with space
            .replace(/\s+/g, ' ')         // Collapse multiple spaces
            .trim();
    }

    /**
     * Calculates string similarity (0.0 to 1.0)
     * Uses a simplified Dice Coefficient approach for word overlap
     */
    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;

        const words1 = str1.split(' ');
        const words2 = str2.split(' ');

        let matches = 0;
        for (const w1 of words1) {
            if (w1.length < 3) continue; // Skip small words
            for (const w2 of words2) {
                if (w2.includes(w1) || w1.includes(w2)) {
                    matches++;
                    break; // Count word only once
                }
            }
        }

        const totalWords = words1.length + words2.length;
        if (totalWords === 0) return 0;

        // Dice-like score: 2 * matches / total
        // Adjusted to be more lenient for substring matches
        return (2 * matches) / totalWords;
    }

    /**
     * Formats value for input
     */
    formatValue(value) {
        if (typeof value === 'number') return value.toString();
        // Remove currency symbols if present in data but keep numbers
        return String(value).replace(/^Rs\.\s*/i, '').trim();
    }
}

export const autofillMapper = new AutofillMapper();
