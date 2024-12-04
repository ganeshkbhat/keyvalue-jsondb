

/**
 * Converts a single-level JSON object with dot notation keys into a nested JSON object.
 * 
 * @param {Object} obj - The single-level JSON object to convert.
 * @returns {Object} - A nested JSON object.
 */
function unflattenJson(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error("Input must be a non-null object.");
    }

    const result = {};

    for (const fullKey in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, fullKey)) {
            // Split keys while handling escaped dots
            const keys = fullKey.split(/(?<!\\)\./).map(key => key.replace(/\\\./g, '.'));

            let current = result;

            keys.forEach((key, index) => {
                if (index === keys.length - 1) {
                    // Final key - assign the value
                    current[key] = obj[fullKey];
                } else {
                    // Intermediate key - create object if it doesn't exist
                    if (!current[key] || typeof current[key] !== 'object') {
                        current[key] = {};
                    }
                    current = current[key];
                }
            });
        }
    }

    return result;
}


/**
 * Flattens a nested JSON object into a single level with dot notation keys,
 * escaping dots in keys with double backslashes.
 * 
 * @param {Object} obj - The nested JSON object to flatten.
 * @param {string} [prefix=""] - The prefix for nested keys (used for recursion).
 * @returns {Object} - A single level object with escaped dot notation keys.
 */
function flattenJsonWithEscaping(obj, prefix = "") {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error("Input must be a non-null object.");
    }

    const result = {};

    function escapeKey(key) {
        return key.replace(/\./g, '\\.');
    }

    function recurse(current, keyPrefix) {
        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const escapedKey = escapeKey(key);
                const newKey = keyPrefix ? `${keyPrefix}.${escapedKey}` : escapedKey;

                if (typeof current[key] === 'object' && current[key] !== null) {
                    // Recurse for nested objects
                    recurse(current[key], newKey);
                } else {
                    // Assign primitive values
                    result[newKey] = current[key];
                }
            }
        }
    }

    recurse(obj, prefix);
    return result;
}


class JsonManager {
    constructor() {
        this.data = {};
    }

    // Read method with createKey functionality
    read(key, createKey = false) {
        if (this.data.hasOwnProperty(key)) {
            return this.data[key];
        }
        if (createKey) {
            this.data[key] = null;
            return this.data[key];
        }
        return undefined;
    }

    // Write method to set a value for a key
    write(key, value) {
        this.data[key] = value;
    }

    // Dumps the entire JSON object
    dump() {
        return { ...unflattenJson(this.data) }; // Return a shallow copy to prevent direct modification
    }

    // Checks if a key exists
    hasKey(key) {
        return this.data.hasOwnProperty(key);
    }

    // Gets the value of a key
    getKey(key) {
        return this.data[key];
    }

    // instantiates the new value
    init(obj) {
        return this.data = flattenJsonWithEscaping(obj);
    }

    // updates the json with new json structure
    update(obj) {
        return { ...this.data, ...flattenJsonWithEscaping(obj) };
    }

    // Searches keys and returns an array of key-value pairs
    search(criteria, options = { like: false, regex: false }) {
        const results = [];

        if (Array.isArray(criteria)) {
            // Search for keys in an array
            for (const key of criteria) {
                if (this.data.hasOwnProperty(key)) {
                    results.push({ key, value: this.data[key] });
                }
            }
        } else if (options.regex) {
            // Search using a regex
            const regex = new RegExp(criteria);
            for (const key of Object.keys(this.data)) {
                if (regex.test(key)) {
                    results.push({ key, value: this.data[key] });
                }
            }
        } else if (options.like) {
            // Partial matching
            for (const key of Object.keys(this.data)) {
                if (key.includes(criteria)) {
                    results.push({ key, value: this.data[key] });
                }
            }
        } else {
            // Exact key match
            if (this.data.hasOwnProperty(criteria)) {
                results.push({ key: criteria, value: this.data[criteria] });
            }
        }

        return results;
    }

    // Searches values and returns an array of key-value pairs
    searchValue(criteria, options = { like: false, regex: false }) {
        const results = [];

        if (Array.isArray(criteria)) {
            // Search for values in an array
            for (const [key, value] of Object.entries(this.data)) {
                if (criteria.includes(value)) {
                    results.push({ key, value });
                }
            }
        } else if (options.regex) {
            // Search using a regex
            const regex = new RegExp(criteria);
            for (const [key, value] of Object.entries(this.data)) {
                if (regex.test(String(value))) {
                    results.push({ key, value });
                }
            }
        } else if (options.like) {
            // Partial matching
            for (const [key, value] of Object.entries(this.data)) {
                if (String(value).includes(criteria)) {
                    results.push({ key, value });
                }
            }
        } else {
            // Exact value match
            for (const [key, value] of Object.entries(this.data)) {
                if (value === criteria) {
                    results.push({ key, value });
                }
            }
        }

        return results;
    }


    // Searches both keys and values and returns an array of key-value pairs
    searchKeyValue(criteria, options = { like: false, regex: false }) {
        const results = [];

        if (Array.isArray(criteria)) {
            // Search for keys or values in an array
            for (const key of Object.keys(this.data)) {
                if (
                    criteria.includes(key) ||
                    criteria.includes(this.data[key])
                ) {
                    results.push({ key, value: this.data[key] });
                }
            }
        } else if (options.regex) {
            // Search using a regex
            const regex = new RegExp(criteria);
            for (const [key, value] of Object.entries(this.data)) {
                if (regex.test(key) || regex.test(String(value))) {
                    results.push({ key, value });
                }
            }
        } else if (options.like) {
            // Partial matching
            for (const [key, value] of Object.entries(this.data)) {
                if (key.includes(criteria) || String(value).includes(criteria)) {
                    results.push({ key, value });
                }
            }
        } else {
            // Exact match for either key or value
            for (const [key, value] of Object.entries(this.data)) {
                if (key === criteria || value === criteria) {
                    results.push({ key, value });
                }
            }
        }

        return results;
    }

}

module.exports = {
    JsonManager,
    flattenJsonWithEscaping,
    unflattenJson
} 
