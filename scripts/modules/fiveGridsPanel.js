import { getNumerologyValue } from '../utils/numerology.js';

const BASE_FIVE_GRIDS_CONFIG = [
    { key: 'heaven', label: '天格' },
    { key: 'personality', label: '人格' },
    { key: 'earth', label: '地格' },
    { key: 'outer', label: '外格' },
    { key: 'total', label: '總格' }
];

export const FIVE_GRIDS_GRID_CONFIG = BASE_FIVE_GRIDS_CONFIG;

function isPlainObject(value) {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

/**
 * Create a badge row element for the analysis grid.
 * @param {{ key: string, label: string }} config
 * @returns {{
 *   item: HTMLElement,
 *   badge: HTMLElement,
 *   placeholder: HTMLElement,
 *   luckBadge: HTMLElement,
 *   fortune: { container: HTMLElement, description: HTMLElement }
 * }}
 */
function createBadgeRow(config) {
    const item = document.createElement('div');
    item.className = 'analysis-badges__item';
    item.dataset.gridKey = config.key;

    const label = document.createElement('span');
    label.className = 'analysis-badges__label';
    label.textContent = config.label ?? '';

    const badge = document.createElement('span');
    badge.className = 'analysis-badges__badge annotation-line__badge annotation-line__badge--empty';
    badge.setAttribute('data-grid-badge', config.key);

    const luckBadge = document.createElement('span');
    luckBadge.className = 'analysis-badges__fortune-luck';
    luckBadge.hidden = true;
    badge.appendChild(luckBadge);

    const placeholder = document.createElement('span');
    placeholder.className = 'analysis-badges__placeholder';
    placeholder.textContent = '等待輸入資料';

    const fortune = document.createElement('div');
    fortune.className = 'analysis-badges__fortune';
    const fortuneDescription = document.createElement('p');
    fortuneDescription.className = 'analysis-badges__fortune-description';
    fortuneDescription.hidden = true;
    fortune.appendChild(fortuneDescription);

    item.append(label, badge, placeholder, fortune);

    return {
        item,
        badge,
        placeholder,
        luckBadge,
        fortune: {
            container: fortune,
            description: fortuneDescription
        }
    };
}

/**
 * Populate a badge entry with five grid data.
 * @param {{
 *   badge: HTMLElement,
 *   placeholder: HTMLElement,
 *   luckBadge: HTMLElement,
 *   fortune: { container: HTMLElement, description: HTMLElement }
 * }} entry
 * @param {import('../utils/fiveGrids.js').FiveGridResult|null} result
 */
async function applyGridResultToBadge(entry, result) {
    if (!entry?.badge) {
        return;
    }

    const hasContent = updateBadgeDisplay(entry.badge, entry.placeholder, entry.luckBadge, result);
    if (!hasContent || typeof result?.strokeCount !== 'number' || !Number.isFinite(result.strokeCount)) {
        updateLuckBadge(entry.luckBadge, null);
        updateFortuneDescription(entry.fortune, null);
        return;
    }

    try {
        const fortuneData = await getNumerologyValue(result.strokeCount);
        updateLuckBadge(entry.luckBadge, fortuneData);
        updateFortuneDescription(entry.fortune, fortuneData);
    } catch (error) {
        console.error('Failed to fetch numerology value.', error);
        updateLuckBadge(entry.luckBadge, null);
        updateFortuneDescription(entry.fortune, null);
    }
}

/**
 * Setup analysis panel bindings.
 * @param {{ inputHandler: import('./inputHandler.js').InputHandler, container: HTMLElement|null }} options
 */
export function setupAnalysisPanel({ inputHandler, container, grids } = {}) {
    if (!container) {
        return () => {};
    }

    const gridConfig = Array.isArray(grids) && grids.length > 0 ? grids : BASE_FIVE_GRIDS_CONFIG;

    let root = container.querySelector('.analysis-badges');
    if (!root) {
        root = document.createElement('div');
        root.className = 'analysis-badges';
        container.appendChild(root);
    } else {
        root.classList.add('analysis-badges');
    }

    /**
     * @type {Map<string, {
     *   badge: HTMLElement,
     *   placeholder: HTMLElement,
     *   luckBadge: HTMLElement,
     *   fortune: { container: HTMLElement, description: HTMLElement }
     * }>}
     */
    const badgeMap = new Map();
    const orderedItems = [];

    for (const config of gridConfig) {
        let item = root.querySelector(`[data-grid-key="${config.key}"]`);
        let badge;
        let placeholder;
        let luckBadge;
        let fortuneContainer;
        let fortuneDescription;

        if (!item) {
            const created = createBadgeRow(config);
            item = created.item;
            badge = created.badge;
            placeholder = created.placeholder;
            luckBadge = created.luckBadge;
            fortuneContainer = created.fortune.container;
            fortuneDescription = created.fortune.description;
        } else {
            item.classList.add('analysis-badges__item');
            item.dataset.gridKey = config.key;

            let label = item.querySelector('.analysis-badges__label');
            if (!label) {
                label = document.createElement('span');
                label.className = 'analysis-badges__label';
                item.prepend(label);
            }
            label.textContent = config.label ?? '';

            badge = item.querySelector(`[data-grid-badge]`);
            if (!badge || badge.getAttribute('data-grid-badge') !== config.key) {
                badge = document.createElement('span');
                badge.setAttribute('data-grid-badge', config.key);
                badge.className = 'analysis-badges__badge annotation-line__badge annotation-line__badge--empty';
                item.appendChild(badge);
            } else {
                badge.classList.add('analysis-badges__badge', 'annotation-line__badge');
                if (!badge.classList.contains('annotation-line__badge--empty')) {
                    badge.classList.add('annotation-line__badge--empty');
                }
                badge.setAttribute('data-grid-badge', config.key);
            }

            placeholder = item.querySelector('.analysis-badges__placeholder');
            if (!placeholder) {
                placeholder = document.createElement('span');
                placeholder.className = 'analysis-badges__placeholder';
                placeholder.textContent = '等待輸入資料';
                item.appendChild(placeholder);
            } else {
                placeholder.classList.add('analysis-badges__placeholder');
            }

            luckBadge = badge.querySelector('.analysis-badges__fortune-luck');
            if (!luckBadge) {
                luckBadge = document.createElement('span');
                luckBadge.className = 'analysis-badges__fortune-luck';
                luckBadge.hidden = true;
                badge.appendChild(luckBadge);
            } else {
                luckBadge.classList.add('analysis-badges__fortune-luck');
                luckBadge.hidden = true;
            }

            fortuneContainer = item.querySelector('.analysis-badges__fortune');
            if (!fortuneContainer) {
                fortuneContainer = document.createElement('div');
                fortuneContainer.className = 'analysis-badges__fortune';
                item.appendChild(fortuneContainer);
            } else {
                fortuneContainer.classList.add('analysis-badges__fortune');
            }

            fortuneDescription = fortuneContainer.querySelector('.analysis-badges__fortune-description');
            if (!fortuneDescription) {
                fortuneDescription = document.createElement('p');
                fortuneDescription.className = 'analysis-badges__fortune-description';
                fortuneDescription.hidden = true;
                fortuneContainer.appendChild(fortuneDescription);
            } else {
                fortuneDescription.classList.add('analysis-badges__fortune-description');
                fortuneDescription.hidden = true;
            }
        }

        badgeMap.set(config.key, {
            badge,
            placeholder,
            luckBadge,
            fortune: {
                container: fortuneContainer,
                description: fortuneDescription
            }
        });
        orderedItems.push(item);
    }

    if (orderedItems.length > 0) {
        root.replaceChildren(...orderedItems);
    }

    const getResultFn = typeof window !== 'undefined' && typeof window.getFiveGridResult === 'function'
        ? window.getFiveGridResult
        : null;

    const refresh = async () => {
        const tasks = [];
        for (const config of gridConfig) {
            const target = badgeMap.get(config.key);
            if (!target) {
                continue;
            }
            const result = getResultFn ? getResultFn(config.key) : null;
            tasks.push(applyGridResultToBadge(target, result));
        }
        await Promise.all(tasks);
    };

    refresh().catch((error) => {
        console.error('Failed to refresh analysis panel.', error);
    });

    const unsubscribe =
        inputHandler?.onEntriesChange(async () => {
            try {
                await refresh();
            } catch (error) {
                console.error('Failed to update analysis panel on entries change.', error);
            }
        }) ?? (() => {});

    return () => {
        unsubscribe();
    };
}

function updateBadgeDisplay(badge, placeholder, luckBadge, result) {
    const preservedLuck = luckBadge ?? null;
    if (preservedLuck && preservedLuck.parentElement === badge) {
        badge.removeChild(preservedLuck);
    }

    badge.textContent = '';
    badge.classList.add('annotation-line__badge--empty');

    if (!isPlainObject(result)) {
        if (placeholder) {
            placeholder.hidden = false;
        }
        if (preservedLuck) {
            badge.appendChild(preservedLuck);
        }
        return false;
    }

    let hasContent = false;

    if (typeof result.strokeCount === 'number' && Number.isFinite(result.strokeCount) && result.strokeCount > 0) {
        const strokeBadge = document.createElement('span');
        strokeBadge.className = 'stroke-count';
        strokeBadge.textContent = `${result.strokeCount}劃`;
        badge.appendChild(strokeBadge);
        hasContent = true;
    }

    if (isPlainObject(result.element) && typeof result.element.zh === 'string' && typeof result.element.en === 'string') {
        const elementBadge = document.createElement('span');
        elementBadge.className = 'element-label';
        elementBadge.textContent = result.element.zh;
        elementBadge.dataset.element = result.element.en;
        badge.appendChild(elementBadge);
        hasContent = true;
    }

    if (preservedLuck) {
        badge.appendChild(preservedLuck);
    }

    if (hasContent) {
        badge.classList.remove('annotation-line__badge--empty');
        if (placeholder) {
            placeholder.hidden = true;
        }
        return true;
    }

    if (placeholder) {
        placeholder.hidden = false;
    }

    return false;
}

function updateLuckBadge(luckBadge, data) {
    if (!luckBadge) {
        return;
    }

    luckBadge.classList.remove('analysis-badges__fortune-luck--inauspicious');

    const hasLuck = !!(data?.luck && data.luck.trim().length > 0);
    if (!hasLuck) {
        luckBadge.textContent = '';
        luckBadge.hidden = true;
        return;
    }

    luckBadge.textContent = data.luck;
    luckBadge.hidden = false;

    if (data?.auspicious === false) {
        luckBadge.classList.add('analysis-badges__fortune-luck--inauspicious');
    }
}

function updateFortuneDescription(fortune, data) {
    if (!fortune?.container) {
        return;
    }

    const { container, description } = fortune;
    const hasDescription = !!(data?.description && data.description.trim().length > 0);

    if (!hasDescription) {
        if (description) {
            description.textContent = '';
            description.hidden = true;
        }
        container.classList.remove('analysis-badges__fortune--visible');
        return;
    }

    if (description) {
        description.textContent = data.description;
        description.hidden = false;
    }

    container.classList.add('analysis-badges__fortune--visible');
}


