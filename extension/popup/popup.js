// Configuration
const API_BASE_URL = 'http://localhost:8000';

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const documentsList = document.getElementById('documentsList');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const restoreBadge = document.getElementById('restoreBadge');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const resultsSection = document.getElementById('resultsSection');
const analysisResults = document.getElementById('analysisResults');

// State
let selectedFile = null;
let currentExtractedData = null;

// ===== CHROME STORAGE UTILITIES =====

// Utility: Strip currency prefix for clean copying
function stripCurrencyPrefix(value) {
    if (!value) return value;
    return String(value).replace(/^Rs\.\s*/, ''); // Remove "Rs. " prefix only
}

// Save document ID to storage
async function saveDocumentState(documentId, documentData) {
    try {
        // Also save current scroll position
        const scrollPosition = {
            x: window.scrollX,
            y: window.scrollY
        };

        await chrome.storage.local.set({
            lastViewedDocument: {
                id: documentId,
                data: documentData,
                timestamp: Date.now(),
                scrollPosition: scrollPosition
            }
        });
        console.log('✅ Document state saved:', documentId);
    } catch (error) {
        console.error('❌ Failed to save document state:', error);
    }
}

// Clear document state from storage
async function clearDocumentState() {
    try {
        await chrome.storage.local.remove('lastViewedDocument');
        console.log('✅ Document state cleared');
    } catch (error) {
        console.error('❌ Failed to clear document state:', error);
    }
}

// Restore document state on popup open
async function restoreDocumentState() {
    try {
        const result = await chrome.storage.local.get(['lastViewedDocument']);
        const saved = result.lastViewedDocument;

        if (saved && saved.id && saved.data) {
            console.log('📋 Found saved document:', saved.id);

            // Show restore badge
            restoreBadge.style.display = 'inline-block';

            // Auto-display the saved data (NO SCROLL)
            await displayExtractedData(saved.data, false);

            // Restore scroll position
            if (saved.scrollPosition) {
                setTimeout(() => {
                    window.scrollTo(saved.scrollPosition.x, saved.scrollPosition.y);
                }, 100);
            }

            // Hide badge after 3 seconds
            setTimeout(() => {
                restoreBadge.style.display = 'none';
            }, 3000);

            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Failed to restore document state:', error);
        return false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    checkBackendConnection();
    loadDocuments();
    setupEventListeners();

    // Try to restore previous document state
    const restored = await restoreDocumentState();
    if (restored) {
        updateStatus(true, 'Connected to backend • Restored previous data');
    }
});

// Check if backend is running
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            updateStatus(true, 'Connected to backend');
        } else {
            updateStatus(false, `Backend error: ${response.status}`);
            console.error('Backend health check failed:', response.status);
        }
    } catch (error) {
        updateStatus(false, 'Backend not running. Start your FastAPI server!');
        console.error('Backend connection error:', error);
    }
}

function updateStatus(isConnected, message) {
    statusIndicator.textContent = isConnected ? '🟢' : '🔴';
    statusText.textContent = message;

    const statusElement = statusIndicator.parentElement;
    if (isConnected) {
        statusElement.style.background = '#d4edda';
        statusElement.style.borderLeft = '4px solid #28a745';
    } else {
        statusElement.style.background = '#f8d7da';
        statusElement.style.borderLeft = '4px solid #dc3545';
    }
}

// Event Listeners
function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);

    // Upload button
    uploadBtn.addEventListener('click', uploadDocument);

    // Search button
    searchBtn.addEventListener('click', performSearch);

    // Enter key in search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Event delegation for document action buttons
    documentsList.addEventListener('click', handleDocumentAction);

    // Event delegation for copy buttons (NEW - fixes Issue #1)
    resultsSection.addEventListener('click', handleCopyClick);
}

function handleFileSelect(e) {
    try {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];

            // Validate file type - ONLY PDF and JPG
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(selectedFile.type)) {
                alert('❌ Only PDF and JPG files are allowed!');
                selectedFile = null;
                fileInput.value = '';
                return;
            }

            // Validate file size (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                alert('❌ File size must be less than 10MB!');
                selectedFile = null;
                fileInput.value = '';
                return;
            }

            showFilePreview(selectedFile);
            uploadBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error in file input change:', error);
        alert('❌ Error selecting file. Please try again.');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragging');
}

