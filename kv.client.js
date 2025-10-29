// To run this client:
// 1. Ensure your server.js is running (node server.js).
// 2. You will need to install the 'ws' library for the WebSocket functionality.
//    (If you only use the HTTP functions, you only need Node's built-in 'http').
// 3. Run the client: node client.js

const http = require('http');
const WebSocket = require('ws');

const HOST = 'localhost';
const PORT = 3000;
const URL_BASE = `http://${HOST}:${PORT}`;

// =================================================================
// 1. HTTP API (ClientAPI)
// Uses the single POST / endpoint to perform all operations.
// =================================================================

/**
 * Executes a command against the server's single POST / endpoint.
 * @param {string} query The command (DUMP, GET, SET, DELETE).
 * @param {string} [key] The key for GET/SET/DELETE queries.
 * @param {*} [value] The value for SET queries.
 * @returns {Promise<Object>} The server's response data.
 */
function _httpRequest(query, key, value) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            query: query.toUpperCase(),
            key: key,
            value: value
        });

        const options = {
            hostname: HOST,
            port: PORT,
            path: '/', // Your server is set to the root path
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(data);
                    if (res.statusCode >= 400) {
                        // Reject on HTTP error status
                        reject(new Error(`Server Error (${res.statusCode}): ${jsonResponse.error || jsonResponse.message}`));
                    } else {
                        resolve(jsonResponse);
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse server response: ${data}`));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Request failed: ${e.message}. Is server running at ${URL_BASE}?`));
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Client API for interacting with the key-value store via HTTP POST requests.
 */
const ClientAPI = {
    /**
     * Retrieves the entire database state.
     * @returns {Promise<Object>} The full database object.
     */
    async dump() {
        console.log(`[API] Dumping entire DB...`);
        const response = await _httpRequest('DUMP');
        return response.data;
    },

    /**
     * Retrieves the value associated with a key.
     * @param {string} key The key to retrieve.
     * @returns {Promise<*>} The value for the key.
     */
    async get(key) {
        console.log(`[API] Getting key: ${key}...`);
        const response = await _httpRequest('GET', key);
        return response.value;
    },

    /**
     * Sets or updates the value for a key.
     * @param {string} key The key to set.
     * @param {*} value The new value.
     * @returns {Promise<Object>} The server's response details.
     */
    async set(key, value) {
        console.log(`[API] Setting key: ${key} to ${JSON.stringify(value)}...`);
        return _httpRequest('SET', key, value);
    },

    /**
     * Deletes a key from the database.
     * @param {string} key The key to delete.
     * @returns {Promise<Object>} The server's response details.
     */
    async delete(key) {
        console.log(`[API] Deleting key: ${key}...`);
        return _httpRequest('DELETE', key);
    }
};


// =================================================================
// 2. WEBSOCKET CLIENT EXAMPLE
// Demonstrates how to use WS for query-response patterns.
// =================================================================

class WebSocketClient {
    constructor(host, port) {
        this.url = `ws://${host}:${port}`;
        this.ws = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.on('open', () => {
                console.log(`[WS] Connected to ${this.url}`);
                resolve(this);
            });

            this.ws.on('error', (err) => {
                console.error('[WS] Connection error:', err.message);
                reject(err);
            });

            // Implement keep-alive (simplified example)
            // Send ping every 30 seconds
            const interval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.ping(); // Send a ping frame
                } else {
                    clearInterval(interval);
                }
            }, 30000); 
            
            ws.on('pong', () => {
                // Client responded to ping, connection is alive
                console.log('Received pong from client');
            });
            this.ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    switch (data.event.toLowercase()) {
                        case "set":
                            console.log("set running")
                            break;
                    }
                    console.log(`[WS] Received response:`, msg);
                } catch (e) {
                    console.error('[WS] Received non-JSON message:', data.toString());
                }
            });

            this.ws.on('close', () => {
                console.log('[WS] Disconnected.');
            });
        });
    }

    sendQuery(query, key, value) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const payload = JSON.stringify({ query, key, value });
            console.log(`[WS] Sending query: ${payload}`);
            this.ws.send(payload);
        } else {
            console.error('[WS] Cannot send query: WebSocket is not open.');
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}


// =================================================================
// 3. USAGE DEMO
// =================================================================

async function runDemo() {
    console.log('--- STARTING HTTP CLIENT DEMO ---');
    try {
        // 1. GET (Initial value)
        const initialUsers = await ClientAPI.get('users');
        console.log(`Initial users value: ${initialUsers}`);

        // 2. SET (Update existing key)
        const updateResponse = await ClientAPI.set('users', initialUsers + 1);
        console.log(updateResponse.message);

        // 3. GET (New value)
        const newUsers = await ClientAPI.get('users');
        console.log(`Updated users value: ${newUsers}`);

        // 4. SET (Create new key)
        const createResponse = await ClientAPI.set('newUserKey', { name: 'Alice', active: true });
        console.log(createResponse.message);

        // 5. DUMP
        const fullDb = await ClientAPI.dump();
        console.log('\nFULL DATABASE DUMP:');
        console.log(JSON.stringify(fullDb, null, 2));

        // 6. DELETE
        const deleteResponse = await ClientAPI.delete('newUserKey');
        console.log(deleteResponse.message);

        console.log(`Verification: Attempting to get deleted key...`);
        await ClientAPI.get('newUserKey').catch(err => console.error(err.message));


    } catch (error) {
        console.error('\nHTTP DEMO FAILED:', error.message);
    }


    console.log('\n--- STARTING WEBSOCKET CLIENT DEMO ---');
    let wsClient = null;
    try {
        wsClient = await new WebSocketClient(HOST, PORT).connect();

        // Give a moment for connection to fully establish
        await new Promise(r => setTimeout(r, 500));

        // WS DUMP query
        wsClient.sendQuery('DUMP');

        // WS SET query (creates a key)
        wsClient.sendQuery('SET', 'wsTestKey', 'Hello from WS');

        // WS GET query
        wsClient.sendQuery('GET', 'wsTestKey');

        // WS DELETE query
        wsClient.sendQuery('DELETE', 'wsTestKey');

        // Keep connection open briefly to receive messages
        await new Promise(r => setTimeout(r, 1000));

    } catch (error) {
        console.error('\nWEBSOCKET DEMO FAILED:', error.message);
    } finally {
        if (wsClient) {
            wsClient.close();
        }
    }
}

// Execute the demo
runDemo();
