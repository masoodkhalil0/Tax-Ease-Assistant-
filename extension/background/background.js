// Background script for TaxEase Extension

// Clean up stored document data when extension starts
chrome.runtime.onStartup.addListener(async () => {
    try {
        const result = await chrome.storage.local.get(['lastViewedDocument']);
        const saved = result.lastViewedDocument;
        
        if (saved && saved.timestamp) {
            // If data is older than 30 days, clear it
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - saved.timestamp > thirtyDays) {
                await chrome.storage.local.remove('lastViewedDocument');
                console.log('🧹 Cleared old stored document data');
            }
        }
    } catch (error) {
        console.error('Background cleanup error:', error);
    }
});

console.log('🎯 TaxEase Background Service Worker initialized');