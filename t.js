const data = {
    'user_id': 101,
    'username': 'alpha_user',
    'status': 'Active',
    'tags': ['premium', 'new_member', 'verified'],
    'location': 'New York City',
    'last_login': '2025-11-10',
    'settings': { theme: 'dark', notifications: true },
    'scores': [95, 88, 92]
};

/**
 * Helper function to determine if a term matches the criteria based on options (Exact, Like, Regex).
 * @param {any} term The key or value to test.
 * @param {string|RegExp|Array} criteria The search term(s).
 * @param {object} options Search options ({ like: boolean, regex: boolean }).
 * @returns {boolean} True if the term matches the criteria.
 */
function isMatch(term, criteria, options) {
    if (options.regex && criteria instanceof RegExp) {
        // If criteria is already a RegExp object
        return criteria.test(String(term));
    } else if (options.regex) {
        // If criteria is a string to be converted to RegExp
        try {
            // Using 'i' for case-insensitive regex search
            const regex = new RegExp(criteria, 'i');
            return regex.test(String(term));
        } catch (e) {
            console.error("Invalid regex criteria:", e);
            return false;
        }
    } else if (options.like) {
        // Partial matching (like), converted to string and lowercase for case-insensitive partial search
        const termStr = String(term).toLowerCase();
        const criteriaStr = String(criteria).toLowerCase();
        return termStr.includes(criteriaStr);
    } else {
        // Exact match
        return term === criteria;
    }
}

/**
 * Searches for key/value pairs in the 'data' object based on the criteria.
 * Supports exact match, partial match ('like'), and regular expressions.
 * It iterates over arrays found as values to search within them.
 * * @param {string|RegExp|Array} criteria The search term(s). 
 * @param {object} [options={ like: false, regex: false }] Search options.
 * @returns {Array<{key: string, value: any}>} An array of objects that match the criteria.
 */
function searchKeyValue(criteria, options = { like: false, regex: false }) {
    const results = [];
    const entries = Object.entries(data);

    // --- 1. Handle Array Criteria (Exact Match Only) ---
    if (Array.isArray(criteria)) {
        for (const [key, value] of entries) {
            // Check key match
            if (criteria.includes(key)) {
                results.push({ key, value });
                continue;
            }

            // Check single value match
            if (!Array.isArray(value) && criteria.includes(value)) {
                results.push({ key, value });
                continue;
            }

            // Check array value elements match
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (criteria.includes(item)) {
                        results.push({ key, value });
                        break;
                    }
                }
            }
        }
        return results;
    }

    // --- 2. Handle Single Criteria (Exact, Like, or Regex) ---
    for (const [key, value] of entries) {
        let isValueMatch = false;

        // Check if the VALUE matches (or any element if it's an array)
        if (Array.isArray(value)) {
            for (const item of value) {
                if (isMatch(item, criteria, options)) {
                    isValueMatch = true;
                    break;
                }
            }
        } else {
            if (isMatch(value, criteria, options)) {
                isValueMatch = true;
            }
        }

        // Check if the KEY matches
        const isKeyMatch = isMatch(key, criteria, options);

        if (isKeyMatch || isValueMatch) {
            results.push({ key, value });
        }
    }

    return results;
}

/**
 * Searches ONLY the keys of the object and returns the full key/value pairs that match.
 * * @param {string|RegExp} criteria The search term.
 * @param {object} [options={ like: false, regex: false }] Search options.
 * @returns {Array<{key: string, value: any}>} An array of objects where the key matches the criteria.
 */
function searchKeys(criteria, options = { like: false, regex: false }) {
    const results = [];

    // Array criteria is not supported for searchKeys, only single string/RegExp
    if (Array.isArray(criteria)) {
        console.error("searchKeys only supports string or RegExp criteria.");
        return results;
    }

    for (const [key, value] of Object.entries(data)) {
        if (isMatch(key, criteria, options)) {
            results.push({ key, value });
        }
    }
    return results;
}

/**
 * Searches ONLY the values of the object and returns an array containing 
 * the values that matched the criteria. Array values are searched internally.
 * * @param {string|RegExp|Array} criteria The search term(s). 
 * @param {object} [options={ like: false, regex: false }] Search options.
 * @returns {Array<any>} An array of the VALUES that contained the match.
 */
function searchValues(criteria, options = { like: false, regex: false }) {
    const results = [];
    const entries = Object.entries(data);

    // --- 1. Handle Array Criteria (Exact Match Only) ---
    if (Array.isArray(criteria)) {
        for (const [key, value] of entries) {
            let found = false;

            // Check single value match
            if (!Array.isArray(value) && criteria.includes(value)) {
                found = true;
            } else if (Array.isArray(value)) {
                // Check array value elements match
                for (const item of value) {
                    if (criteria.includes(item)) {
                        found = true;
                        break;
                    }
                }
            }

            if (found) {
                results.push(value);
            }
        }
        return results;
    }

    // --- 2. Handle Single Criteria (Exact, Like, or Regex) ---
    for (const [key, value] of entries) {
        let isValueMatch = false;

        // Check if the VALUE matches (or any element if it's an array)
        if (Array.isArray(value)) {
            for (const item of value) {
                if (isMatch(item, criteria, options)) {
                    isValueMatch = true;
                    break;
                }
            }
        } else {
            if (isMatch(value, criteria, options)) {
                isValueMatch = true;
            }
        }

        if (isValueMatch) {
            results.push(value);
        }
    }

    return results;
}

