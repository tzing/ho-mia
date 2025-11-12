import { Grid } from './Grid.js';
import { FiveGrid, resolveSurnameEntries } from '../../utils/fiveGrids.js';

export class HeavenGrid extends Grid {
    constructor() {
        super({
            key: 'heaven',
            id: 'five-grid-heaven',
            label: '天格',
            position: 'bottom',
            level: 1
        });
    }

    calculate(entries, context = {}) {
        const providedSurnameEntries = Array.isArray(context?.fiveGrid?.surnameEntries)
            ? context.fiveGrid.surnameEntries
            : null;

        const surnameEntries = providedSurnameEntries ?? resolveSurnameEntries(entries, {
            effectiveLength: context?.fiveGrid?.effectiveLength,
            surnameLengthOverride: context?.fiveGrid?.surnameLength,
            countableEntriesOverride: context?.fiveGrid?.countableEntries,
            countableIndicesOverride: context?.fiveGrid?.countableIndices
        }).surnameEntries;

        if (!surnameEntries || surnameEntries.length === 0) {
            return null;
        }

        const surnameStrokes = FiveGrid.sumStrokeCounts(surnameEntries);
        if (surnameStrokes == null) {
            return null;
        }

        const surnameLength = surnameEntries.length;
        const strokeTotal = surnameLength === 1 ? surnameStrokes + 1 : surnameStrokes;
        const classification = FiveGrid.derivePolarityAndElement(strokeTotal);

        return {
            strokeCount: strokeTotal,
            element: classification?.element ?? null,
            polarity: classification?.polarity ?? null,
            entriesUsed: surnameEntries
        };
    }

    resolveIndices(entries, context = {}) {
        const indices = context?.fiveGrid?.surnameIndices;
        if (Array.isArray(indices) && indices.length > 0) {
            return indices;
        }

        const resolved = resolveSurnameEntries(entries);
        return resolved.surnameIndices;
    }

    // eslint-disable-next-line class-methods-use-this
    getDefaultRange(defaultLength = 3) {
        return {
            start: 0,
            end: 0
        };
    }
}


