/**
 * Placeholder utilities
 * Defines special characters and helpers for placeholder handling
 */

/**
 * Private Use Area (PUA) character used to represent a placeholder entry.
 * Using a constant ensures consistent reference across modules.
 * @type {string}
 */
export const PLACEHOLDER_CHAR = '\uE000';

/**
 * Determine if a given character corresponds to the placeholder symbol.
 * @param {string} char
 * @returns {boolean}
 */
export function isPlaceholderChar(char) {
    return char === PLACEHOLDER_CHAR;
}

/**
 * Serialize metadata for dataset assignment.
 * Converts entry metadata into string form suitable for data-* attributes.
 * @param {Record<string, unknown>} metadata
 * @returns {Record<string, string>}
 */
export function serializePlaceholderMetadata(metadata) {
    const result = {};
    Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
                try {
                    result[key] = JSON.stringify(value);
                } catch (error) {
                    result[key] = String(value);
                }
            } else {
                result[key] = String(value);
            }
        }
    });
    return result;
}


