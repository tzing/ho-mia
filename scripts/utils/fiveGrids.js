/**
 * Stateless utilities for five grid calculations.
 * All methods operate on name entry arrays returned by getNameEntries().
 */
import { FiveElement } from './strokes.js';

const COMPOUND_SURNAMES = new Set([
    '\u4E07\u4FDF', // 万俟
    '\u842C\u4FDF', // 萬俟
    '\u53F8\u99AC', // 司馬
    '\u4E0A\u5B98', // 上官
    '\u6B50\u967D', // 歐陽
    '\u590F\u4FAF', // 夏侯
    '\u8AF8\u845B', // 諸葛
    '\u805E\u4EBA', // 聞人
    '\u6771\u65B9', // 東方
    '\u8D6B\u9023', // 赫連
    '\u7687\u752B', // 皇甫
    '\u5C09\u9072', // 尉遲
    '\u516C\u7F8A', // 公羊
    '\u6FB9\u81FA', // 澹臺
    '\u516C\u51B6', // 公冶
    '\u5B97\u653F', // 宗政
    '\u6FE4\u967D', // 濮陽
    '\u6DE3\u4E8E', // 淳于
    '\u55AE\u4E8E', // 單于
    '\u592A\u53D4', // 太叔
    '\u7533\u5C60', // 申屠
    '\u516C\u5B6B', // 公孫
    '\u4EF2\u5B6B', // 仲孫
    '\u8ED2\u8F45', // 軒轅
    '\u4EE4\u72D0', // 令狐
    '\u937E\u96E2', // 鍾離
    '\u5B87\u6587', // 宇文
    '\u9577\u5B6B', // 長孫
    '\u6155\u5BB9', // 慕容
    '\u9BAE\u4E8E', // 鮮于
    '\u95EF\u4E18', // 閭丘
    '\u53F8\u5F92', // 司徒
    '\u53F8\u7A7A', // 司空
    '\u4E93\u5B98', // 亓官
    '\u53F8\u5BC7', // 司寇
    '\u5B50\u8ECA', // 子車
    '\u9853\u5B6B', // 顓孫
    '\u7AEF\u6728', // 端木
    '\u5DEB\u99AC', // 巫馬
    '\u516C\u897F', // 公西
    '\u6F06\u96D2', // 漆雕
    '\u6A02\u6B63', // 樂正
    '\u58E4\u99DF', // 壤駟
    '\u516C\u826F', // 公良
    '\u62D3\u8DB4', // 拓跋
    '\u5939\u8C37', // 夾谷
    '\u5BB0\u7236', // 宰父
    '\u7A40\u6881', // 穀梁
    '\u6BB5\u5E72', // 段干
    '\u767E\u91CC', // 百里
    '\u6771\u90ED', // 東郭
    '\u5357\u9580', // 南門
    '\u547C\u5EF6', // 呼延
    '\u7F8A\u820C', // 羊舌
    '\u5FAE\u751F', // 微生
    '\u6881\u4E18', // 梁丘
    '\u5DE6\u4E18', // 左丘
    '\u6771\u9580', // 東門
    '\u897F\u9580', // 西門
    '\u5357\u5BAB', // 南宮
    '\u7B2C\u4E94'  // 第五
]);

function extractCharacterValue(entry) {
    if (!entry || typeof entry !== 'object') {
        return '';
    }
    const { value, character } = entry;
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }
    if (typeof character === 'string' && character.length > 0) {
        return character;
    }
    return '';
}

/**
 * Attempt to detect compound surname presence from leading character entries.
 * @param {Array<Record<string, unknown>>} entries
 * @returns {number} 2 when compound surname matched, otherwise 0
 */
function detectCompoundSurnameLength(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return 0;
    }

    const leadingCharacters = [];
    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        if (!entry || typeof entry !== 'object') {
            continue;
        }
        if (entry.type !== 'character') {
            continue;
        }

        const value = extractCharacterValue(entry);
        if (!value) {
            continue;
        }

        leadingCharacters.push(value);
        if (leadingCharacters.length === 2) {
            break;
        }
    }

    if (leadingCharacters.length < 2) {
        return 0;
    }

    const combined = `${leadingCharacters[0]}${leadingCharacters[1]}`;
    return COMPOUND_SURNAMES.has(combined) ? 2 : 0;
}

/**
 * Determine whether an entry should be counted for five grid calculations.
 * @param {Record<string, unknown>} entry
 * @returns {boolean}
 */
export function isCountableEntry(entry) {
    if (!entry || typeof entry !== 'object') {
        return false;
    }
    const { type } = entry;
    return type === 'character' || type === 'placeholder';
}

/**
 * Filter entries to include only those counted for five grid calculations.
 * @param {Array<Record<string, unknown>>} entries
 * @returns {Array<Record<string, unknown>>}
 */
export function filterCountableEntries(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return [];
    }
    return entries.filter(isCountableEntry);
}

/**
 * Determine surname length using effective count and known compound surnames.
 * @param {number} effectiveLength
 * @param {Array<Record<string, unknown>>} [countableEntries]
 * @returns {number}
 */
export function determineSurnameLengthFromEffectiveCount(effectiveLength, countableEntries = []) {
    const entries = Array.isArray(countableEntries) ? countableEntries : [];
    const normalizedEffective = typeof effectiveLength === 'number' && effectiveLength > 0
        ? effectiveLength
        : entries.length;

    const compoundLength = detectCompoundSurnameLength(entries);
    if (compoundLength === 2) {
        return 2;
    }

    if (normalizedEffective <= 0 || entries.length === 0) {
        return 0;
    }

    if (entries.length === 1 || normalizedEffective <= 1) {
        return 1;
    }

    const firstChar = extractCharacterValue(entries[0]);
    const secondChar = extractCharacterValue(entries[1]);

    if (firstChar && secondChar && COMPOUND_SURNAMES.has(`${firstChar}${secondChar}`)) {
        return 2;
    }

    return 1;
}

