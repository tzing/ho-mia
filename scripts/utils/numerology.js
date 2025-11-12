/**
 * Numerology utilities
 * Provides lookup helpers for 81-number fortune data.
 */

const DATA_ENDPOINT = '/data/81-numerological-values.json';

let numerologyMap = null;
let numerologyLoadPromise = null;

/**
 * Load numerology dataset and create a lookup map.
 * @returns {Promise<Map<number, { luck: string|null, description: string|null, auspicious: boolean }>>}
 */
async function loadNumerologyMap() {
    if (numerologyMap) {
        return numerologyMap;
    }

    if (numerologyLoadPromise) {
        return numerologyLoadPromise;
    }

    numerologyLoadPromise = fetch(DATA_ENDPOINT)
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch numerology data: ${response.status}`);
            }
            const data = await response.json();
            const map = new Map();

            const setEntry = (drawKey, source) => {
                const drawNumber = Number(drawKey);

                map.set(drawNumber, {
                    luck: source.luck,
                    description: source.description,
                    auspicious: source.auspicious
                });
            };

            if (Array.isArray(data)) {
                for (const entry of data) {
                    setEntry(entry.draw, entry);
                }
            } else {
                for (const [drawKey, entry] of Object.entries(data)) {
                    setEntry(drawKey, entry);
                }
            }

            numerologyMap = map;
            return map;
        })
        .catch((error) => {
            console.error('Failed to load numerological values.', error);
            numerologyMap = new Map();
            return numerologyMap;
        })
        .finally(() => {
            numerologyLoadPromise = null;
        });

    return numerologyLoadPromise;
}

/**
 * Retrieve numerology information for a stroke total.
 * @param {number} draw - Stroke total between 1 and 81.
 * @returns {Promise<{ luck: string|null, description: string|null, auspicious: boolean }|null>}
 */
export async function getNumerologyValue(draw) {
    if (typeof draw !== 'number' || Number.isNaN(draw) || !Number.isFinite(draw)) {
        return null;
    }

    const integerDraw = Math.floor(draw);
    if (integerDraw <= 0) {
        return null;
    }

    const normalized = ((integerDraw - 1) % 81) + 1;

    const map = await loadNumerologyMap();
    return map.get(normalized) ?? null;
}



