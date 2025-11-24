/**
 * DOM Watcher & Interaction Utility
 * Handles safe interaction with React forms and dynamic DOM elements
 */

const CONFIG = {
    MAX_RETRIES: 5,
    RETRY_DELAY: 500, // ms
    OBSERVER_TIMEOUT: 10000 // ms
};

export class DomWatcher {
    constructor() {
        this.observer = null;
    }

    /**
     * Waits for the form or specific container to be ready
     * @param {string} selector 
     * @returns {Promise<Element>}
     */
    async waitForElement(selector) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                return resolve(element);
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Timeout
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout waiting for element: ${selector}`));
            }, CONFIG.OBSERVER_TIMEOUT);
        });
    }

    /**
     * Safely sets a value on a React input field
     * This is CRITICAL for React to detect the change
     * @param {HTMLInputElement} element 
     * @param {string} value 
     */
    setReactValue(element, value) {
        if (!element) return false;

        try {
            // 1. Get the native value setter from prototype
            // This bypasses any React overrides on the element instance
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
            ).set;

            // 2. Call the native setter
            nativeInputValueSetter.call(element, value);

            // 3. Dispatch input event (bubbles: true is important for React delegation)
            const inputEvent = new Event('input', { bubbles: true });
            element.dispatchEvent(inputEvent);

            // 4. Dispatch change event just in case
            const changeEvent = new Event('change', { bubbles: true });
            element.dispatchEvent(changeEvent);

            // 5. Dispatch blur to trigger validation if needed
            element.dispatchEvent(new Event('blur', { bubbles: true }));

            return true;
        } catch (error) {
            console.error('DomWatcher: Failed to set React value', error);
            return false;
        }
    }

    /**
     * Scans the DOM for all potential input fields
     * @returns {Array<HTMLElement>}
     */
    scanForFields() {
        // Select all inputs, selects, and textareas
        // Exclude hidden, disabled, or readonly fields
        const selector = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])';
        return Array.from(document.querySelectorAll(selector));
    }

    /**
     * Highlights an element visually (for debugging/demo)
     * @param {HTMLElement} element 
     * @param {string} color 
     */
    highlightElement(element, color = '#48bb78') {
        if (!element) return;

        const originalTransition = element.style.transition;
        const originalBorder = element.style.border;
        const originalBoxShadow = element.style.boxShadow;

        element.style.transition = 'all 0.3s ease';
        element.style.border = `2px solid ${color}`;
        element.style.boxShadow = `0 0 8px ${color}40`; // 40 is alpha

        // Reset after delay
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.boxShadow = originalBoxShadow;
            setTimeout(() => {
                element.style.transition = originalTransition;
            }, 300);
        }, 2000);
    }
}

export const domWatcher = new DomWatcher();
