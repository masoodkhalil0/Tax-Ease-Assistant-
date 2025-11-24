import { autofillMapper } from '../utils/autofillMapper.js';

// Mock DOM elements
const createMockField = (id, labelText, type = 'text') => {
    const element = {
        id,
        type,
        tagName: 'INPUT',
        getAttribute: () => '',
        closest: () => null,
        previousElementSibling: null,
        parentElement: null
    };

    // Mock metadata extraction for test
    // In real app, this is done by reading DOM
    // Here we just attach what the mapper expects
    element.meta = {
        id: id || '',
        name: id || '',
        placeholder: '',
        ariaLabel: '',
        labelText: labelText || '',
        normalizedText: autofillMapper.normalizeString(`${id} ${labelText}`),
        type
    };

    // Wrap in structure expected by mapper
    return { element, meta: element.meta };
};

const runTests = () => {
    console.log('🧪 Running Autofill Mapper Tests...\n');
    let passed = 0;
    let total = 0;

    const assert = (desc, condition) => {
        total++;
        if (condition) {
            console.log(`✅ PASS: ${desc}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${desc}`);
        }
    };

    // Test 1: Exact ID Match
    const fields1 = [createMockField('salary_basic', 'Basic Salary')];
    const match1 = autofillMapper.findBestMatch('salary_basic', '1000', fields1);
    assert('Exact ID match should have high confidence', match1 && match1.confidence === 1.0);

    // Test 2: Fuzzy Label Match
    const fields2 = [createMockField('f_1001', 'House Rent Allowance')];
    const match2 = autofillMapper.findBestMatch('allowances.house_rent', '500', fields2);
    assert('Fuzzy label match should find "House Rent"', match2 && match2.confidence > 0.6);

    // Test 3: Type Safety
    const fields3 = [createMockField('age', 'Age', 'number')];
    const match3 = autofillMapper.findBestMatch('age', 'not a number', fields3);
    assert('Should not match text to number field', !match3 || match3.confidence === 0);

    // Test 4: Currency Formatting
    const formatted = autofillMapper.formatValue('Rs. 50,000');
    assert('Should strip currency prefix', formatted === '50,000');

    console.log(`\nTests Completed: ${passed}/${total} Passed`);
};

// Run if executed directly (node)
// Note: This requires ES module support in node or a test runner
// For now, this file serves as a verification script we can run in browser console or similar
// runTests(); 
export { runTests };