function handleDragLeave() {
    uploadArea.classList.remove('dragging');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragging');

    try {
        if (e.dataTransfer.files.length > 0) {
            selectedFile = e.dataTransfer.files[0];

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(selectedFile.type)) {
                alert('❌ Only PDF and JPG files are allowed!');
                selectedFile = null;
                return;
            }

            // Validate file size
            if (selectedFile.size > 10 * 1024 * 1024) {
                alert('❌ File size must be less than 10MB!');
                selectedFile = null;
                return;
            }

            fileInput.files = e.dataTransfer.files;
            showFilePreview(selectedFile);
            uploadBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error in file drop:', error);
        alert('❌ Error dropping file. Please try again.');
    }
}

function showFilePreview(file) {
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    const fileIcon = file.type === 'application/pdf' ? '📄' : '🖼️';
    uploadArea.innerHTML = `
        <div style="padding: 16px;">
            <p style="font-weight: 600; color: #667eea; margin-bottom: 8px;">
                ${fileIcon} ${file.name}
            </p>
            <p style="font-size: 12px; color: #95a5a6;">
                ${fileSize} MB
            </p>
        </div>
    `;
}

// Button state management
function setButtonLoading(button, text = 'Processing...') {
    if (!button) return;

    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `
        <span class="spinner"></span>
        ${text}
    `;
}

function resetButton(button) {
    if (!button || !button.dataset.originalText) return;

    button.disabled = false;
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
}

// Upload document to backend
async function uploadDocument() {
    if (!selectedFile) {
        alert('❌ Please select a file first');
        return;
    }

    setButtonLoading(uploadBtn, 'Uploading...');

    try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Reset
        selectedFile = null;
        fileInput.value = '';
        resetUploadArea();

        // Reload documents
        await loadDocuments();

        alert('✅ Document uploaded successfully! Click "Analyze" to extract data.');

    } catch (error) {
        console.error('Upload error:', error);
        alert(`❌ Upload failed: ${error.message}`);
    } finally {
        resetButton(uploadBtn);
    }
}

function resetUploadArea() {
    uploadArea.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>Click to upload or drag & drop</p>
        <p class="file-types">PDF, JPG only (Max 10MB)</p>
    `;
}

// Load documents from backend
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents`);

        if (!response.ok) {
            throw new Error(`Failed to load documents: ${response.status}`);
        }

        const documents = await response.json();
        displayDocuments(documents);
    } catch (error) {
        console.error('Error loading documents:', error);
        documentsList.innerHTML = '<p class="empty-state" style="color: #e53e3e;">Error loading documents. Please check backend connection.</p>';
    }
}

