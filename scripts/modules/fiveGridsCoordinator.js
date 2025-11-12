import { createDefaultGrids, Grid as BaseGrid } from './grids/index.js';

/**
 * Manages five grid definitions and caches latest results.
 */
export class FiveGridsCoordinator {
    /**
     * @param {{ grids?: Array<BaseGrid> }} [options]
     */
    constructor({ grids } = {}) {
        /**
         * @type {Map<string, BaseGrid>}
         */
        this.gridMap = new Map();
        /**
         * @type {Map<string, import('../utils/fiveGrids.js').FiveGridResult|null>}
         */
        this.results = new Map();

        const initialGrids = Array.isArray(grids) && grids.length > 0
            ? grids
            : createDefaultGrids();
        initialGrids.forEach((grid) => {
            this.registerGrid(grid);
        });
    }

    /**
     * Register a grid instance.
     * @param {BaseGrid} grid
     */
    registerGrid(grid) {
        if (!(grid instanceof BaseGrid)) {
            return;
        }
        this.gridMap.set(grid.getKey(), grid);
    }

    /**
     * Retrieve all registered grid instances in insertion order.
     * @returns {BaseGrid[]}
     */
    getGrids() {
        return Array.from(this.gridMap.values());
    }

    /**
     * Execute calculations for all registered grids.
     * @param {Array<Record<string, unknown>>} entries
     * @param {Record<string, unknown>} [context]
     * @returns {Promise<Map<string, import('../utils/fiveGrids.js').FiveGridResult|null>>}
     */
    async update(entries, context = {}) {
        const sourceEntries = Array.isArray(entries) ? entries : [];
        const resultMap = new Map();

        const grids = this.getGrids();
        for (const grid of grids) {
            const key = grid.getKey();
            try {
                const enhancedContext = {
                    ...context,
                    results: this.results
                };
                const result = await grid.calculate(sourceEntries, enhancedContext);
                const normalized = result ?? null;
                this.results.set(key, normalized);
                resultMap.set(key, normalized);
            } catch (error) {
                console.error(`Failed to calculate five grid "${key}".`, error);
                this.results.set(key, null);
                resultMap.set(key, null);
            }
        }

        return resultMap;
    }

    /**
     * Retrieve grid instance by key.
     * @param {string} key
     * @returns {BaseGrid|null}
     */
    getGrid(key) {
        if (!key) {
            return null;
        }
        return this.gridMap.get(key) ?? null;
    }

    /**
     * Retrieve cached result for a specific grid.
     * @param {string} key
     * @returns {import('../utils/fiveGrids.js').FiveGridResult|null}
     */
    getResult(key) {
        if (!key) {
            return null;
        }
        return this.results.get(key) ?? null;
    }

    /**
     * Reset stored results.
     */
    reset() {
        this.results.clear();
    }
}


