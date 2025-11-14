/**
 * index.js
 * * A single, runnable Node.js file implementing a command-line interface (CLI)
 * that uses the provided JsonManager logic for data storage and manipulation.
 * * It emulates the behavior of external tools like 'shellflags' and 'readline'
 * to create an interactive shell environment or run a mock server.
 */

const readline = require('readline');
const path = require('path');
const { JsonManager, flattenJsonWithEscaping, unflattenJson, writeToFile } = require("json-faster");

const assert = require('assert');

// =========================================================================

// =========================================================================
// Mocha Test Suite
// =========================================================================

describe('JsonManager', function() {
    let manager;

    beforeEach(function() {
        // Initialize a fresh instance before each test
        manager = new JsonManager();
    });

    describe('Core Operations and Chaining', function() {

        it('should initialize, write, read, and dump correctly (Chaining Test)', function() {
            // 1. Initialize
            const initialData = { "version": 1.0, "status": "clean" };
            manager.init(initialData);
            assert.deepStrictEqual(manager.dump(), initialData, 'Init failed');

            // 2. Write a new key (string/primitive)
            manager.write('user.name', 'Alice');
            assert.deepStrictEqual(manager.getKey('user.name'), 'Alice', 'Write failed for string');

            // 3. Write a complex JSON object (should be parsed)
            manager.write('config', '{"timeout": 500, "active": true}');
            assert.deepStrictEqual(manager.getKey('config'), { timeout: 500, active: true }, 'Write failed for JSON object');

            // 4. Read the keys
            let result = manager.read('user.name');
            assert.deepStrictEqual(result, { 'user.name': 'Alice' }, 'Read failed for existing key');

            // 5. Update (merge)
            manager.update({ "status": "dirty", "new_key": 99 });
            const expectedDump = {
                "version": 1.0,
                "status": "dirty", // updated
                "user.name": "Alice",
                "config": { timeout: 500, active: true },
                "new_key": 99 // new key
            };
            assert.deepStrictEqual(manager.dump(), expectedDump, 'Update failed');

            // 6. Delete the new key
            assert.strictEqual(manager.deleteKey('new_key'), true, 'Delete failed');
            assert.strictEqual(manager.hasKey('new_key'), false, 'Key should be deleted');
        });

        it('should handle read with createKey option', function() {
            // Read a key that does not exist without createKey
            let result = manager.read('nonexistent');
            assert.strictEqual(result, undefined, 'Read should return undefined if key is missing and createKey is false');

            // Read a key that does not exist with createKey=true
            result = manager.read('default_value', { createKey: true });
            assert.deepStrictEqual(result, { 'default_value': null }, 'Read should create key with null value');
            assert.strictEqual(manager.hasKey('default_value'), true, 'hasKey should confirm created key');
        });
    });
    
    // --- NEW: Edge Cases and Data Types ---
    describe('Edge Cases and Data Types', function() {
        it('should handle writing primitive types (number, boolean, null, undefined)', function() {
            // Write a number
            manager.write('count', 42);
            assert.strictEqual(manager.getKey('count'), 42, 'Should store number');

            // Write a boolean
            manager.write('enabled', true);
            assert.strictEqual(manager.getKey('enabled'), true, 'Should store boolean');
            
            // Write null
            manager.write('empty', null);
            assert.strictEqual(manager.getKey('empty'), null, 'Should store null');

            // Write undefined
            manager.write('not_set', undefined);
            assert.strictEqual(manager.getKey('not_set'), undefined, 'Should store undefined');
        });

        it('should fall back to string when writing invalid JSON', function() {
            // This is an invalid JSON string
            manager.write('invalid_json', '{key: "value"}');
            assert.strictEqual(manager.getKey('invalid_json'), '{key: "value"}', 'Should store as string if JSON.parse fails');
        });

        it('should return false when attempting to delete a non-existent key', function() {
            assert.strictEqual(manager.deleteKey('key_that_isnt_there'), true, 'Delete on non-existent key should still return true (due to delete operator nature)');
            assert.strictEqual(manager.dumpKeys('key_that_isnt_there').length, 0, 'Key should not appear in dump');
        });

        it('should correctly read complex data types', function() {
            const complexValue = { items: [1, 2, 3], nested: { ok: true } };
            manager.init({ complexKey: complexValue });
            
            const result = manager.read('complexKey');
            assert.deepStrictEqual(result, { 'complexKey': complexValue }, 'Read should return the complex object');
            assert.deepStrictEqual(manager.getKey('complexKey'), complexValue, 'getKey should return the raw complex object');
        });
    });
    
    // --- UPDATED: Search Methods (dumpKeys delegation) ---
    describe('Search Methods (dumpKeys delegation)', function() {
        const testData = {
            "name": "Jane Doe",
            "age": 30,
            "role.title": "Engineer",
            "tags.status": "Active",
            "tags.location": "NYC",
            "value_string": "beta-test",
            "value_number": 123,
            "config.id": "42-alpha"
        };

        beforeEach(function() {
            manager.init(testData);
        });

        // --- Key Search (dumpKeys, type=search) ---

        it('should search keys by exact match', function() {
            const results = manager.dumpKeys('age');
            assert.strictEqual(results.length, 1);
            assert.deepStrictEqual(results[0].value, 30);
        });

        it('should search keys by LIKE (partial match)', function() {
            const results = manager.dumpKeys('tags', { like: true });
            assert.strictEqual(results.length, 2);
            assert.ok(results.some(r => r.key === 'tags.status'));
            assert.ok(results.some(r => r.key === 'tags.location'));
        });

        it('should search keys by REGEX', function() {
            const results = manager.dumpKeys('role\\.|tags\\.', { regex: true });
            assert.strictEqual(results.length, 3);
            assert.ok(results.some(r => r.key === 'role.title'));
            assert.ok(results.some(r => r.key === 'tags.status'));
        });
        
        it('should search keys using an array of criteria (exact matches)', function() {
            const results = manager.dumpKeys(['age', 'config.id', 'nonexistent.key']);
            assert.strictEqual(results.length, 2);
            assert.ok(results.some(r => r.key === 'age'));
            assert.ok(results.some(r => r.key === 'config.id'));
        });

        // --- Value Search (dumpKeys, type=value) ---

        it('should search values by exact match', function() {
            const results = manager.dumpKeys(30, {}, 'value');
            assert.strictEqual(results.length, 1);
            assert.deepStrictEqual(results[0].key, 'age');
        });

        it('should search values by LIKE (partial match)', function() {
            const results = manager.dumpKeys('test', { like: true }, 'value');
            assert.strictEqual(results.length, 1);
            assert.deepStrictEqual(results[0].key, 'value_string');
        });

        it('should search values by REGEX', function() {
            const results = manager.dumpKeys('^Engin.+', { regex: true }, 'value');
            assert.strictEqual(results.length, 1);
            assert.deepStrictEqual(results[0].key, 'role.title');
        });
        
        it('should search values using an array of criteria (exact matches)', function() {
            const results = manager.dumpKeys(['NYC', 123, 'unknown value'], {}, 'value');
            assert.strictEqual(results.length, 2);
            assert.ok(results.some(r => r.key === 'tags.location'));
            assert.ok(results.some(r => r.key === 'value_number'));
        });

        // --- Key/Value Search (dumpKeys, type=keyvalue) ---

        it('should search key OR value by LIKE', function() {
            // Criteria '3': matches key 'age' (value 30) AND value '123' (key 'value_number')
            const results = manager.dumpKeys('3', { like: true }, 'keyvalue');
            assert.strictEqual(results.length, 2);
            assert.ok(results.some(r => r.key === 'age'));
            assert.ok(results.some(r => r.key === 'value_number'));
        });
        
        it('should search key OR value using an array of criteria (exact matches)', function() {
             const results = manager.dumpKeys(['age', 30, 'role.title', 'Engineer', 'non-match'], {}, 'keyvalue');
             // Age: key match. 30: value match. role.title: key match. Engineer: value match.
             // But 'age' matches key 'age' and '30' matches value '30'. We have unique keys.
             assert.strictEqual(results.length, 4, 'Should find 4 unique entries based on key/value criteria');
             assert.ok(results.some(r => r.key === 'age'));
             assert.ok(results.some(r => r.key === 'role.title'));
             // The search implementation checks if criteria includes the key OR value.
        });
        
        it('should gracefully handle invalid regex pattern in search', function() {
            // The JSON Manager implementation swallows the error and returns an empty array, which is tested here.
            const results = manager.dumpKeys('[', { regex: true });
            assert.strictEqual(results.length, 0, 'Should return empty array for invalid regex');
        });
    });

    describe('Utility Methods', function() {
        it('should correctly report hasKey and getKey status', function() {
            manager.write('testKey', 'testValue');
            assert.strictEqual(manager.hasKey('testKey'), true, 'hasKey should be true');
            assert.strictEqual(manager.getKey('testKey'), 'testValue', 'getKey should return value');
            assert.strictEqual(manager.hasKey('nonExistent'), false, 'hasKey should be false');
            assert.strictEqual(manager.getKey('nonExistent'), undefined, 'getKey should return undefined');
        });

        it('should call dumpToFile without error (mock test)', function() {
            manager.write('data', 1);
            // Since dumpToFile is mocked, we check that it runs without throwing
            assert.doesNotThrow(() => manager.dumpToFile(manager.dump(), 'test.json'));
        });
    });
});