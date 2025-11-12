/**
 * Stateless utilities for five grid calculations.
 * All methods operate on name entry arrays returned by getNameEntries().
 */
import { FiveElement } from './strokes.js';

/**
 * Determine whether an entry should be counted for five grid calculations.
 * @param {Record<string, unknown>} entry
 * @returns {boolean}
 */
export function isCountableEntry(entry) {
    if (!entry || typeof entry !== 'object') {
        return false;
    }
    const { type } = entry;
    return type === 'character' || type === 'placeholder';
}

/**
 * Filter entries to include only those counted for five grid calculations.
 * @param {Array<Record<string, unknown>>} entries
 * @returns {Array<Record<string, unknown>>}
 */
export function filterCountableEntries(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [];
    }
    return entries.filter(isCountableEntry);
}

/**
 * Determine surname length based on effective entry count.
 * Entries length >= 4 is treated as compound surname.
 * @param {number} effectiveLength
 * @returns {number}
 */
export function determineSurnameLengthFromEffectiveCount(effectiveLength) {
    if (typeof effectiveLength !== 'number' || effectiveLength <= 0) {
        return 0;
    }
    if (effectiveLength >= 4) {
        return 2;
    }
    return 1;
}

/**
 * Resolve countable entries and surname slice using effective length context.
 * @param {Array<Record<string, unknown>>} entries
 * @param {{ effectiveLength?: number, surnameLengthOverride?: number, countableEntriesOverride?: Array<Record<string, unknown>>, countableIndicesOverride?: number[] }} [options]
 * @returns {{
 *   countableEntries: Array<Record<string, unknown>>,
 *   countableIndices: number[],
 *   surnameEntries: Array<Record<string, unknown>>,
 *   surnameIndices: number[],
 *   givenNameEntries: Array<Record<string, unknown>>,
 *   givenNameIndices: number[],
 *   surnameLength: number,
 *   effectiveLength: number
 * }}
 */
export function resolveSurnameEntries(entries, {
    effectiveLength,
    surnameLengthOverride,
    countableEntriesOverride,
    countableIndicesOverride
} = {}) {
    const countableEntries = Array.isArray(countableEntriesOverride)
        ? countableEntriesOverride
        : filterCountableEntries(entries);

    const countableIndices = Array.isArray(countableIndicesOverride)
        ? countableIndicesOverride
        : entries.reduce((indices, entry, index) => {
            if (isCountableEntry(entry)) {
                indices.push(index);
            }
            return indices;
        }, []);

    let surnameLength = 0;
    if (typeof surnameLengthOverride === 'number' && surnameLengthOverride >= 0) {
        surnameLength = Math.min(surnameLengthOverride, countableEntries.length);
    } else {
        const inferredEffective = typeof effectiveLength === 'number'
            ? effectiveLength
            : countableEntries.length;
        surnameLength = determineSurnameLengthFromEffectiveCount(inferredEffective);
        surnameLength = Math.min(surnameLength, countableEntries.length);
    }

    const surnameEntries = surnameLength > 0 ? countableEntries.slice(0, surnameLength) : [];
    const surnameIndices = surnameLength > 0 ? countableIndices.slice(0, surnameLength) : [];

    const givenNameEntries = surnameLength > 0
        ? countableEntries.slice(surnameLength)
        : countableEntries.slice(0);
    const givenNameIndices = surnameLength > 0
        ? countableIndices.slice(surnameLength)
        : countableIndices.slice(0);

    return {
        countableEntries,
        countableIndices,
        surnameEntries,
        surnameIndices,
        givenNameEntries,
        givenNameIndices,
        surnameLength,
        effectiveLength: typeof effectiveLength === 'number'
            ? effectiveLength
            : countableEntries.length
    };
}

export const FiveGridPolarity = Object.freeze({
    YIN: 'yin',
    YANG: 'yang'
});

export class FiveGrid {
    /**
     * Extract numeric stroke count from an entry.
     * Accepts both number and numeric string values.
     * @param {Record<string, unknown>} entry
     * @returns {number|null}
     */
    static getStrokeCountFromEntry(entry) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }

        const rawValue = entry.strokes ?? entry.strokeCount ?? null;
        if (rawValue == null) {
            return null;
        }

        const numericValue = Number(rawValue);
        if (Number.isNaN(numericValue) || numericValue <= 0) {
            return null;
        }
        return numericValue;
    }

    /**
     * Sum stroke counts for a set of entries.
     * Returns null if any entry lacks stroke information.
     * @param {Array<Record<string, unknown>>} entries
     * @returns {number|null}
     */
    static sumStrokeCounts(entries) {
        if (!Array.isArray(entries) || entries.length === 0) {
            return null;
        }

        let total = 0;
        for (const entry of entries) {
            const strokes = FiveGrid.getStrokeCountFromEntry(entry);
            if (strokes == null) {
                return null;
            }
            total += strokes;
        }
        return total;
    }

    /**
     * Derive polarity (yin/yang) and five element from stroke count.
     * Uses ones digit classification: 1/3/5/7/9 -> yang, 2/4/6/8/0 -> yin.
     * Element grouping: 1,2 => wood; 3,4 => fire; 5,6 => earth; 7,8 => metal; 9,0 => water.
     * @param {number} strokeCount
     * @returns {{ polarity: 'yin'|'yang', element: { en: string, zh: string } } | null}
     */
    static derivePolarityAndElement(strokeCount) {
        if (typeof strokeCount !== 'number' || !Number.isFinite(strokeCount) || strokeCount <= 0) {
            return null;
        }

        const digit = strokeCount % 10;

        const polarity = digit % 2 === 0 ? FiveGridPolarity.YIN : FiveGridPolarity.YANG;

        const elementGroups = [
            { digits: [1, 2], element: FiveElement.WOOD },
            { digits: [3, 4], element: FiveElement.FIRE },
            { digits: [5, 6], element: FiveElement.EARTH },
            { digits: [7, 8], element: FiveElement.METAL },
            { digits: [9, 0], element: FiveElement.WATER }
        ];

        const matchedGroup = elementGroups.find(({ digits }) => digits.includes(digit));

        if (!matchedGroup) {
            return null;
        }

        return {
            polarity,
            element: matchedGroup.element
        };
    }

}