function displayDocuments(documents) {
    if (!documents || documents.length === 0) {
        documentsList.innerHTML = '<p class="empty-state">No documents uploaded yet</p>';
        return;
    }

    documentsList.innerHTML = documents.map(doc => `
        <div class="document-item" data-doc-id="${doc.id}">
            <div class="document-info">
                <div class="document-name">${escapeHtml(doc.original_filename)}</div>
                <div class="document-meta">
                    ${new Date(doc.uploaded_at).toLocaleDateString()} • ${doc.file_type} • ${getStatusBadge(doc.status)}
                </div>
            </div>
            <div class="document-actions">
                ${doc.status === 'uploaded' ? `
                    <button class="btn btn-small btn-analyze" data-action="analyze" data-doc-id="${doc.id}">
                        Analyze
                    </button>
                ` : ''}
                ${doc.status === 'processing' ? `
                    <button class="btn btn-small" disabled>
                        Processing...
                    </button>
                ` : ''}
                ${doc.status === 'completed' ? `
                    <button class="btn btn-small btn-analyze" data-action="view" data-doc-id="${doc.id}">
                        View Data
                    </button>
                ` : ''}
                ${doc.status === 'failed' ? `
                    <button class="btn btn-small btn-analyze" data-action="analyze" data-doc-id="${doc.id}">
                        Retry
                    </button>
                ` : ''}
                <button class="btn btn-small btn-delete" data-action="delete" data-doc-id="${doc.id}">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getStatusBadge(status) {
    const badges = {
        'uploaded': '⚪ Uploaded',
        'processing': '🟡 Processing...',
        'completed': '🟢 Analyzed',
        'failed': '🔴 Failed'
    };
    return badges[status] || status;
}

// Handle document actions using event delegation
async function handleDocumentAction(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const action = button.dataset.action;
    const documentId = button.dataset.docId;

    if (!action || !documentId) return;

    event.stopPropagation();

    switch (action) {
        case 'analyze':
            await handleAnalyzeClick(event, documentId);
            break;
        case 'view':
            await handleViewClick(event, documentId);
            break;
        case 'delete':
            await handleDeleteClick(event, documentId);
            break;
    }
}

// Button action handlers with error handling
async function handleAnalyzeClick(event, documentId) {
    const button = event.target;
    const docItem = button.closest('.document-item');
    const statusMeta = docItem.querySelector('.document-meta');
    const originalStatus = statusMeta.innerHTML;

    const confirmed = confirm('⚡ Analyze this document with AI?\n\nThis will:\n• Extract salary and tax data\n• Use OpenAI API credits (~$0.05-0.10)\n• Take 10-20 seconds\n\nContinue?');
    if (!confirmed) return;

    setButtonLoading(button, 'Analyzing...');
    statusMeta.innerHTML = '🟡 Analyzing with AI... Please wait...';

    try {
        const response = await fetch(`${API_BASE_URL}/api/documents/analyze/${documentId}`, {
            method: 'POST'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.extracted_data) {
            throw new Error('No extracted data returned from analysis');
        }

        alert('✅ Analysis complete! Click "View Data" to see extracted information.');

        // Reload documents
        await loadDocuments();

        // Auto-display results (with scroll)
        displayExtractedData(result.extracted_data, true);

    } catch (error) {
        console.error('Analysis error:', error);
        alert(`❌ Analysis failed: ${error.message}`);
        statusMeta.innerHTML = originalStatus;
        resetButton(button);
        button.textContent = 'Retry';
    }
}

async function handleViewClick(event, documentId) {
    const button = event.target;
    setButtonLoading(button, 'Loading...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`);

        if (!response.ok) {
            throw new Error(`Failed to load document: ${response.status}`);
        }

        const document = await response.json();

        if (!document.extracted_data) {
            throw new Error('No extracted data found. Try analyzing the document again.');
        }

        let data;
        try {
            data = typeof document.extracted_data === 'string'
                ? JSON.parse(document.extracted_data)
                : document.extracted_data;
        } catch (parseError) {
            throw new Error('Invalid data format stored in document');
        }

        // Save to storage for auto-restore
        await saveDocumentState(documentId, data);

        // Display data (with scroll)
        displayExtractedData(data, true);

    } catch (error) {
        console.error('View results error:', error);
        alert(`❌ Error loading results: ${error.message}`);
    } finally {
        resetButton(button);
    }
}

async function handleDeleteClick(event, documentId) {
    const button = event.target;

    if (!confirm('⚠️ Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
    }

    setButtonLoading(button, 'Deleting...');

    try {
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.status}`);
        }

        // Check if we're deleting the currently displayed document
        if (resultsSection.style.display === 'block' && currentExtractedData && currentExtractedData.document_id === documentId) {
            resultsSection.style.display = 'none';
            currentExtractedData = null;
            // Clear stored state
            await clearDocumentState();
        }

        // Reload documents
        await loadDocuments();

        alert('✅ Document deleted successfully');

    } catch (error) {
        console.error('Delete error:', error);
        alert(`❌ Delete error: ${error.message}`);
    } finally {
        resetButton(button);
    }
}

// ===== NEW TAX SLAB & FBR IRIS FUNCTIONALITY =====

// Helper function to fetch tax slab from backend
async function fetchTaxSlab(annualIncome) {
    if (!annualIncome || annualIncome === 0 || isNaN(annualIncome)) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/api/tax/slab?income=${annualIncome}&category=SALARIED&tax_year=2025-26`);

        if (!response.ok) {
            console.error('Failed to fetch tax slab:', response.status);
            return null;
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching tax slab:', error);
        return null;
    }
}

// Helper to sum allowances for FBR mapping
function getTotalAllowances(allowances) {
    if (!allowances) return 0;
    return ['house_rent', 'medical', 'conveyance', 'utility', 'other']
        .reduce((sum, key) => sum + (parseFloat(allowances[key]) || 0), 0);
}

// Helper to identify perquisites (non-cash benefits for FBR)
function getPerquisites(allowances) {
    if (!allowances) return 0;
    // Map conveyance and other benefits as perquisites per FBR rules
    return (parseFloat(allowances.conveyance) || 0) + (parseFloat(allowances.other) || 0);
}

