import { Grid } from './Grid.js';
import { FiveGrid, resolveSurnameEntries, filterCountableEntries } from '../../utils/fiveGrids.js';

export class TotalGrid extends Grid {
    constructor() {
        super({
            key: 'total',
            id: 'five-grid-total',
            label: '總格',
            position: 'top',
            level: 2
        });
    }

    calculate(entries, context = {}) {
        const countableEntries = Array.isArray(context?.fiveGrid?.countableEntries)
            ? context.fiveGrid.countableEntries
            : filterCountableEntries(entries);
        const effectiveLength = context?.fiveGrid?.effectiveLength ?? countableEntries.length;

        if (effectiveLength <= 1) {
            return null;
        }

        if (countableEntries.length === 0) {
            return null;
        }

        const strokeTotal = FiveGrid.sumStrokeCounts(countableEntries);
        if (strokeTotal == null) {
            return null;
        }

        const classification = FiveGrid.derivePolarityAndElement(strokeTotal);

        return {
            strokeCount: strokeTotal,
            element: classification?.element ?? null,
            polarity: classification?.polarity ?? null,
            entriesUsed: countableEntries
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


