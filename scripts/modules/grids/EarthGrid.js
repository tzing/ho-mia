import { Grid } from './Grid.js';
import { FiveGrid, resolveSurnameEntries } from '../../utils/fiveGrids.js';

export class EarthGrid extends Grid {
    constructor() {
        super({
            key: 'earth',
            id: 'five-grid-earth',
            label: '地格',
            position: 'bottom',
            level: 1
        });
    }

    calculate(entries, context = {}) {
        const givenNameEntries = Array.isArray(context?.fiveGrid?.givenNameEntries)
            ? context.fiveGrid.givenNameEntries
            : null;

        const resolved = givenNameEntries
            ? { givenNameEntries }
            : resolveSurnameEntries(entries);
        const availableGivenNameEntries = resolved.givenNameEntries;

        if (availableGivenNameEntries.length === 0) {
            return null;
        }

        const isSingleName = availableGivenNameEntries.length === 1;
        const entriesUsed = isSingleName
            ? [...availableGivenNameEntries]
            : availableGivenNameEntries.slice(0, 2);

        const strokeTotal = entriesUsed.reduce((sum, entry) => {
            const strokes = FiveGrid.getStrokeCountFromEntry(entry);
            if (strokes == null) {
                throw new Error('Missing stroke count for earth grid calculation.');
            }
            return sum + strokes;
        }, 0) + (isSingleName ? 1 : 0);

        const classification = FiveGrid.derivePolarityAndElement(strokeTotal);

        return {
            strokeCount: strokeTotal,
            element: classification?.element ?? null,
            polarity: classification?.polarity ?? null,
            entriesUsed
        };
    }

    resolveIndices(entries, context = {}) {
        const indices = context?.fiveGrid?.givenNameIndices;
        if (Array.isArray(indices) && indices.length > 0) {
            return indices;
        }

        const resolved = resolveSurnameEntries(entries);
        return resolved.givenNameIndices;
    }

    getDefaultRange(defaultLength = 3) {
        if (defaultLength <= 1) {
            return {
                start: 0,
                end: 0
            };
        }
        return {
            start: 1,
            end: Math.max(1, defaultLength - 1)
        };
    }

    getRange(entries, context, defaultLength = 3) {
        const effectiveLength = context?.fiveGrid?.effectiveLength ?? 0;
        if (effectiveLength <= 1) {
            return this.getDefaultRange(defaultLength);
        }
        return super.getRange(entries, context, defaultLength);
    }
}


