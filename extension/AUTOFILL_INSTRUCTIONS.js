// ===== AUTOFILL FUNCTIONALITY =====
// Add this code to popup.js

// 1. ADD THIS LINE after line 16 (after const analysisResults):
// const autofillBtn = document.getElementById('autofillBtn');

// 2. ADD THIS INSIDE setupEventListeners() function (after line 173):
/*
    // Autofill button
    if (autofillBtn) {
        autofillBtn.addEventListener('click', handleAutofillClick);
    }
*/

// 3. ADD THIS FUNCTION at the end of popup.js (before the last closing brace):

async function handleAutofillClick() {
    console.log('🔵 Autofill button clicked');

    if (!currentExtractedData) {
        alert('❌ No data available to autofill');
        return;
    }

    console.log('📦 Current extracted data:', currentExtractedData);
    setButtonLoading(autofillBtn, 'Autofilling...');

    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('🎯 Active tab:', tab);

        if (!tab) {
            throw new Error('No active tab found');
        }

        // Send data to background script with correct payload structure
        console.log('📤 Sending message to background script...');
        const response = await chrome.runtime.sendMessage({
            type: 'AUTOFILL_DATA',
            payload: {
                tabId: tab.id,
                data: currentExtractedData
            }
        });

        console.log('📥 Response from background:', response);

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
        resetButton(autofillBtn);
    }
}

// 4. MODIFY displayExtractedData function to show the autofill button:
// Find the line: currentExtractedData = data;
// Add these lines after it:
/*
    // Show autofill button if data exists
    if (autofillBtn && data) {
        autofillBtn.style.display = 'flex';
    } else if (autofillBtn) {
        autofillBtn.style.display = 'none';
    }
*/
