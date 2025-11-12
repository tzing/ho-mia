const DATA_ENDPOINT = '/data/three-talents.json';

let fortuneMap = null;
let loadPromise = null;

function computeAuspicious(luck) {
    if (typeof luck !== 'string') {
        return false;
    }
    const trimmed = luck.trim();
    return trimmed.length > 0 && trimmed.startsWith('吉');
}

async function loadFortuneMap() {
    if (fortuneMap) {
        return fortuneMap;
    }

    if (loadPromise) {
        return loadPromise;
    }

    loadPromise = fetch(DATA_ENDPOINT)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch three talents data: ${response.status}`);
            }

            const data = await response.json();
            const map = new Map();

            if (data && typeof data === 'object') {
                for (const [rawKey, rawValue] of Object.entries(data)) {
                    if (typeof rawKey !== 'string') {
                        continue;
                    }

                    const key = rawKey.trim();
                    if (key.length === 0) {
                        continue;
                    }

                    if (!rawValue || typeof rawValue !== 'object') {
                        continue;
                    }

                    const luck = typeof rawValue.luck === 'string' ? rawValue.luck : null;
                    const description =
                        typeof rawValue.description === 'string' ? rawValue.description : null;
                    const auspicious =
                        typeof rawValue.auspicious === 'boolean'
                            ? rawValue.auspicious
                            : computeAuspicious(luck);

                    map.set(key, {
                        luck,
                        description,
                        auspicious
                    });
                }
            }

            fortuneMap = map;
            return map;
        })
        .catch((error) => {
            console.error('Failed to load three talents fortune data.', error);
            fortuneMap = new Map();
            return fortuneMap;
        })
        .finally(() => {
            loadPromise = null;
        });

    return loadPromise;
}

function normalizeKey(sequence) {
    if (Array.isArray(sequence)) {
        const joined = sequence
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .join('');
        return joined.replace(/\s+/g, '');
    }

    if (typeof sequence === 'string') {
        return sequence.replace(/\s+/g, '').trim();
    }

    return '';
}

/**
 * Retrieve fortune information for a three talents element sequence.
 * @param {string|string[]} sequence
 * @returns {Promise<{ luck: string|null, description: string|null, auspicious: boolean }|null>}
 */
export async function getThreeTalentsFortune(sequence) {
    const key = normalizeKey(sequence);
    if (key.length === 0) {
        return null;
    }

    const map = await loadFortuneMap();
    return map.get(key) ?? null;
}


