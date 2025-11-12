/**
 * Annotation line module
 * Provides OOP classes for managing annotation line UI components.
 */

const POSITION_TOP = 'top';
const POSITION_BOTTOM = 'bottom';

let lineIdCounter = 0;

function generateLineId() {
    lineIdCounter += 1;
    return `annotation-line-${lineIdCounter}`;
}

class AnnotationContainer {
    constructor(element, { order }) {
        this.element = element;
        this.order = order;
        /**
         * @type {Map<number, HTMLElement>}
         */
        this.levelRows = new Map();
    }

    /**
     * Retrieve or create a level row container.
     * @param {number} level
     * @returns {HTMLElement}
     */
    getOrCreateRow(level) {
        if (this.levelRows.has(level)) {
            return this.levelRows.get(level);
        }

        const row = document.createElement('div');
        row.className = 'annotation-line-row';
        row.dataset.level = String(level);

        this.insertRowElement(row, level);
        this.levelRows.set(level, row);
        return row;
    }

    /**
     * Insert a row element respecting configured order.
     * @param {HTMLElement} rowElement
     * @param {number} level
     */
    insertRowElement(rowElement, level) {
        if (!this.element) {
            throw new Error('Annotation container element is missing.');
        }

        const children = Array.from(this.element.children);
        if (children.length === 0) {
            this.element.appendChild(rowElement);
            return;
        }

        if (children.length === 0) {
            this.element.appendChild(rowElement);
            return;
        }

        if (this.order === 'ascending') {
            for (const child of children) {
                const childLevel = Number(child.dataset.level) || 0;
                if (childLevel > level) {
                    this.element.insertBefore(rowElement, child);
                    return;
                }
            }
            this.element.appendChild(rowElement);
            return;
        }

        for (const child of children) {
            const childLevel = Number(child.dataset.level) || 0;
            if (childLevel < level) {
                this.element.insertBefore(rowElement, child);
                return;
            }
        }
        this.element.appendChild(rowElement);
    }

    insert(line) {
        if (!this.element) {
            throw new Error('Annotation container element is missing.');
        }

        line.element.dataset.level = String(line.level);
        const row = this.getOrCreateRow(line.level);

        const rowChildren = Array.from(row.children);
        if (rowChildren.length === 0) {
            row.appendChild(line.element);
            return;
        }

        if (this.order === 'ascending') {
            for (const child of rowChildren) {
                const childLevel = Number(child.dataset.sublevel) || 0;
                if (childLevel > line.level) {
                    row.insertBefore(line.element, child);
                    return;
                }
            }
            row.appendChild(line.element);
            return;
        }

        for (const child of rowChildren) {
            const childLevel = Number(child.dataset.sublevel) || 0;
            if (childLevel < line.level) {
                row.insertBefore(line.element, child);
                return;
            }
        }
        row.appendChild(line.element);
    }

    remove(line) {
        if (!this.element) {
            return;
        }

        const row = line.element.parentElement;
        if (!row || row.parentElement !== this.element) {
            return;
        }

        row.removeChild(line.element);

        if (row.children.length === 0) {
            this.element.removeChild(row);
            const level = Number(row.dataset.level);
            if (!Number.isNaN(level)) {
                this.levelRows.delete(level);
            }
        }
    }
}

/**
 * Manages annotation lines bound to a name display component.
 */
