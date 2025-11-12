/**
 * Stroke count and element utilities
 * Provides functions for querying stroke counts and five elements from characters.json
 */

/**
 * Five Element enum
 * Maps English element names to Chinese names
 */
export const FiveElement = {
    METAL: { en: 'metal', zh: '金' },
    WOOD: { en: 'wood', zh: '木' },
    WATER: { en: 'water', zh: '水' },
    FIRE: { en: 'fire', zh: '火' },
    EARTH: { en: 'earth', zh: '土' },
};

let charactersData = null;
let strokeMap = null; // Map for fast lookup: char -> strokeCount
let elementMap = null; // Map for fast lookup: char -> element (English)

/**
 * Load characters data from JSON file and build maps
 * @returns {Promise<Object>} Object containing strokeMap and elementMap
 */
async function loadCharacterMaps() {
    if (strokeMap && elementMap) {
        return { strokeMap, elementMap };
    }

    try {
        const response = await fetch('/data/characters.json');
        charactersData = await response.json();
        
        // Build maps for fast lookup
        strokeMap = new Map();
        elementMap = new Map();
        
        for (const entry of charactersData) {
            if (entry.chars && entry.draw && entry.element) {
                // Add each character in the chars string to both maps
                for (const char of entry.chars) {
                    strokeMap.set(char, entry.draw);
                    elementMap.set(char, entry.element);
                }
            }
        }
        
        return { strokeMap, elementMap };
    } catch (error) {
        console.error('Failed to load characters data:', error);
        strokeMap = new Map();
        elementMap = new Map();
        return { strokeMap, elementMap };
    }
}

/**
 * Get stroke count for a character
 * @param {string} char - Single Chinese character
 * @returns {Promise<number|null>} Stroke count or null if not found
 */
export async function getStrokeCount(char) {
    const { strokeMap } = await loadCharacterMaps();
    return strokeMap.get(char) || null;
}

/**
 * Get five element for a character
 * @param {string} char - Single Chinese character
 * @returns {Promise<Object|null>} FiveElement object with en and zh properties, or null if not found
 */
export async function getElement(char) {
    const { elementMap } = await loadCharacterMaps();
    const elementEn = elementMap.get(char);
    
    if (!elementEn) return null;
    
    // Find matching element from FiveElement enum
    const element = Object.values(FiveElement).find(e => e.en === elementEn);
    return element || null;
}

/**
 * Get stroke counts for multiple characters
 * @param {string} text - Text containing Chinese characters
 * @returns {Promise<Array<number|null>>} Array of stroke counts (null if not found)
 */
export async function getStrokeCounts(text) {
    const chars = text.split('');
    const promises = chars.map(char => getStrokeCount(char));
    return Promise.all(promises);
}

/**
 * Get five elements for multiple characters
 * @param {string} text - Text containing Chinese characters
 * @returns {Promise<Array<Object|null>>} Array of FiveElement objects with en and zh properties (null if not found)
 */
export async function getElements(text) {
    const chars = text.split('');
    const promises = chars.map(char => getElement(char));
    return Promise.all(promises);
}

