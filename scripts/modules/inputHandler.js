/**
 * Input handler module
 * Handles input events, IME composition, and input processing
 */

import { validateInputForDisplay } from '../utils/validation.js';
import { updateDisplayFromEntries, updateFocusState, clearFocusState } from './display.js';
import { PLACEHOLDER_CHAR, isPlaceholderChar } from '../utils/placeholders.js';
import { getStrokeCount, getElement } from '../utils/strokes.js';

/**
 * @typedef {{ type: 'character', value: string, strokes?: number, element?: { zh: string, en: string } }} CharacterEntry
 * @typedef {{ type: 'placeholder', [key: string]: unknown }} PlaceholderEntry
 * @typedef {(CharacterEntry | PlaceholderEntry)} InputEntry
 */

/**
 * Input handler class
 */
export class InputHandler {
    constructor(nameInput, nameDisplay, toast) {
        this.nameInput = nameInput;
        this.nameDisplay = nameDisplay;
        this.toast = toast;
        this.isComposing = false;
        /**
         * @type {InputEntry[]}
         */
        this.entries = [];
        this.previousValue = '';
        /**
         * @type {Set<(entries: Array<Record<string, unknown>>) => (void|Promise<void>)>}
         */
        this.entriesChangeListeners = new Set();
    }

    /**
     * Initialize state from current input value and sync display/toast
     */
    async initialize() {
        this.rebuildEntriesFromValue(this.nameInput.value);
        this.syncInputValue();
        await this.updateDisplay();
        this.initializeFeedback();
        await this.notifyEntriesChange();
    }

    /**
     * Ensure toast visibility matches current value state
     * @param {string} value - Current input value
     * @param {boolean} isValid - Validation result for the current value
     */
    updateToastState(value, isValid = true) {
        if (!this.toast) {
            return;
        }

        if (!value || value.length === 0) {
            this.toast.show('請輸入姓氏', { type: 'info', duration: null });
            return;
        }

        if (!isValid) {
            this.toast.show('只能放中文字', { type: 'error', duration: null });
            return;
        }

        this.toast.hide();
    }

    /**
     * Sync toast with initial input state
     */
    initializeFeedback() {
        this.updateToastState(this.nameInput.value, true);
    }

    /**
     * Programmatically append a placeholder entry.
     * @param {Record<string, unknown>} metadata
     * @returns {Promise<boolean>} Whether the placeholder was inserted
     */
    async insertPlaceholder(metadata = {}) {
        if (!this.canAppendEntry()) {
            return false;
        }

        const entry = { type: 'placeholder', ...metadata };
        this.entries.push(entry);
        this.syncInputValue();
        await this.updateDisplay();
        this.updateToastState(this.nameInput.value, true);
        await this.notifyEntriesChange();
        return true;
    }

    /**
     * Determine if appending another entry respects maxlength constraint.
     * @returns {boolean}
     */
    canAppendEntry() {
        const maxLength = this.nameInput.maxLength;
        if (typeof maxLength === 'number' && maxLength > 0) {
            return this.entries.length < maxLength;
        }
        return true;
    }

    /**
     * Get enriched entries for external consumption.
     * Characters include strokes and element info, placeholders spread metadata.
     * @returns {Promise<Array<Record<string, unknown>>>}
     */
    async getEntries() {
        const result = [];

        for (const entry of this.entries) {
            if (entry.type === 'placeholder') {
                const { type, ...metadata } = entry;
                result.push({
                    type,
                    ...metadata
                });
                continue;
            }

            const [strokes, elementData] = await Promise.all([
                getStrokeCount(entry.value),
                getElement(entry.value)
            ]);

            result.push({
                type: 'character',
                value: entry.value,
                strokes,
                element: elementData ?? null
            });
        }

        return result;
    }

    /**
     * Synchronize input value from entries state.
     */
    syncInputValue() {
        this.nameInput.value = this.entriesToValueString();
        this.previousValue = this.nameInput.value;
    }

    /**
     * Process input value
     */
    async processInput() {
        // Skip validation during IME composition
        if (this.isComposing) {
            await this.updateDisplayDuringComposition();
            return;
        }

        const value = this.nameInput.value;
        const previousValue = this.previousValue;
        let isValid = true;

        if (value.length === 0) {
            this.entries = [];
            this.updateToastState(value, true);
            await this.updateDisplay();
            await this.notifyEntriesChange();
            this.previousValue = value;
            return;
        }

        if (!this.syncEntriesWithValue(value, previousValue)) {
            // Unsupported edit detected, revert to previous state
            this.syncInputValue();
            await this.updateDisplay();
            return;
        }

        this.previousValue = value;

        // Validate input (placeholders are whitelisted in validation module)
        isValid = validateInputForDisplay(value);

        this.updateToastState(value, isValid);

        await this.updateDisplay();
        await this.notifyEntriesChange();
    }

    /**
     * Handle focus event
     */
    handleFocus() {
        updateFocusState(this.nameInput, this.nameDisplay);
        // Show hint if input is empty when focused
        const value = this.nameInput.value;
        const isValid = value.length === 0 ? true : validateInputForDisplay(value);
        this.updateToastState(value, isValid);
        // Don't hide error on focus - let user see the error
    }

    /**
     * Handle blur event
     */
    handleBlur() {
        clearFocusState(this.nameDisplay);
    }

    /**
     * Handle keyup event
     */
    async handleKeyUp() {
        updateFocusState(this.nameInput, this.nameDisplay);
        if (!this.isComposing) {
            await this.processInput();
        }
    }