export class AnnotationManager {
    /**
     * @param {Object} options - Manager options.
     * @param {HTMLElement} options.displayElement - Element containing character slots.
     * @param {HTMLElement} options.topStackElement - Container for top annotation lines.
     * @param {HTMLElement} options.bottomStackElement - Container for bottom annotation lines.
     * @param {string} [options.charSlotSelector='.char-slot'] - Selector for character slots.
     */
    constructor({
        displayElement,
        topStackElement,
        bottomStackElement,
        charSlotSelector = '.char-slot'
    }) {
        if (!displayElement) {
            throw new Error('displayElement is required for AnnotationManager.');
        }

        this.displayElement = displayElement;
        this.charSlotSelector = charSlotSelector;
        this.lines = new Map();
        this.pendingUpdate = false;

        this.containers = {
            [POSITION_TOP]: new AnnotationContainer(topStackElement, { order: 'descending' }),
            [POSITION_BOTTOM]: new AnnotationContainer(bottomStackElement, { order: 'ascending' })
        };

        this.boundScheduleUpdate = this.scheduleUpdate.bind(this);
        this.resizeObserver = new ResizeObserver(this.boundScheduleUpdate);
        this.resizeObserver.observe(this.displayElement);

        this.mutationObserver = new MutationObserver(this.boundScheduleUpdate);
        this.mutationObserver.observe(this.displayElement, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Create a new annotation line instance.
     * @param {Object} options - Annotation line options.
     * @returns {AnnotationLine}
     */
    createLine(options = {}) {
        const line = new AnnotationLine(this, options);
        const container = this.containers[line.position];

        if (!container || !container.element) {
            throw new Error(`Container for position "${line.position}" is not available.`);
        }

        container.insert(line);
        this.lines.set(line.id, line);
        this.scheduleUpdate();
        return line;
    }

    /**
     * Remove an annotation line by id.
     * @param {string} id - Annotation line id.
     */
    removeLine(id) {
        const line = this.lines.get(id);
        if (!line) {
            return;
        }
        const container = this.containers[line.position];
        container.remove(line);
        this.lines.delete(id);
        line.dispose();
    }

    /**
     * Request a layout update for all lines on the next animation frame.
     */
    scheduleUpdate() {
        if (this.pendingUpdate) {
            return;
        }

        this.pendingUpdate = true;
        requestAnimationFrame(() => {
            this.pendingUpdate = false;
            this.updateAll();
        });
    }

    /**
     * Update layout for all annotation lines.
     */
    updateAll() {
        for (const line of this.lines.values()) {
            line.updateLayout();
        }
    }

    /**
     * Reinsert a line to maintain level ordering.
     * @param {AnnotationLine} line - Annotation line instance.
     */
    repositionLine(line) {
        const container = this.containers[line.position];
        if (!container || !container.element) {
            return;
        }
        container.remove(line);
        container.insert(line);
        this.scheduleUpdate();
    }

    /**
     * Retrieve a slot element by index.
     * @param {number} index - Slot index.
     * @returns {HTMLElement|null}
     */
    getSlot(index) {
        if (index == null) {
            return null;
        }
        return this.displayElement.querySelector(
            `${this.charSlotSelector}[data-index="${index}"]`
        );
    }

    /**
     * Dispose the manager and all registered lines.
     */
    destroy() {
        this.resizeObserver.disconnect();
        this.mutationObserver.disconnect();
        for (const line of this.lines.values()) {
            const container = this.containers[line.position];
            if (container) {
                container.remove(line);
            }
            line.dispose();
        }
        this.lines.clear();
        this.pendingUpdate = false;
    }
}

/**
 * Represents a single annotation line.
 */
export class AnnotationLine {
    /**
     * @param {AnnotationManager} manager - Annotation manager instance.
     * @param {Object} options - Line configuration.
     * @param {string} [options.id] - Optional id.
     * @param {string} [options.label=''] - Annotation label text.
     * @param {'top'|'bottom'} [options.position='top'] - Position relative to the display.
     * @param {number} [options.level=1] - Stacking level.
     * @param {string} [options.badgeText=''] - Badge content.
     * @param {{start: number, end?: number}} [options.range] - Character range.
     */
    constructor(manager, {
        id,
        label = '',
        position = POSITION_TOP,
        level = 1,
        badgeText = '',
        range
    } = {}) {
        this.manager = manager;
        this.id = id ?? generateLineId();
        this.position = position === POSITION_BOTTOM ? POSITION_BOTTOM : POSITION_TOP;
        this.level = Math.max(1, Math.floor(level));
        this.startIndex = null;
        this.endIndex = null;

        const { element, labelElement, textElement, badgeElement, railElement } = this.createElement();
        this.element = element;
        this.labelElement = labelElement;
        this.textElement = textElement;
        this.badgeElement = badgeElement;
        this.railElement = railElement;

        this.element.dataset.position = this.position;
        this.element.dataset.level = String(this.level);
        this.applyGridPlacement();

        this.setLabel(label);
        this.setBadgeText(badgeText);

        if (range && typeof range.start === 'number') {
            this.setRange(range);
        } else {
            this.updateLayout();
        }
    }

    createElement() {
        const element = document.createElement('div');
        element.className = 'annotation-line';

        const labelElement = document.createElement('div');
        labelElement.className = 'annotation-line__label';

        const textElement = document.createElement('span');
        textElement.className = 'annotation-line__text';

        const badgeElement = document.createElement('span');
        badgeElement.className = 'annotation-line__badge annotation-line__badge--empty';

        labelElement.appendChild(textElement);
        labelElement.appendChild(badgeElement);

        const railElement = document.createElement('div');
        railElement.className = 'annotation-line__rail';

        element.appendChild(labelElement);
        element.appendChild(railElement);

        return { element, labelElement, textElement, badgeElement, railElement };
    }

    /**
     * Update the annotation label text.
     * @param {string} labelText - Label content.
     */
    setLabel(labelText) {
        this.textElement.textContent = labelText ?? '';
    }

    /**
     * Update the badge text.
     * @param {string} badgeText - Badge content.
     */
    setBadgeText(badgeText = '') {
        const content = badgeText ?? '';
        this.badgeElement.textContent = content;
        const isEmpty = !content || content.length === 0;
        this.badgeElement.classList.toggle('annotation-line__badge--empty', isEmpty);
    }

    /**
     * Update badge using structured data.
     * @param {{ strokeCount?: number|null, element?: { en: string, zh: string } | null } | null} data
     */
    setBadgeData(data) {
        this.clearBadge();

        if (!data || typeof data !== 'object') {
            return;
        }

        let hasContent = false;

        if (typeof data.strokeCount === 'number' && Number.isFinite(data.strokeCount) && data.strokeCount > 0) {
            const strokeBadge = document.createElement('span');
            strokeBadge.className = 'stroke-count';
            strokeBadge.textContent = `${data.strokeCount}劃`;
            this.badgeElement.appendChild(strokeBadge);
            hasContent = true;
        }

        if (data.element && typeof data.element === 'object' && data.element.zh && data.element.en) {
            const elementBadge = document.createElement('span');
            elementBadge.className = 'element-label';
            elementBadge.textContent = data.element.zh;
            elementBadge.setAttribute('data-element', data.element.en);
            this.badgeElement.appendChild(elementBadge);
            hasContent = true;
        }

        if (hasContent) {
            this.badgeElement.classList.remove('annotation-line__badge--empty');
        }
    }

    /**
     * Remove badge content.
     */
    clearBadge() {
        this.badgeElement.textContent = '';
        this.badgeElement.classList.add('annotation-line__badge--empty');
    }

    /**
     * Update the stacking level.
     * @param {number} level - New level value.
     */
    setLevel(level) {
        const nextLevel = Math.max(1, Math.floor(level));
        if (this.level === nextLevel) {
            return;
        }
        this.level = nextLevel;
        this.element.dataset.level = String(this.level);
        this.applyGridPlacement();
        this.manager.repositionLine(this);
    }

    applyGridPlacement() {
        this.element.style.setProperty('--annotation-line-level', String(this.level));
    }

    /**
     * Update the annotated character range.
     * @param {{start: number, end?: number}} range - Range configuration.
     */
    setRange(range) {
        if (!range || typeof range.start !== 'number') {
            throw new Error('Range must include a numeric "start" index.');
        }

        const endValue = typeof range.end === 'number' ? range.end : range.start;
        this.startIndex = Math.min(range.start, endValue);
        this.endIndex = Math.max(range.start, endValue);
        this.manager.scheduleUpdate();
    }

    /**
     * Alias for setRange to better describe intent.
     * @param {{start: number, end?: number}} range - Range configuration.
     */
    updateRange(range) {
        this.setRange(range);
    }

    /**
     * Update layout based on the current range.
     */
    updateLayout() {
        if (this.startIndex == null || this.endIndex == null) {
            this.setHidden(true);
            return;
        }

        const startSlot = this.manager.getSlot(this.startIndex);
        const endSlot = this.manager.getSlot(this.endIndex);

        if (!startSlot || !endSlot) {
            this.setHidden(true);
            return;
        }

        const displayRect = this.manager.displayElement.getBoundingClientRect();
        const startRect = startSlot.getBoundingClientRect();
        const endRect = endSlot.getBoundingClientRect();

        const left = Math.max(0, startRect.left - displayRect.left);
        const right = Math.max(0, endRect.right - displayRect.left);
        const width = Math.max(0, right - left);

        if (width === 0) {
            this.setHidden(true);
            return;
        }

        this.setHidden(false);
        const leftPx = `${left}px`;
        const widthPx = `${width}px`;

        this.element.style.setProperty('--annotation-line-left', leftPx);
        this.element.style.setProperty('--annotation-line-width', widthPx);
        this.railElement.style.marginLeft = leftPx;
        this.railElement.style.width = widthPx;
    }

    /**
     * Toggle visibility without removing the element.
     * @param {boolean} hidden - Whether the line should be hidden.
     */
    setHidden(hidden) {
        this.element.classList.toggle('annotation-line--hidden', hidden);
    }

    /**
     * Dispose internal resources.
     * @param {boolean} [skipRemoval=false] - Skip DOM removal when handled by the manager.
     */
    dispose(skipRemoval = false) {
        if (!skipRemoval && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}

