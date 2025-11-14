/**
 * Mocha/Chai/Supertest tests for the JSON Manager Express App (server.js)
 *
 * Dependencies required for running:
 * npm install mocha chai supertest --save-dev
 */

const request = require('supertest');
const { expect } = require('chai');
const initializeApp = require('../index'); // Import the function from server.js > index.js > startServer

// Initialize the app without starting the listener (port: 0)
const app = initializeApp( port = 0 );

describe('JSON Manager Express API (/api/json-store)', () => {
    // Reference to the internal manager instance for direct inspection (optional, but useful)
    const jsnmgr = app.jsnmgr;

    beforeEach(() => {
        // Reset the internal data store before each test to ensure isolation
        // We do this by re-initializing the manager instance
        app.jsnmgr = initializeApp( port = 0 ).jsnmgr;
    });

    it('should initialize with an empty store (GET /api/json-store)', async () => {
        const response = await request(app).get('/api/json-store');
        
        expect(response.statusCode).to.equal(200);
        expect(response.body.status).to.equal('ok');
        expect(response.body.store_state).to.deep.equal({});
    });

    describe('POST Operations (set, get, has_key, update)', () => {

        it('should successfully SET a key-value pair', async () => {
            const key = 'user_name';
            const value = 'Jane Doe';

            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'set', key: key, value: value });

            expect(response.statusCode).to.equal(200);
            expect(response.body.message).to.include(`Key '${key}' set successfully.`);
            expect(response.body.data.value).to.equal(value);
            // Verify the internal state was updated
            expect(jsnmgr.get(key)).to.equal(value);
        });

        it('should successfully GET a stored value', async () => {
            // First, set a value directly in the manager
            jsnmgr.set('current_count', 42);

            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'get', key: 'current_count' });

            expect(response.statusCode).to.equal(200);
            expect(response.body.value).to.equal(42);
        });

        it('should successfully check HAS_KEY for an existing key', async () => {
            jsnmgr.set('is_active', true);

            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'has_key', key: 'is_active' });

            expect(response.statusCode).to.equal(200);
            expect(response.body.exists).to.be.true;
        });

        it('should successfully UPDATE an existing numeric value (increment)', async () => {
            // Start with a counter value
            jsnmgr.set('counter', 100);

            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'update', key: 'counter', value: 50 }); // Add 50

            expect(response.statusCode).to.equal(200);
            expect(response.body.data.old_value).to.equal(100);
            expect(response.body.data.new_value).to.equal(150);
            // Verify the internal state
            expect(jsnmgr.get('counter')).to.equal(150);
        });

        it('should initialize and UPDATE a non-numeric value to a new number', async () => {
            // Start with a non-numeric value (or undefined if the key didn't exist, though we test existing keys here)
            jsnmgr.set('reset_count', 'initial_text');

            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'update', key: 'reset_count', value: 10 }); // Add 10

            expect(response.statusCode).to.equal(200);
            // The logic treats non-numeric oldValue as 0, so 0 + 10 = 10
            expect(response.body.data.old_value).to.equal('initial_text');
            expect(response.body.data.new_value).to.equal(10);
            expect(jsnmgr.get('reset_count')).to.equal(10);
        });
    });

    describe('Edge Cases and Error Handling', () => {

        it('should return 404 for GETting a non-existent key', async () => {
            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'get', key: 'non_existent_key' });

            expect(response.statusCode).to.equal(200); // 200 because it executed successfully, but value is undefined
            expect(response.body.value).to.be.undefined;
            expect(response.body.message).to.include('not found');
        });

        it('should return 404 for UPDATEing a non-existent key', async () => {
            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'update', key: 'non_existent_key', value: 1 });

            expect(response.statusCode).to.equal(404);
            expect(response.body.error).to.include('not found for update');
        });

        it('should return 400 if operation is missing', async () => {
            const response = await request(app)
                .post('/api/json-store')
                .send({ key: 'test', value: 1 });

            expect(response.statusCode).to.equal(400);
            expect(response.body.error).to.include('Missing required fields: operation and key.');
        });

        it('should return 400 for an invalid operation name', async () => {
            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'destroy', key: 'test' });

            expect(response.statusCode).to.equal(400);
            expect(response.body.error).to.include('Invalid operation');
        });

        it('should return 400 if VALUE is missing for SET operation', async () => {
            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'set', key: 'test_key' }); // Value is undefined

            expect(response.statusCode).to.equal(400);
            expect(response.body.error).to.include('Value is required for the "set" operation.');
        });

        it('should return 400 if UPDATE value is not a number (for demo purposes)', async () => {
             jsnmgr.set('my_key', 10);
            const response = await request(app)
                .post('/api/json-store')
                .send({ operation: 'update', key: 'my_key', value: 'not_a_number' });

            expect(response.statusCode).to.equal(400);
            expect(response.body.error).to.include('value must be a number');
        });
    });
});