    /**
     * Handle IME composition start
     */
    handleCompositionStart() {
        this.isComposing = true;
    }

    /**
     * Handle IME composition update
     */
    handleCompositionUpdate() {
        this.isComposing = true;
        this.updateDisplayDuringComposition().catch(console.error);
    }

    /**
     * Handle IME composition end
     */
    handleCompositionEnd() {
        this.isComposing = false;
        // Validate after composition ends
        setTimeout(async () => {
            await this.processInput();
        }, 0);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // IME composition events
        this.nameInput.addEventListener('compositionstart', () => {
            this.handleCompositionStart();
        });

        this.nameInput.addEventListener('compositionupdate', () => {
            this.handleCompositionUpdate();
        });

        this.nameInput.addEventListener('compositionend', () => {
            this.handleCompositionEnd();
        });

        // Input events
        this.nameInput.addEventListener('input', async () => {
            await this.processInput();
        });
        
        this.nameInput.addEventListener('focus', () => {
            this.handleFocus();
        });
        
        this.nameInput.addEventListener('blur', () => {
            this.handleBlur();
        });
        
        this.nameInput.addEventListener('keyup', async () => {
            await this.handleKeyUp();
        });
    }

    /**
     * Setup container click handler to focus input
     * @param {HTMLElement} container - Container element
     * @param {HTMLElement} nameDisplay - Display element
     */
    setupContainerClick(container, nameDisplay) {
        container.addEventListener('click', (e) => {
            const target = /** @type {HTMLElement} */ (e.target);
            const clickedContainer = target === container;
            const clickedDisplay = target === nameDisplay;
            const clickedSlot = target?.classList?.contains('char-slot');
            const clickedInput = target === this.nameInput;

            if (clickedContainer || clickedDisplay || clickedSlot || clickedInput) {
                this.nameInput.focus();
            }
        });
    }

    /**
     * Build entries array from current input value.
     * Metadata for placeholders will be empty until programmatically assigned.
     * @param {string} value
     */
    rebuildEntriesFromValue(value) {
        this.entries = value.split('').map(char => {
            if (isPlaceholderChar(char)) {
                return { type: 'placeholder' };
            }
            return { type: 'character', value: char };
        });
    }

    /**
     * Convert entries array into string representation for input value.
     * @returns {string}
     */
    entriesToValueString() {
        return this.entries.map(entry => {
            if (entry.type === 'placeholder') {
                return PLACEHOLDER_CHAR;
            }
            return entry.value ?? '';
        }).join('');
    }

    /**
     * Synchronize entries based on new input value versus previous value.
     * Supports only append and backspace operations.
     * @param {string} value
     * @param {string} previousValue
     * @returns {boolean} success
     */
    syncEntriesWithValue(value, previousValue) {
        if (value === previousValue) {
            return true;
        }

        if (value.length > previousValue.length) {
            const appended = value.slice(previousValue.length);
            for (const char of appended) {
                if (!this.canAppendEntry()) {
                    return false;
                }
                if (isPlaceholderChar(char)) {
                    this.entries.push({ type: 'placeholder' });
                } else {
                    this.entries.push({ type: 'character', value: char });
                }
            }
            return true;
        }

        if (value.length < previousValue.length) {
            const diff = previousValue.length - value.length;
            for (let i = 0; i < diff; i += 1) {
                this.entries.pop();
            }
            return true;
        }

        // Same length but content differs (likely mid-string edit) - unsupported
        return false;
    }

    /**
     * Update display based on definitive entries.
     */
    async updateDisplay() {
        await updateDisplayFromEntries(this.entries, this.nameDisplay);
        updateFocusState(this.nameInput, this.nameDisplay);
    }

    /**
     * Update display to include currently composing characters.
     */
    async updateDisplayDuringComposition() {
        const baseValue = this.entriesToValueString();
        const currentValue = this.nameInput.value;

        if (!currentValue.startsWith(baseValue)) {
            // Composition occurred in unsupported position; fall back to entries display
            await this.updateDisplay();
            return;
        }

        const suffix = currentValue.slice(baseValue.length);
        const composedEntries = [...this.entries];

        for (const char of suffix) {
            if (isPlaceholderChar(char)) {
                composedEntries.push({ type: 'placeholder' });
            } else {
                composedEntries.push({ type: 'character', value: char });
            }
        }

        await updateDisplayFromEntries(composedEntries, this.nameDisplay);
        updateFocusState(this.nameInput, this.nameDisplay);
    }

    /**
     * Register a listener to be notified when entries change.
     * @param {(entries: Array<Record<string, unknown>>) => (void|Promise<void>)} listener
     * @returns {() => void} Unsubscribe function
     */
    onEntriesChange(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }
        this.entriesChangeListeners.add(listener);
        return () => {
            this.entriesChangeListeners.delete(listener);
        };
    }

    /**
     * Notify registered listeners about the latest entries snapshot.
     * @returns {Promise<void>}
     */
    async notifyEntriesChange() {
        if (this.entriesChangeListeners.size === 0) {
            return;
        }

        const listeners = Array.from(this.entriesChangeListeners);
        if (listeners.length === 0) {
            return;
        }

        let snapshot;
        try {
            snapshot = await this.getEntries();
        } catch (error) {
            console.error('Failed to collect name entries for change notification.', error);
            return;
        }

        for (const listener of listeners) {
            try {
                await listener(snapshot);
            } catch (listenerError) {
                console.error('Entries change listener threw an error.', listenerError);
            }
        }
    }
}

