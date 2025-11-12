/**
 * Chinese character utilities
 * Provides functions for working with Chinese characters
 */

/**
 * Check if a character is a Chinese character
 * Excludes Bopomofo (注音) characters
 * @param {string} char - Single character to check
 * @returns {boolean} True if the character is Chinese
 */
export function isChineseCharacter(char) {
    const charCode = char.charCodeAt(0);
    
    // Exclude Bopomofo (注音) characters
    // Basic Bopomofo: U+3105–U+312F
    // Extended Bopomofo: U+31A0–U+31BF
    if ((charCode >= 0x3105 && charCode <= 0x312F) ||
        (charCode >= 0x31A0 && charCode <= 0x31BF)) {
        return false;
    }
    
    // Check for Chinese character ranges
    return (charCode >= 0x4e00 && charCode <= 0x9fff) || 
           (charCode >= 0x3400 && charCode <= 0x4dbf) ||
           (charCode >= 0xf900 && charCode <= 0xfaff);
}

/**
 * Check if all characters in a string are Chinese
 * @param {string} value - String to check
 * @returns {boolean} True if all characters are Chinese
 */
export function isAllChinese(value) {
    if (!value || value.length === 0) {
        return false;
    }
    const chars = value.split('');
    return chars.every(char => isChineseCharacter(char));
}