/**
 * Resolve countable entries and surname slice using effective length context.
 * @param {Array<Record<string, unknown>>} entries
 * @param {{ effectiveLength?: number, surnameLengthOverride?: number, countableEntriesOverride?: Array<Record<string, unknown>>, countableIndicesOverride?: number[] }} [options]
 * @returns {{
 *   countableEntries: Array<Record<string, unknown>>,
 *   countableIndices: number[],
 *   surnameEntries: Array<Record<string, unknown>>,
 *   surnameIndices: number[],
 *   givenNameEntries: Array<Record<string, unknown>>,
 *   givenNameIndices: number[],
 *   surnameLength: number,
 *   effectiveLength: number
 * }}
 */
export function resolveSurnameEntries(entries, {
    effectiveLength,
    surnameLengthOverride,
    countableEntriesOverride,
    countableIndicesOverride
} = {}) {
    const countableEntries = Array.isArray(countableEntriesOverride)
        ? countableEntriesOverride
        : filterCountableEntries(entries);

    const countableIndices = Array.isArray(countableIndicesOverride)
        ? countableIndicesOverride
        : entries.reduce((indices, entry, index) => {
            if (isCountableEntry(entry)) {
                indices.push(index);
            }
            return indices;
        }, []);

    let surnameLength = 0;
    if (typeof surnameLengthOverride === 'number' && surnameLengthOverride >= 0) {
        surnameLength = Math.min(surnameLengthOverride, countableEntries.length);
    } else {
        const inferredEffective = typeof effectiveLength === 'number'
            ? effectiveLength
            : countableEntries.length;
        surnameLength = determineSurnameLengthFromEffectiveCount(inferredEffective, countableEntries);
        surnameLength = Math.min(surnameLength, countableEntries.length);
    }

    const surnameEntries = surnameLength > 0 ? countableEntries.slice(0, surnameLength) : [];
    const surnameIndices = surnameLength > 0 ? countableIndices.slice(0, surnameLength) : [];

    const givenNameEntries = surnameLength > 0
        ? countableEntries.slice(surnameLength)
        : countableEntries.slice(0);
    const givenNameIndices = surnameLength > 0
        ? countableIndices.slice(surnameLength)
        : countableIndices.slice(0);

    return {
        countableEntries,
        countableIndices,
        surnameEntries,
        surnameIndices,
        givenNameEntries,
        givenNameIndices,
        surnameLength,
        effectiveLength: typeof effectiveLength === 'number'
            ? effectiveLength
            : countableEntries.length
    };
}

export const FiveGridPolarity = Object.freeze({
    YIN: 'yin',
    YANG: 'yang'
});

export class FiveGrid {
    /**
     * Extract numeric stroke count from an entry.
     * Accepts both number and numeric string values.
     * @param {Record<string, unknown>} entry
     * @returns {number|null}
     */
    static getStrokeCountFromEntry(entry) {
        if (!entry || typeof entry !== 'object') {
            return null;
        }

        const rawValue = entry.strokes ?? entry.strokeCount ?? null;
        if (rawValue == null) {
            return null;
        }

        const numericValue = Number(rawValue);
        if (Number.isNaN(numericValue) || numericValue <= 0) {
            return null;
        }
        return numericValue;
    }

    /**
     * Sum stroke counts for a set of entries.
     * Returns null if any entry lacks stroke information.
     * @param {Array<Record<string, unknown>>} entries
     * @returns {number|null}
     */
    static sumStrokeCounts(entries) {
        if (!Array.isArray(entries) || entries.length === 0) {
            return null;
        }

        let total = 0;
        for (const entry of entries) {
            const strokes = FiveGrid.getStrokeCountFromEntry(entry);
            if (strokes == null) {
                return null;
            }
            total += strokes;
        }
        return total;
    }

    /**
     * Derive polarity (yin/yang) and five element from stroke count.
     * Uses ones digit classification: 1/3/5/7/9 -> yang, 2/4/6/8/0 -> yin.
     * Element grouping: 1,2 => wood; 3,4 => fire; 5,6 => earth; 7,8 => metal; 9,0 => water.
     * @param {number} strokeCount
     * @returns {{ polarity: 'yin'|'yang', element: { en: string, zh: string } } | null}
     */
    static derivePolarityAndElement(strokeCount) {
        if (typeof strokeCount !== 'number' || !Number.isFinite(strokeCount) || strokeCount <= 0) {
            return null;
        }

        const digit = strokeCount % 10;

        const polarity = digit % 2 === 0 ? FiveGridPolarity.YIN : FiveGridPolarity.YANG;

        const elementGroups = [
            { digits: [1, 2], element: FiveElement.WOOD },
            { digits: [3, 4], element: FiveElement.FIRE },
            { digits: [5, 6], element: FiveElement.EARTH },
            { digits: [7, 8], element: FiveElement.METAL },
            { digits: [9, 0], element: FiveElement.WATER }
        ];

        const matchedGroup = elementGroups.find(({ digits }) => digits.includes(digit));

        if (!matchedGroup) {
            return null;
        }

        return {
            polarity,
            element: matchedGroup.element
        };
    }

}


