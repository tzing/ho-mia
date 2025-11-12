/**
 * Display module
 * Handles the visual display of name input characters
 */

import { getStrokeCount, getElement } from '../utils/strokes.js';
import { serializePlaceholderMetadata, isPlaceholderChar } from '../utils/placeholders.js';

/**
 * @typedef {Object} CharacterEntry
 * @property {'character'} type
 * @property {string} value
 * @property {number} [strokes]
 * @property {string} [element]
 */

/**
 * @typedef {Object} PlaceholderEntry
 * @property {'placeholder'} type
 * @property {number} [strokes]
 * @property {Record<string, unknown>} [meta]
 */

/**
 * @typedef {CharacterEntry | (PlaceholderEntry & Record<string, unknown>)} DisplayEntry
 */

/**
 * Remove all dataset properties from a slot.
 * @param {HTMLElement} slot
 */
function resetSlotDataset(slot) {
    Object.keys(slot.dataset).forEach((key) => {
        delete slot.dataset[key];
    });
}

/**
 * Update the character slots display based on a list of entries.
 * @param {DisplayEntry[]} entries - Entries describing the display state
 * @param {HTMLElement} nameDisplay - The display container element
 */
export async function updateDisplayFromEntries(entries, nameDisplay) {
    const currentSlots = nameDisplay.querySelectorAll('.char-slot');
    const slotsToShow = Math.max(3, entries.length);

    for (let index = 0; index < slotsToShow; index++) {
        let slot = currentSlots[index];

        if (!slot) {
            slot = document.createElement('span');
            slot.className = 'char-slot';
            slot.setAttribute('data-index', index.toString());
            nameDisplay.appendChild(slot);
        }

        if (index < entries.length) {
            const entry = entries[index];
            resetSlotDataset(slot);
            slot.dataset.index = index.toString();
            slot.classList.remove('empty');
            slot.classList.toggle('char-slot--placeholder', entry.type === 'placeholder');

            // Clear existing annotations
            clearStrokeDisplay(slot);
            clearElementDisplay(slot);

            if (entry.type === 'placeholder') {
                slot.textContent = '';
                slot.dataset.type = 'placeholder';

                const metadata = { ...entry };
                delete metadata.type;

                const serialized = serializePlaceholderMetadata(metadata);
                Object.entries(serialized).forEach(([key, value]) => {
                    slot.dataset[key] = value;
                });

                if (typeof entry.strokes === 'number' && !Number.isNaN(entry.strokes)) {
                    slot.dataset.strokes = String(entry.strokes);
                    updateStrokeDisplay(slot, entry.strokes);
                }
            } else {
                const char = entry.value ?? '';
                slot.dataset.type = 'character';
                slot.dataset.value = char;
                slot.textContent = char;
                slot.classList.remove('char-slot--placeholder');

                const strokeCount = entry.strokes ?? await getStrokeCount(char);
                const element = entry.element ?? await getElement(char);

                if (strokeCount !== null) {
                    slot.dataset.strokes = String(strokeCount);
                    updateStrokeDisplay(slot, strokeCount);
                }

                if (element !== null) {
                    slot.dataset.element = element.en;
                    updateElementDisplay(slot, element);
                }
            }
        } else {
            resetSlotDataset(slot);
            slot.dataset.index = index.toString();
            slot.textContent = '';
            slot.classList.add('empty');
            slot.classList.remove('char-slot--placeholder');
            clearStrokeDisplay(slot);
            clearElementDisplay(slot);
        }
    }

    const allSlots = nameDisplay.querySelectorAll('.char-slot');
    allSlots.forEach((slot, index) => {
        if (index >= slotsToShow) {
            slot.remove();
        }
    });
}

/**
 * Update the character slots display based on input value
 * @param {HTMLInputElement} nameInput - The input element
 * @param {HTMLElement} nameDisplay - The display container element
 */
export async function updateDisplay(nameInput, nameDisplay) {
    const entries = nameInput.value.split('').map((char) => {
        if (isPlaceholderChar(char)) {
            return { type: 'placeholder' };
        }
        return { type: 'character', value: char };
    });

    await updateDisplayFromEntries(entries, nameDisplay);
}

/**
 * Update stroke count display for a character slot
 * @param {HTMLElement} slot - Character slot element
 * @param {number|null} strokeCount - Stroke count or null
 */
