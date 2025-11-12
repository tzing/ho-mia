import { Grid } from './Grid.js';
import { FiveGrid, resolveSurnameEntries } from '../../utils/fiveGrids.js';

export class OuterGrid extends Grid {
    constructor() {
        super({
            key: 'outer',
            id: 'five-grid-outer',
            label: '外格',
            position: 'top',
            level: 1
        });
    }

    calculate(entries, context = {}) {
        const resolved = resolveSurnameEntries(entries, {
            effectiveLength: context?.fiveGrid?.effectiveLength,
            surnameLengthOverride: context?.fiveGrid?.surnameLength,
            countableEntriesOverride: context?.fiveGrid?.countableEntries,
            countableIndicesOverride: context?.fiveGrid?.countableIndices
        });

        const { surnameEntries, givenNameEntries, effectiveLength } = resolved;
        const resultsMap = context?.results;
        const getResult = (key) => {
            if (!resultsMap) {
                return null;
            }
            if (typeof resultsMap.get === 'function') {
                return resultsMap.get(key) ?? null;
            }
            return resultsMap[key] ?? null;
        };

        if (effectiveLength <= 1) {
            return null;
        }

        if (surnameEntries.length === 0 || givenNameEntries.length === 0) {
            return null;
        }

        const surnameLength = surnameEntries.length;
        const givenNameCount = givenNameEntries.length;

        if (surnameLength === 1 && givenNameCount === 1) {
            const classification = FiveGrid.derivePolarityAndElement(2);
            return {
                strokeCount: 2,
                element: classification?.element ?? null,
                polarity: classification?.polarity ?? null,
                entriesUsed: []
            };
        }

        const totalResult = getResult('total');
        const personalityResult = getResult('personality');

        if (!totalResult || !personalityResult) {
            return null;
        }

        const base = totalResult.strokeCount - personalityResult.strokeCount;
        let strokeTotal = base;

        if (surnameLength === 1 && givenNameCount >= 2) {
            strokeTotal = base + 1;
        } else if (surnameLength === 2 && givenNameCount === 1) {
            strokeTotal = base + 1;
        }

        const classification = strokeTotal > 0
            ? FiveGrid.derivePolarityAndElement(strokeTotal)
            : null;

        return {
            strokeCount: strokeTotal,
            element: classification?.element ?? null,
            polarity: classification?.polarity ?? null,
            entriesUsed: []
        };
    }

    resolveIndices(entries, context = {}) {
        const indices = context?.fiveGrid?.countableIndices;
        if (Array.isArray(indices) && indices.length > 0) {
            return indices;
        }

        const resolved = resolveSurnameEntries(entries);
        return resolved.countableIndices;
    }

    getRange(entries, context, defaultLength = 3) {
        const effectiveLength = context?.fiveGrid?.effectiveLength ?? 0;
        if (effectiveLength <= 1) {
            const end = Math.max(2, defaultLength - 1);
            return { start: 0, end };
        }
        return super.getRange(entries, context, defaultLength);
    }
}


