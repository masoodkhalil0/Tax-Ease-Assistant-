// TaxEase Content Script - Bundled Version (No ES6 Modules)
// Wrapped in IIFE to prevent variable redeclaration errors

(function () {
    'use strict';

    // Prevent multiple initialization
    if (window.__TAXEASE_CONTENT_SCRIPT_LOADED__) {
        console.log('🎯 TaxEase Content Script already loaded, skipping...');
        return;
    }
    window.__TAXEASE_CONTENT_SCRIPT_LOADED__ = true;

    console.log('🎯 TaxEase Content Script Loaded');

    // ===== MESSAGE SCHEMA (Inlined) =====
    const MESSAGE = {
        AUTOFILL_DATA: 'AUTOFILL_DATA',
        PING: 'PING'
    };

    const STATUS = {
        SUCCESS: 'success',
        FAILED: 'failed',
        PARTIAL: 'partial'
    };

    // ===== DOM WATCHER (Inlined) =====
    const domWatcher = {
        waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver(() => {
                    const el = document.querySelector(selector);
                    if (el) {
                        observer.disconnect();
                        resolve(el);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        },

        scanForFields() {
            const fields = [];
            const inputs = document.querySelectorAll('input, select, textarea');

            inputs.forEach(element => {
                const metadata = this.extractMetadata(element);
                if (metadata) {
                    fields.push({ element, ...metadata });
                }
            });

            return fields;
        },

        extractMetadata(element) {
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
        },

        setReactValue(element, value) {
            try {
                // For React inputs, we need to trigger the native setter
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                ).set;

                nativeInputValueSetter.call(element, value);

                // Trigger React events
                const events = ['input', 'change', 'blur'];
                events.forEach(eventType => {
                    const event = new Event(eventType, { bubbles: true });
                    element.dispatchEvent(event);
                });

                return true;
            } catch (error) {
                console.error('Error setting React value:', error);
                // Fallback to regular value setting
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
        },

        highlightElement(element) {
            const originalBorder = element.style.border;
            const originalBackground = element.style.background;

            element.style.border = '2px solid #667eea';
            element.style.background = '#e8f5e9';

            setTimeout(() => {
                element.style.border = originalBorder;
                element.style.background = originalBackground;
            }, 1500);
        }
    };

    // ===== IMPROVED AUTOFILL MAPPER WITH BETTER MATCHING =====
    const autofillMapper = {
        mapDataToFields(extractedData, domFields) {
            const operations = [];
            const flatData = this.flattenData(extractedData);

            console.log('📊 Flattened data:', flatData);
            console.log('🎯 Available DOM fields:', domFields.map(f => ({
                id: f.id,
                name: f.name,
                label: f.label,
                placeholder: f.placeholder
            })));

            for (const [key, value] of Object.entries(flatData)) {
                if (!value || value === 'Not found') continue;

                const matchedField = this.findBestMatch(key, value, domFields);
                if (matchedField) {
                    operations.push({
                        key,
                        value: this.formatValue(value, matchedField.type),
                        element: matchedField.element,
                        confidence: matchedField.score,
                        fieldInfo: `${matchedField.label || matchedField.id || matchedField.name}`
                    });
                }
            }

            return operations;
        },

        flattenData(data, prefix = '') {
            const flat = {};

            for (const [key, value] of Object.entries(data)) {
                // Skip document_id
                if (key === 'document_id') continue;

                const fullKey = prefix ? `${prefix}.${key}` : key;

                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(flat, this.flattenData(value, fullKey));
                } else {
                    flat[fullKey] = value;
                }
            }

            return flat;
        },

        findBestMatch(dataKey, dataValue, domFields) {
            const normalizedKey = this.normalizeString(dataKey);
            const keyWords = normalizedKey.split(' ');

            let bestMatch = null;
            let bestScore = 0;

            for (const field of domFields) {
                let score = 0;

                // Exact ID match (highest priority)
                if (field.id && this.normalizeString(field.id) === normalizedKey) {
                    return { ...field, score: 1.0 };
                }

                // Exact name match
                if (field.name && this.normalizeString(field.name) === normalizedKey) {
                    return { ...field, score: 0.95 };
                }

                // Check each component of the field
                const fieldId = this.normalizeString(field.id);
                const fieldName = this.normalizeString(field.name);
                const fieldLabel = this.normalizeString(field.label);
                const fieldPlaceholder = this.normalizeString(field.placeholder);

                // Calculate word-based matching score
                for (const word of keyWords) {
                    if (word.length < 3) continue; // Skip very short words

                    // Exact word match in any field component
                    if (fieldId.includes(word)) score += 0.3;
                    if (fieldName.includes(word)) score += 0.3;
                    if (fieldLabel.includes(word)) score += 0.25;
                    if (fieldPlaceholder.includes(word)) score += 0.15;
                }

                // Normalize score
                score = Math.min(score, 1.0);

                if (score > bestScore && score > 0.4) { // Increased threshold
                    bestScore = score;
                    bestMatch = { ...field, score };
                }
            }

            if (bestMatch) {
                console.log(`🎯 Matched "${dataKey}" -> "${bestMatch.label || bestMatch.id}" (score: ${bestScore.toFixed(2)})`);
            }

            return bestMatch;
        },

        normalizeString(str) {
            if (!str) return '';
            return str
                .toLowerCase()
                .replace(/[_\-\.]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        },

        formatValue(value, fieldType) {
            if (fieldType === 'number') {
                // Remove currency symbols and commas
                const numStr = String(value).replace(/[Rs\.,\s]/g, '');
                return numStr;
            }

            return String(value);
        }
    };

    // ===== CONTENT SCRIPT CLASS =====
    class ContentScript {
        constructor() {
            this.setupListeners();
        }

        setupListeners() {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === MESSAGE.AUTOFILL_DATA) {
                    this.handleAutofill(message.payload)
                        .then(result => sendResponse(result))
                        .catch(error => sendResponse({
                            status: STATUS.FAILED,
                            error: error.message
                        }));
                    return true; // Async response
                }
            });
        }

        async handleAutofill(data) {
            console.log('🚀 Starting Autofill Process...', data);

            // Check if FBR Autofill Integration is available
            if (window.performFBRAutofill) {
                console.log('✨ Using FBR Autofill Integration');
                try {
                    const result = window.performFBRAutofill(data);
                    return {
                        status: result.success ? STATUS.SUCCESS : STATUS.PARTIAL,
                        message: result.success ? `Successfully filled ${result.matchedFields} fields` : 'No matching fields found',
                        matchedFields: result.matchedFields,
                        total: result.totalAttempts,
                        errors: result.failed.length > 0 ? result.failed.map(f => f.error) : undefined
                    };
                } catch (error) {
                    console.error('FBR Autofill Error:', error);
                    return {
                        status: STATUS.FAILED,
                        error: error.message
                    };
                }
            }

            // Fallback to old logic if integration is missing
            console.warn('⚠️ FBR Autofill Integration not found, falling back to legacy mapper');

            try {
                // 1. Wait for form to be ready
                await domWatcher.waitForElement('input, select, textarea');

                // 2. Scan for all available fields
                const domFields = domWatcher.scanForFields();
                console.log(`Found ${domFields.length} potential fields`);

                if (domFields.length === 0) {
                    throw new Error('No input fields found on this page');
                }

                // 3. Map data to fields
                const operations = autofillMapper.mapDataToFields(data, domFields);
                console.log(`Mapped ${operations.length} fields to fill:`, operations.map(op => ({
                    key: op.key,
                    value: op.value,
                    field: op.fieldInfo,
                    confidence: op.confidence
                })));

                if (operations.length === 0) {
                    return {
                        status: STATUS.PARTIAL,
                        message: 'No matching fields found for the provided data',
                        matchedFields: 0
                    };
                }

                // 4. Apply changes
                let successCount = 0;
                let errors = [];

                for (const op of operations) {
                    try {
                        // Highlight for visual feedback
                        domWatcher.highlightElement(op.element);

                        // Set value safely
                        const success = domWatcher.setReactValue(op.element, op.value);

                        if (success) {
                            successCount++;
                            console.log(`✅ Filled [${op.key}] = "${op.value}" -> ${op.fieldInfo}`);
                        } else {
                            errors.push(`Failed to set value for ${op.key}`);
                        }
                    } catch (e) {
                        console.error(`Error filling ${op.key}:`, e);
                        errors.push(e.message);
                    }
                }

                return {
                    status: successCount > 0 ? STATUS.SUCCESS : STATUS.FAILED,
                    message: `Successfully filled ${successCount} fields`,
                    matchedFields: successCount,
                    total: operations.length,
                    errors: errors.length > 0 ? errors : undefined
                };

            } catch (error) {
                console.error('Autofill Fatal Error:', error);
                throw error;
            }
        }
    }

    // Initialize
    new ContentScript();
})();
