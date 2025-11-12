/**
 * Base class for five grid definitions.
 * Provides shared metadata and helper utilities for range resolution.
 */
export class Grid {
    /**
     * @param {{ key: string, id: string, label: string, position?: 'top'|'bottom', level?: number }} options
     */
    constructor({ key, id, label, position = 'top', level = 1 }) {
        if (!key || !id) {
            throw new Error('Grid requires both key and id.');
        }
        this.key = key;
        this.id = id;
        this.label = label ?? '';
        this.position = position === 'bottom' ? 'bottom' : 'top';
        this.level = Math.max(1, Math.floor(level ?? 1));
    }

    getKey() {
        return this.key;
    }

    getId() {
        return this.id;
    }

    getLabel() {
        return this.label;
    }

    getPosition() {
        return this.position;
    }

    getLevel() {
        return this.level;
    }

    /**
     * Calculate five grid result. Subclasses should override.
     * @param {Array<Record<string, unknown>>} entries
     * @param {Record<string, unknown>} context
     * @returns {import('../../utils/fiveGrids.js').FiveGridResult|null}
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    calculate(entries, context) {
        return null;
    }

    /**
     * Resolve entry indices that participate in the grid's range.
     * Subclasses should override when custom behavior is needed.
     * @param {Array<Record<string, unknown>>} entries
     * @param {Record<string, unknown>} context
     * @returns {number[]}
     */
    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    resolveIndices(entries, context) {
        return [];
    }

    /**
     * Determine the range of entries for annotation lines.
     * @param {Array<Record<string, unknown>>} entries
     * @param {Record<string, unknown>} context
     * @param {number} [defaultLength=3]
     * @returns {{ start: number, end: number }}
     */
    getDefaultRange(defaultLength = 3, context) { // eslint-disable-line no-unused-vars
        const safeLength = Math.max(1, defaultLength);
        return {
            start: 0,
            end: safeLength - 1
        };
    }

    getRange(entries, context, defaultLength = 3) {
        const indices = this.resolveIndices(entries, context) ?? [];
        if (indices.length === 0) {
            return this.getDefaultRange(defaultLength, context);
        }

        const sorted = indices.slice().sort((a, b) => a - b);
        const start = sorted[0];
        const end = sorted[sorted.length - 1];

        return {
            start,
            end
        };
    }
}