// Helper to calculate taxable income per FBR rules
function calculateTaxableIncome(data) {
    if (!data.salary_details) return 0;

    const annualGross = parseFloat(data.salary_details.annual_gross_salary) || 0;
    const allowances = data.allowances || {};
    const deductions = data.deductions || {};

    // Standard deductions
    const providentFund = parseFloat(deductions.provident_fund) || 0;
    const eobi = parseFloat(deductions.eobi) || 0;
    const socialSecurity = parseFloat(deductions.social_security) || 0;

    // Allowances that reduce taxable income
    const totalAllowances = getTotalAllowances(allowances);

    // Taxable income calculation (per FBR IRIS rules)
    const taxableIncome = annualGross - totalAllowances - providentFund - eobi - socialSecurity;

    return Math.max(0, taxableIncome); // Ensure non-negative
}

// ===== COPY FUNCTIONALITY FIX & ENHANCEMENTS =====

// Handle copy button clicks via event delegation (fixes Issue #1)
async function handleCopyClick(event) {
    const button = event.target.closest('.copy-btn');
    if (!button) return;

    event.stopPropagation();

    const fieldId = button.dataset.fieldId;
    if (!fieldId) {
        console.error('No fieldId found on copy button');
        return;
    }

    const element = document.getElementById(fieldId);
    if (!element) {
        alert('❌ Error: Could not find text to copy');
        return;
    }

    const displayText = element.textContent;
    const textToCopy = stripCurrencyPrefix(displayText); // Remove "Rs. " prefix

    try {
        await navigator.clipboard.writeText(textToCopy);

        // Show feedback
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.classList.add('copied');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        alert('❌ Failed to copy to clipboard');
    }
}

// Copy all FBR fields at once (NEW FEATURE)
async function copyAllFBRFields() {
    const fbrSection = document.querySelector('.data-group:last-of-type');
    if (!fbrSection) {
        alert('❌ No FBR fields found to copy');
        return;
    }

    const fieldElements = fbrSection.querySelectorAll('[id^="field_"]');
    const fields = [];

    fieldElements.forEach(element => {
        const label = element.parentElement.parentElement.querySelector('div:first-child').textContent;
        const value = stripCurrencyPrefix(element.textContent); // Remove "Rs. " prefix
        fields.push(`${label} ${value}`);
    });

    const clipboardText = fields.join('\n');

    try {
        await navigator.clipboard.writeText(clipboardText);

        // Show success feedback
        const copyAllBtn = document.getElementById('copyAllBtn');
        if (copyAllBtn) {
            const originalText = copyAllBtn.textContent;
            copyAllBtn.textContent = '✓ All Copied!';
            copyAllBtn.style.background = '#48bb78';

            setTimeout(() => {
                copyAllBtn.textContent = originalText;
                copyAllBtn.style.background = '#667eea';
            }, 2000);
        }

        alert(`✅ Copied ${fields.length} fields to clipboard!`);
    } catch (error) {
        console.error('Copy all failed:', error);
        alert('❌ Failed to copy all fields');
    }
}

