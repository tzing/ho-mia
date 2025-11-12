import { Grid } from './Grid.js';
import { FiveGrid, resolveSurnameEntries } from '../../utils/fiveGrids.js';

export class PersonalityGrid extends Grid {
    constructor() {
        super({
            key: 'personality',
            id: 'five-grid-personality',
            label: '人格',
            position: 'bottom',
            level: 2
        });
    }

    resolveNameSegments(entries, context = {}) {
        const hasContextSegments = Array.isArray(context?.fiveGrid?.surnameEntries)
            && Array.isArray(context?.fiveGrid?.givenNameEntries)
            && context.fiveGrid.surnameEntries.length > 0
            && context.fiveGrid.givenNameEntries.length > 0;

        if (hasContextSegments) {
            return {
                surnameEntries: context.fiveGrid.surnameEntries,
                givenNameEntries: context.fiveGrid.givenNameEntries,
                surnameIndices: context.fiveGrid.surnameIndices ?? [],
                givenNameIndices: context.fiveGrid.givenNameIndices ?? []
            };
        }

        return resolveSurnameEntries(entries);
    }

    calculate(entries, context = {}) {
        const { surnameEntries, givenNameEntries } = this.resolveNameSegments(entries, context);

        if (surnameEntries.length === 0 || givenNameEntries.length === 0) {
            return null;
        }

        const primarySurname = surnameEntries[surnameEntries.length - 1];
        const primaryGivenName = givenNameEntries[0];

        const entriesUsed = [primarySurname, primaryGivenName];
        const strokeTotal = [primarySurname, primaryGivenName]
            .reduce((sum, entry) => {
                const strokes = FiveGrid.getStrokeCountFromEntry(entry);
                if (strokes == null) {
                    throw new Error('Missing stroke count for personality grid calculation.');
                }
                return sum + strokes;
            }, 0);

        const classification = FiveGrid.derivePolarityAndElement(strokeTotal);

        return {
            strokeCount: strokeTotal,
            element: classification?.element ?? null,
            polarity: classification?.polarity ?? null,
            entriesUsed
        };
    }

    resolveIndices(entries, context = {}) {
        const resolved = this.resolveNameSegments(entries, context);
        const { surnameIndices = [], givenNameIndices = [] } = resolved;
        const indices = [];
        if (surnameIndices.length > 0) {
            indices.push(surnameIndices[surnameIndices.length - 1]);
        }
        if (givenNameIndices.length > 0) {
            indices.push(givenNameIndices[0]);
        }
        return indices;
    }

    // eslint-disable-next-line class-methods-use-this
    getDefaultRange(defaultLength = 3) {
        const end = Math.max(2, defaultLength - 1);
        return {
            start: 0,
            end
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


