/**
 * Autofill Handler for TaxEase Extension
 * Handles autofill button functionality separately from main popup.js
 */

// Get DOM references
const autofillBtn = document.getElementById('autofillBtn');

// Track current extracted data (shared with popup.js via global scope)
// This will be set by popup.js when data is displayed

/**
 * Handle autofill button click
 */
async function handleAutofillClick() {
    console.log('🔵 Autofill button clicked');

    // Check if we have data to autofill
    if (!window.currentExtractedData) {
        alert('❌ No data available to autofill. Please analyze a document first.');
        return;
    }

    console.log('📦 Current extracted data:', window.currentExtractedData);

    // Show loading state
    const originalText = autofillBtn.textContent;
    autofillBtn.disabled = true;
    autofillBtn.innerHTML = `
        <span class="spinner"></span>
        Autofilling...
    `;

    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('🎯 Active tab:', tab);

        if (!tab) {
            throw new Error('No active tab found');
        }

        // Check if we're on an allowed domain
        const isAllowed = tab.url.includes('localhost') || tab.url.includes('iris.fbr.gov.pk');
        if (!isAllowed) {
            throw new Error('Autofill only works on FBR IRIS website or localhost test pages');
        }

        // Send data to background script with correct payload structure
        console.log('📤 Sending message to background script...');
        const response = await chrome.runtime.sendMessage({
            type: 'AUTOFILL_DATA',
            payload: {
                tabId: tab.id,
                data: window.currentExtractedData
            }
        });

        console.log('📥 Response from background:', response);

        // Handle response
        if (response && response.status === 'success') {
            alert(`✅ Autofill completed! ${response.matchedFields || 0} fields filled.`);
        } else if (response && response.error) {
            throw new Error(response.error);
        } else {
            console.log('Autofill message sent');
            alert('✅ Autofill message sent to page.');
        }

    } catch (error) {
        console.error('Autofill error:', error);
        alert(`❌ Autofill failed: ${error.message}`);
    } finally {
        // Reset button state
        autofillBtn.disabled = false;
        autofillBtn.textContent = originalText;
    }
}

/**
 * Show/hide autofill button based on data availability
 */
function updateAutofillButtonVisibility(hasData) {
    if (autofillBtn) {
        autofillBtn.style.display = hasData ? 'flex' : 'none';
    }
}

// Setup event listener when DOM is ready
if (autofillBtn) {
    autofillBtn.addEventListener('click', handleAutofillClick);
    console.log('✅ Autofill handler initialized');
}

// Export functions for use by popup.js
window.TaxEaseAutofill = {
    updateButtonVisibility: updateAutofillButtonVisibility,
    handleAutofillClick: handleAutofillClick
};
