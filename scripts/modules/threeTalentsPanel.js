import { getThreeTalentsFortune } from '../utils/threeTalents.js';

const THREE_TALENTS_GRID_CONFIG = [
    { key: 'heaven', label: '天格' },
    { key: 'personality', label: '人格' },
    { key: 'earth', label: '地格' }
];

function isValidElement(element) {
    if (!element || typeof element !== 'object') {
        return false;
    }
    const { en, zh } = element;
    return typeof en === 'string' && en.trim().length > 0
        && typeof zh === 'string' && zh.trim().length > 0;
}

function renderBadges(root, placeholder, getResult) {
    const state = {
        isComplete: false,
        combination: null
    };

    if (!root) {
        return state;
    }

    const wrapper = root.closest('.three-talents');
    const badges = [];
    const sequence = [];
    let allValid = true;

    for (const config of THREE_TALENTS_GRID_CONFIG) {
        const result = typeof getResult === 'function' ? getResult(config.key) : null;
        if (!result || !isValidElement(result.element)) {
            allValid = false;
            break;
        }

        const zhElement = result.element.zh.trim();
        if (zhElement.length === 0) {
            allValid = false;
            break;
        }

        sequence.push(zhElement);

        const badge = document.createElement('span');
        badge.className = 'three-talents__badge element-badge';
        badge.dataset.gridKey = config.key;
        badge.dataset.element = result.element.en;
        badge.setAttribute('role', 'listitem');
        badge.setAttribute('aria-label', `${config.label}：${result.element.zh}`);
        badge.textContent = result.element.zh;
        badges.push(badge);
    }

    if (allValid && badges.length === THREE_TALENTS_GRID_CONFIG.length) {
        root.replaceChildren(...badges);
        if (placeholder) {
            placeholder.hidden = true;
        }
        if (wrapper) {
            wrapper.classList.remove('three-talents--empty');
        }
        state.isComplete = true;
        state.combination = sequence.join('');
    } else {
        root.replaceChildren();
        if (placeholder) {
            placeholder.hidden = false;
        }
        if (wrapper) {
            wrapper.classList.add('three-talents--empty');
        }
    }

    return state;
}

function createFortuneSection(container) {
    if (!container) {
        return null;
    }

    let fortuneContainer = container.querySelector('.three-talents__fortune');
    if (!fortuneContainer) {
        fortuneContainer = document.createElement('div');
        fortuneContainer.className = 'three-talents__fortune';
        container.appendChild(fortuneContainer);
    } else {
        fortuneContainer.classList.add('three-talents__fortune');
        fortuneContainer.classList.remove('three-talents__fortune--visible');
    }

    let luckBadge = fortuneContainer.querySelector('.three-talents__fortune-luck');
    if (!luckBadge) {
        luckBadge = document.createElement('span');
        luckBadge.className = 'three-talents__fortune-luck analysis-badges__fortune-luck';
        luckBadge.hidden = true;
        fortuneContainer.appendChild(luckBadge);
    } else {
        luckBadge.classList.add('three-talents__fortune-luck', 'analysis-badges__fortune-luck');
        luckBadge.classList.remove('analysis-badges__fortune-luck--inauspicious');
        luckBadge.hidden = true;
        luckBadge.textContent = '';
    }

    let description = fortuneContainer.querySelector('.three-talents__fortune-description');
    if (!description) {
        description = document.createElement('p');
        description.className = 'three-talents__fortune-description';
        description.hidden = true;
        fortuneContainer.appendChild(description);
    } else {
        description.classList.add('three-talents__fortune-description');
        description.hidden = true;
        description.textContent = '';
    }

    return {
        container: fortuneContainer,
        luckBadge,
        description
    };
}

function updateFortuneSection(fortune, data) {
    if (!fortune?.container) {
        return;
    }

    const { container, luckBadge, description } = fortune;

    container.classList.remove('three-talents__fortune--visible');

    if (luckBadge) {
        luckBadge.classList.remove('analysis-badges__fortune-luck--inauspicious');
        luckBadge.hidden = true;
        luckBadge.textContent = '';
    }

    if (description) {
        description.textContent = '';
        description.hidden = true;
    }

    const hasLuck = typeof data?.luck === 'string' && data.luck.trim().length > 0;
    const hasDescription = typeof data?.description === 'string' && data.description.trim().length > 0;

    if (!hasLuck && !hasDescription) {
        return;
    }

    if (luckBadge && hasLuck) {
        luckBadge.textContent = data.luck.trim();
        luckBadge.hidden = false;
        if (data?.auspicious === false) {
            luckBadge.classList.add('analysis-badges__fortune-luck--inauspicious');
        }
    }

    if (description && hasDescription) {
        description.textContent = data.description.trim();
        description.hidden = false;
    }

    container.classList.add('three-talents__fortune--visible');
}

export function setupThreeTalentsPanel({ inputHandler, container } = {}) {
    if (!container) {
        return () => {};
    }

    let badgesRoot = container.querySelector('.three-talents__badges');
    if (!badgesRoot) {
        badgesRoot = document.createElement('div');
        badgesRoot.className = 'three-talents__badges';
        badgesRoot.setAttribute('role', 'list');
        badgesRoot.setAttribute('aria-label', '三才五行');
        container.appendChild(badgesRoot);
    }

    let placeholder = container.querySelector('.three-talents__placeholder');
    if (!placeholder) {
        placeholder = document.createElement('p');
        placeholder.className = 'three-talents__placeholder';
        placeholder.textContent = '等待輸入資料';
        container.appendChild(placeholder);
    }

    const fortuneSection = createFortuneSection(container);

    const getResult =
        typeof window !== 'undefined' && typeof window.getFiveGridResult === 'function'
            ? (gridKey) => window.getFiveGridResult(gridKey)
            : () => null;

    const refresh = async () => {
        try {
            const state = renderBadges(badgesRoot, placeholder, getResult);
            if (!fortuneSection) {
                return;
            }

            if (!state.isComplete || !state.combination) {
                updateFortuneSection(fortuneSection, null);
                return;
            }

            const fortuneData = await getThreeTalentsFortune(state.combination);
            updateFortuneSection(fortuneSection, fortuneData ?? null);
        } catch (error) {
            console.error('Failed to render three talents badges.', error);
            if (fortuneSection) {
                updateFortuneSection(fortuneSection, null);
            }
        }
    };

    refresh().catch((error) => {
        console.error('Failed to refresh three talents panel.', error);
    });

    const unsubscribe =
        inputHandler?.onEntriesChange(() => {
            refresh().catch((error) => {
                console.error('Failed to update three talents panel on entries change.', error);
            });
        }) ?? (() => {});

    return () => {
        unsubscribe();
    };
}


