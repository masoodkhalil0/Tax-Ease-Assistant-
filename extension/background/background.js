// Background script for TaxEase Extension
import { MESSAGE, STATUS, createMessage } from '../utils/messageSchema.js';

class MessageRouter {
    constructor() {
        this.setupListeners();
    }

    setupListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep channel open for async response
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case MESSAGE.AUTOFILL_DATA:
                    await this.handleAutofillRequest(message, sendResponse);
                    break;

                case MESSAGE.PING:
                    sendResponse({ status: 'ok', timestamp: Date.now() });
                    break;

                default:
                    console.warn('Unknown message type:', message.type);
                    sendResponse({ error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            sendResponse({ error: error.message });
        }
    }

    async handleAutofillRequest(message, sendResponse) {
        const { tabId, data } = message.payload;

        if (!tabId) {
            throw new Error('Target tab ID is required');
        }

        // Validate target tab
        const tab = await chrome.tabs.get(tabId);
        if (!tab || !tab.url) {
            throw new Error('Invalid target tab');
        }

        // Check if URL is allowed (localhost or FBR)
        const isAllowed = tab.url.includes('localhost') || tab.url.includes('iris.fbr.gov.pk');
        if (!isAllowed) {
            throw new Error('Autofill not allowed on this domain');
        }

        // Inject content script if needed (safety check)
        // Note: Manifest injection is preferred, but this ensures it's ready
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['content/content.js']
            });
        } catch (e) {
            // Script might already be there, ignore
            console.log('Script injection status:', e.message);
        }

        // Forward data to content script
        try {
            const response = await chrome.tabs.sendMessage(tabId, createMessage(MESSAGE.AUTOFILL_DATA, data));
            sendResponse(response);
        } catch (error) {
            console.error('Failed to send to content script:', error);
            throw new Error('Could not communicate with page. Refresh and try again.');
        }
    }
}

// Initialize Router
const router = new MessageRouter();

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