function updateStrokeDisplay(slot, strokeCount) {
    // Remove existing stroke display
    clearStrokeDisplay(slot);
    
    if (strokeCount !== null) {
        const strokeDisplay = document.createElement('span');
        strokeDisplay.className = 'stroke-count';
        strokeDisplay.textContent = `${strokeCount}劃`;
        slot.appendChild(strokeDisplay);
        
        // Update positions after stroke count is added
        const elementLabel = slot.querySelector('.element-label');
        if (elementLabel) {
            // Both labels exist: position stroke count to the left of element
            // Use requestAnimationFrame to ensure element is rendered
            requestAnimationFrame(() => {
                updateElementLabelPosition(strokeDisplay, elementLabel);
            });
        }
    }
}

/**
 * Clear stroke count display from a character slot
 * @param {HTMLElement} slot - Character slot element
 */
function clearStrokeDisplay(slot) {
    const existingStroke = slot.querySelector('.stroke-count');
    if (existingStroke) {
        existingStroke.remove();
    }
}

/**
 * Update five element display for a character slot
 * @param {HTMLElement} slot - Character slot element
 * @param {Object|null} element - FiveElement object with en and zh properties, or null
 */
function updateElementDisplay(slot, element) {
    // Remove existing element display
    clearElementDisplay(slot);
    
    if (element !== null && element.zh && element.en) {
        const elementDisplay = document.createElement('span');
        elementDisplay.className = 'element-label';
        // Display Chinese name in UI
        elementDisplay.textContent = element.zh;
        // Use English name for data attribute (for CSS styling)
        elementDisplay.setAttribute('data-element', element.en);
        // Element label is positioned at bottom right (right: 6px)
        slot.appendChild(elementDisplay);
        
        // Update stroke count position relative to element label
        const strokeDisplay = slot.querySelector('.stroke-count');
        if (strokeDisplay) {
            // Use double requestAnimationFrame to ensure element is rendered
            requestAnimationFrame(() => {
                updateElementLabelPosition(strokeDisplay, elementDisplay);
            });
        }
    }
}

/**
 * Update element label position to be to the right of stroke count
 * Both labels should be positioned at bottom right corner, with element on the right
 * Uses CSS variables to control positioning, avoiding direct style manipulation
 * @param {HTMLElement} strokeDisplay - Stroke count element
 * @param {HTMLElement} elementLabel - Element label element
 */
function updateElementLabelPosition(strokeDisplay, elementLabel) {
    // Wait for layout to calculate positions
    requestAnimationFrame(() => {
        // Get computed styles to ensure accurate measurements
        const elementRect = elementLabel.getBoundingClientRect();
        const spacing = 10; // Increased spacing to prevent overlap and improve readability
        
        // Element label is positioned at right: 6px (bottom right corner)
        // Stroke count should be positioned to the left of element label
        const elementWidth = elementRect.width;
        const strokeRight = elementWidth + spacing;
        
        // Set stroke count position using CSS variable
        // This avoids direct style manipulation and follows the project's style handling guidelines
        strokeDisplay.style.setProperty('--stroke-right', `${strokeRight}px`);
    });
}

/**
 * Clear five element display from a character slot
 * Also resets stroke count position CSS variable if stroke count still exists
 * @param {HTMLElement} slot - Character slot element
 */
function clearElementDisplay(slot) {
    const existingElement = slot.querySelector('.element-label');
    if (existingElement) {
        existingElement.remove();
        // Reset stroke count position to default when element label is removed
        const strokeDisplay = slot.querySelector('.stroke-count');
        if (strokeDisplay) {
            strokeDisplay.style.removeProperty('--stroke-right');
        }
    }
}

/**
 * Update focus state for the next empty character slot
 * @param {HTMLInputElement} nameInput - The input element
 * @param {HTMLElement} nameDisplay - The display container element
 */
export function updateFocusState(nameInput, nameDisplay) {
    const currentSlots = nameDisplay.querySelectorAll('.char-slot');
    const value = nameInput.value;
    const nextEmptyIndex = value.length;

    currentSlots.forEach((slot, index) => {
        if (index === nextEmptyIndex && slot.classList.contains('empty')) {
            slot.classList.add('focused');
        } else {
            slot.classList.remove('focused');
        }
    });
}

/**
 * Clear focus state from all slots
 * @param {HTMLElement} nameDisplay - The display container element
 */
export function clearFocusState(nameDisplay) {
    const currentSlots = nameDisplay.querySelectorAll('.char-slot');
    currentSlots.forEach(slot => slot.classList.remove('focused'));
}

/**
 * Initialize character slots with empty class
 * @param {NodeList} charSlots - List of character slot elements
 */
export function initializeSlots(charSlots) {
    charSlots.forEach(slot => {
        if (!slot.textContent.trim()) {
            slot.classList.add('empty');
        }
    });
}


