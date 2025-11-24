/**
 * Message Schema for TaxEase Extension
 * Defines all message types and structures for type-safe communication
 */

export const MESSAGE = {
    // Command: Popup -> Content (via Background)
    AUTOFILL_DATA: 'AUTOFILL_DATA',
    
    // Command: Popup -> Background
    PING: 'PING',
    
    // Response: Content -> Popup
    AUTOFILL_STATUS: 'AUTOFILL_STATUS',
    
    // Error
    ERROR: 'ERROR'
};

export const STATUS = {
    SUCCESS: 'success',
    PARTIAL: 'partial',
    FAILED: 'failed',
    PROCESSING: 'processing'
};

/**
 * Creates a standard message object
 * @param {string} type - One of MESSAGE types
 * @param {any} payload - Data to send
 * @returns {object}
 */
export const createMessage = (type, payload = {}) => ({
    type,
    payload,
    timestamp: Date.now()
});