// Replace the existing displayExtractedData function with this enhanced version
async function displayExtractedData(data, shouldScroll = true) {
    if (!data) {
        console.error('No data provided to displayExtractedData');
        analysisResults.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No data to display.</p>';
        resultsSection.style.display = 'block';
        return;
    }

    currentExtractedData = data;
    window.currentExtractedData = data;

    const autofillBtn = document.getElementById('autofillBtn');
    if (autofillBtn) autofillBtn.style.display = 'flex';

    resultsSection.style.display = 'block';

    let html = '';

    // Employee Information
    if (data.employee_name && data.employee_name !== 'Not found') {
        html += `
            <div class="data-group">
                <h3>👤 Employee Information</h3>
                ${createDataField('Name', data.employee_name)}
                ${createDataField('CNIC', data.cnic)}
                ${createDataField('Employer', data.employer_name)}
                ${createDataField('Designation', data.designation)}
            </div>
        `;
    }

    // Salary Details with Tax Slab
    const annualGross = parseFloat(data.salary_details?.annual_gross_salary) || 0;
    const taxSlab = await fetchTaxSlab(annualGross);

    if (data.salary_details && hasValidData(data.salary_details)) {
        html += `
            <div class="data-group">
                <h3>💰 Salary Details (FBR Mapping)</h3>
                ${createDataField('Basic Salary (Monthly)', formatCurrency(data.salary_details.basic_salary))}
                ${createDataField('Gross Salary (Monthly)', formatCurrency(data.salary_details.gross_salary))}
                ${createDataField('Annual Gross Salary', formatCurrency(annualGross))}
                ${taxSlab ? createDataField('Tax Slab', taxSlab.slab.description) : ''}
                ${taxSlab ? createDataField('Calculated Tax', formatCurrency(taxSlab.calculated_tax)) : ''}
                ${taxSlab ? createDataField('Tax Rate', `${taxSlab.slab.tax_rate}%`) : ''}
            </div>
        `;
    }

    // Allowances
    if (data.allowances && hasValidData(data.allowances)) {
        html += `
            <div class="data-group">
                <h3>🏠 Allowances</h3>
                ${createDataField('House Rent', formatCurrency(data.allowances.house_rent))}
                ${createDataField('Medical', formatCurrency(data.allowances.medical))}
                ${createDataField('Conveyance', formatCurrency(data.allowances.conveyance))}
                ${createDataField('Utility', formatCurrency(data.allowances.utility))}
                ${createDataField('Other', formatCurrency(data.allowances.other))}
            </div>
        `;
    }

    // Deductions
    if (data.deductions && hasValidData(data.deductions)) {
        html += `
            <div class="data-group">
                <h3>📉 Deductions</h3>
                ${createDataField('Income Tax', formatCurrency(data.deductions.income_tax))}
                ${createDataField('Provident Fund', formatCurrency(data.deductions.provident_fund))}
                ${createDataField('EOBI', formatCurrency(data.deductions.eobi))}
                ${createDataField('Social Security', formatCurrency(data.deductions.social_security))}
            </div>
        `;
    }

    // Bank Details
    if (data.bank_details && hasValidData(data.bank_details)) {
        html += `
            <div class="data-group">
                <h3>🏦 Bank Details</h3>
                ${createDataField('Account Number', data.bank_details.account_number)}
                ${createDataField('Bank Name', data.bank_details.bank_name)}
                ${data.bank_details.monthly_salary_credit ? createDataField('Monthly Salary Credit', data.bank_details.monthly_salary_credit) : ''}
                ${data.bank_details.transactions ? createDataField('Transactions', data.bank_details.transactions) : ''}
            </div>
        `;
    }

    // Other Expenses
    if (data.other_expenses && hasValidData(data.other_expenses)) {
        html += `
            <div class="data-group">
                <h3>💵 Other Expenses</h3>
                ${createDataField('Rent Paid', formatCurrency(data.other_expenses.rent_paid))}
                ${createDataField('Utilities', formatCurrency(data.other_expenses.utilities_paid))}
                ${createDataField('Education', formatCurrency(data.other_expenses.education))}
                ${createDataField('Medical Expenses', formatCurrency(data.other_expenses.medical_expenses))}
            </div>
        `;
    }

    // FBR IRIS Form Fields (Optimized for Copy-Paste - ORDER MATTERS!)
    if (data.salary_details || data.allowances) {
        const allowancesTotal = getTotalAllowances(data.allowances);
        const perquisites = getPerquisites(data.allowances);
        const taxableIncome = calculateTaxableIncome(data);
        const taxSlabData = await fetchTaxSlab(taxableIncome);

        html += `
            <div class="data-group" style="background: #e8f5e9; border: 2px solid #667eea; padding: 0; margin-top: 20px;">
                <h3 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; margin: 0; border-radius: 8px 8px 0 0; font-size: 15px;">
                    🎯 FBR IRIS Form Fields (Copy-Paste Ready)
                </h3>
                <div style="padding: 16px;">
                    <div style="background: #fff9c4; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; color: #5d4037; border-left: 4px solid #ffa000;">
                        <strong>💡 Tip:</strong> Click "Copy" on each field and paste directly into FBR IRIS portal fields in the exact order shown below
                    </div>
                    <div style="margin-bottom: 12px;">
                        <button id="copyAllBtn" class="btn btn-primary" style="background: #667eea; color: white; padding: 8px 16px; font-size: 13px; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 16px;">
                            📋 Copy All Fields at Once
                        </button>
                    </div>
                    ${createDataField('Income from Salary (Code: 1000)', formatCurrency(annualGross))}
                    ${createDataField('Pay, Wages or Other Remuneration (Code: 1009)', formatCurrency(data.salary_details?.basic_salary || 0))}
                    ${createDataField('Allowances (Code: 1049)', formatCurrency(allowancesTotal))}
                    ${createDataField('Pension/Annuity u/s 12(2)(f) (Code: 1008)', '0')}
                    ${createDataField('Expenditure Reimbursement (Code: 1059)', '0')}
                    ${createDataField('Value of Perquisites (Code: 1089)', formatCurrency(perquisites))}
                    ${createDataField('Profits in Lieu of or in Addition to Pay (Code: 1099)', '0')}
                    ${createDataField('Total Taxable Income (Auto-Calculated)', formatCurrency(taxableIncome))}
                    ${taxSlabData ? createDataField('Tax Slab Applied', taxSlabData.slab.description) : ''}
                    ${taxSlabData ? createDataField('Tax Payable (Calculated)', formatCurrency(taxSlabData.calculated_tax)) : ''}
                </div>
            </div>
        `;

        // Add listener for "Copy All" button
        setTimeout(() => {
            const copyAllBtn = document.getElementById('copyAllBtn');
            if (copyAllBtn) {
                copyAllBtn.addEventListener('click', copyAllFBRFields);
            }
        }, 100);
    }

    // Document Info
    html += `
        <div class="data-group">
            <h3>📄 Document Information</h3>
            ${createDataField('Period', data.period)}
            ${createDataField('Document Type', data.document_type)}
            ${createDataField('Confidence', data.confidence)}
        </div>
    `;

    if (!html) {
        html = '<p style="text-align: center; color: #999; padding: 40px;">No data could be extracted from this document. Please try uploading a salary slip instead of a bank statement.</p>';
    }

    analysisResults.innerHTML = html;

    // Scroll to results ONLY if shouldScroll is true
    if (shouldScroll) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function hasValidData(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return Object.values(obj).some(val =>
        val !== 'Not found' &&
        val !== null &&
        val !== undefined &&
        val !== '' &&
        val !== 0
    );
}

function createDataField(label, value) {
    if (!value || value === 'Not found' || value === 'null' || value === null || value === undefined || value === '' || value === 0) {
        return '';
    }

    const fieldId = `field_${label.replace(/\s+/g, '_').replace(/[()]/g, '').replace(/:/g, '')}`;
    const displayValue = String(value);

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid #667eea;">
            <div style="font-weight: 600; color: #2c3e50; font-size: 13px; flex: 1;">${escapeHtml(label)}:</div>
            <div style="display: flex; align-items: center; gap: 10px; min-width: 200px;">
                <span id="${fieldId}" style="font-weight: 600; color: #667eea; font-size: 14px; text-align: right;">${escapeHtml(displayValue)}</span>
                <button class="copy-btn" data-field-id="${fieldId}" style="background: #667eea; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s; flex-shrink: 0;">Copy</button>
            </div>
        </div>
    `;
}

function formatCurrency(value) {
    if (!value || value === 'Not found' || value === 0) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return `Rs. ${num.toLocaleString()}`;
}

// Search functionality
async function performSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        alert('❌ Please enter a search query');
        return;
    }

    if (query.length < 3) {
        alert('❌ Please enter at least 3 characters');
        return;
    }

    setButtonLoading(searchBtn, 'Searching...');
    searchResults.style.display = 'block';
    searchResults.innerHTML = '<div class="loading"><div class="spinner"></div><p>Searching...</p></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/documents/search?query=${encodeURIComponent(query)}`, {
            method: 'POST'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.answer) {
            throw new Error('No search results returned');
        }

        searchResults.innerHTML = `
            <div class="search-result">
                <h4 style="margin-bottom: 8px; color: #667eea;">🔍 Search Results:</h4>
                <p>${escapeHtml(result.answer)}</p>
                <p style="margin-top: 12px; font-size: 12px; color: #999;">
                    Searched ${result.documents_searched || 0} document(s)
                </p>
            </div>
        `;

    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <div class="search-result" style="color: #f56565;">
                ❌ Search failed: ${error.message}
            </div>
        `;
    } finally {
        resetButton(searchBtn);
    }
}

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    alert('❌ An unexpected error occurred. Please check the console for details.');
});

// Handle fetch errors globally
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});