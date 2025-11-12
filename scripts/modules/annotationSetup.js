import { FiveGridsCoordinator } from './fiveGridsCoordinator.js';
import { resolveSurnameEntries } from '../utils/fiveGrids.js';

/**
 * Annotation setup module
 * Initializes baseline annotation lines for the name display.
 */

const DEFAULT_ASSUMED_LENGTH = 3;

/**
 * Calculate the effective number of name entries from the enriched dataset.
 * @param {Array<Record<string, unknown>>} entries
 * @returns {number}
 */
function calculateEffectiveLength(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return 0;
    }

    return entries.reduce((count, entry) => {
        if (!entry || typeof entry !== 'object') {
            return count;
        }

        const entryType = entry.type;
        if (entryType === 'character' || entryType === 'placeholder') {
            return count + 1;
        }
        return count;
    }, 0);
}

export function setupInitialAnnotationLines({
    inputHandler,
    annotationManager,
    defaultLength = DEFAULT_ASSUMED_LENGTH
} = {}) {
    if (!inputHandler) {
        throw new Error('setupInitialAnnotationLines requires an inputHandler instance.');
    }
    if (!annotationManager) {
        throw new Error('setupInitialAnnotationLines requires an annotationManager instance.');
    }

    const lines = new Map();
    const fiveGridsCoordinator = new FiveGridsCoordinator();
    const gridInstances = fiveGridsCoordinator.getGrids();

    const initialContext = {
        entries: [],
        effectiveLength: 0,
        defaultLength,
        fiveGrid: resolveSurnameEntries([], { effectiveLength: 0 })
    };

    for (const grid of gridInstances) {
        const initialRange = grid.getRange(initialContext.entries, initialContext, defaultLength);
        const line = annotationManager.createLine({
            id: grid.getId(),
            label: grid.getLabel(),
            position: grid.getPosition(),
            level: grid.getLevel(),
            range: initialRange
        });
        line.element.dataset.grid = grid.getKey();
        line.clearBadge();
        lines.set(grid.getKey(), {
            line,
            grid
        });
    }

    if (typeof window !== 'undefined') {
        window.getFiveGridResult = (gridKey) => fiveGridsCoordinator.getResult(gridKey);
    }

    const handleEntriesChange = async (entries) => {
        const effectiveLength = calculateEffectiveLength(entries);
        const surnameContext = resolveSurnameEntries(entries, { effectiveLength });
        const context = {
            entries,
            effectiveLength,
            defaultLength,
            fiveGrid: {
                ...surnameContext,
                effectiveLength
            }
        };

        const resultMap = await fiveGridsCoordinator.update(entries, context);

        for (const { line, grid } of lines.values()) {
            const nextRange = grid.getRange(entries, context, defaultLength);
            line.updateRange(nextRange);

            const gridResult = resultMap.get(grid.getKey()) ?? null;
            if (gridResult) {
                line.setBadgeData(gridResult);
            } else {
                line.clearBadge();
            }
        }
    };

    const unsubscribe = inputHandler.onEntriesChange(handleEntriesChange);

    inputHandler.getEntries()
        .then(handleEntriesChange)
        .catch((error) => {
            console.error('Failed to synchronize annotation lines with initial entries.', error);
        });

    return () => {
        unsubscribe();
        for (const { line } of lines.values()) {
            annotationManager.removeLine(line.id);
        }
        lines.clear();
    };
}


