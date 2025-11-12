/**
 * Input validation utilities
 * Provides validation functions for name input
 */

import { isAllChinese } from './chinese.js';
import { isPlaceholderChar } from './placeholders.js';

/**
 * Validate name input for display purposes
 * Empty input is considered valid for display
 * @param {string} value - Input value to validate
 * @returns {boolean} True if valid
 */
export function validateInputForDisplay(value) {
    if (!value || value.length === 0) {
        return true; // Empty input is valid for display
    }
    const chars = Array.from(value);
    return chars.every(char => {
        if (isPlaceholderChar(char)) {
            return true;
        }

        return isAllChinese(char);
    });
}

/**
 * Validate name input for calculation purposes
 * Empty input is considered invalid for calculation
 * @param {string} value - Input value to validate
 * @returns {boolean} True if valid
 */
export function validateInputForCalculation(value) {
    if (!value || value.length === 0) {
        return false; // Empty input is invalid for calculation
    }
    return isAllChinese(value);
}

// Export to window for use in calculation logic
window.validateNameInput = validateInputForCalculation;

