
describe('JsonManager', function() {
    let manager;

    beforeEach(function() {
        // Initialize a fresh instance before each test
        manager = JsonManager();
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

    describe('Search Methods (dumpKeys delegation)', function() {
        const testData = {
            "name": "Jane Doe",
            "age": 30,
            "role.title": "Engineer",
            "tags.status": "Active",
            "tags.location": "NYC",
            "value_string": "beta-test",
            "value_number": 123
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
            assert.ok(results.every(r => r.key.includes('tags.') || r.key.includes('role.')));
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

        // --- Key/Value Search (dumpKeys, type=keyvalue) ---

        it('should search key OR value by LIKE', function() {
            // Criteria 'Ja': matches key 'name' (value 'Jane Doe')
            let results = manager.dumpKeys('Ja', { like: true }, 'keyvalue');
            assert.strictEqual(results.length, 1);

            // Criteria 'NYC': matches value 'NYC' (key 'tags.location')
            results = manager.dumpKeys('NYC', { like: true }, 'keyvalue');
            assert.strictEqual(results.length, 1);

            // Criteria '3': matches key 'age' (value 30) AND value '123' (key 'value_number')
            results = manager.dumpKeys('3', { like: true }, 'keyvalue');
            assert.strictEqual(results.length, 2);
            assert.ok(results.some(r => r.key === 'age'));
            assert.ok(results.some(r => r.key === 'value_number'));
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
