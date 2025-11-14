// WebSocket CRUD Server using Express and Data Closure
// Dependencies: express, ws (npm install express ws)

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { URL } = require('url'); // Required for parsing the WS URL during upgrade

// --- 0. Authentication Configuration ---
// IMPORTANT: In a real application, this token should be stored securely (e.g., in environment variables)
// and validated against a proper mechanism like JWT or session management.
const SECRET_AUTH_TOKEN = 'SUPER_SECRET_TOKEN_123'; 

/**
 * Express Middleware for HTTP route authentication.
 * Checks for the SECRET_AUTH_TOKEN in the 'x-auth-token' header.
 */
const authenticateExpress = (req, res, next) => {
    const token = req.headers['x-auth-token'];

    if (token === SECRET_AUTH_TOKEN) {
        // Successful authentication
        req.user = { id: 'auth_user' }; // Attach user info if needed
        next();
    } else {
        // Failed authentication
        console.warn(`HTTP Unauthorized access attempt from ${req.ip}`);
        res.status(401).send('Unauthorized: Missing or invalid authentication token in x-auth-token header.');
    }
};


// --- 1. Data Closure Implementation (Unchanged) ---
const createDataStore = () => {
    const store = {};

    return {
        set: (key, value) => {
            if (!key) throw new Error("Key cannot be empty.");
            store[key] = value;
            return { key, value };
        },
        get: (key) => {
            if (!Object.prototype.hasOwnProperty.call(store, key)) {
                throw new Error(`Key '${key}' not found.`);
            }
            return store[key];
        },
        del: (key) => {
            if (!Object.prototype.hasOwnProperty.call(store, key)) {
                throw new Error(`Key '${key}' not found.`);
            }
            delete store[key];
            return key;
        },
        clear: () => {
            for (const key in store) {
                if (Object.prototype.hasOwnProperty.call(store, key)) {
                    delete store[key];
                }
            }
        },
        getAll: () => {
            return { ...store };
        }
    };
};

const dataStore = createDataStore();

// Seed the store with some initial data
dataStore.set('user:101', { name: 'Apollo', age: 30, city: 'Athens' });
dataStore.set('config:rate_limit', 100);

// --- 2. Server Setup Function (Modularized and Authenticated) ---

/**
 * Starts the Express and WebSocket server on a specified port.
 * @param {number} port - The port number to listen on.
 * @returns {http.Server} The started HTTP server instance.
 */
const startServer = (port) => {
    const app = express();
    const server = http.createServer(app);

    // Apply Express Authentication Middleware
    // Only authenticated users can access the root page
    app.get('/', authenticateExpress, (req, res) => {
        res.send(`<h1>WebSocket CRUD Server Running (Authenticated as: ${req.user.id})</h1>
                  <p>Connect to ws://localhost:${port}/?token=${SECRET_AUTH_TOKEN} for CRUD operations.</p>
                  <p>Available operations: GET, SET, DELETE, GET_ALL</p>`);
    });

    // Initialize WebSocket Server without attaching to the HTTP server yet (noServer: true)
    // This allows us to handle the 'upgrade' event manually for authentication.
    const wss = new WebSocket.Server({ noServer: true });

    // --- WebSocket Authentication Middleware ---
    server.on('upgrade', (request, socket, head) => {
        // 1. Get the token from the connection URL query string (ws://host:port/?token=...)
        // Use the request URL and combine it with a dummy base to parse it fully
        const url = new URL(request.url, `http://${request.headers.host}`);
        const token = url.searchParams.get('token');

        if (token === SECRET_AUTH_TOKEN) {
            // 2. Token is valid: Proceed with WebSocket handshake
            console.log('WS Connection approved.');
            wss.handleUpgrade(request, socket, head, (ws) => {
                // Attach the successful connection to the WSS handler
                wss.emit('connection', ws, request);
            });
        } else {
            // 3. Token is invalid or missing: Reject connection
            console.warn('WS Connection rejected: Invalid or missing token.');
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); // Send HTTP response
            socket.destroy(); // Close the socket
        }
    });

    // WebSocket Message Handling (Only runs for authenticated connections)
    wss.on('connection', (ws) => {
        // You can extract the user ID or other info from the request object here if needed
        
        ws.on('message', (message) => {
            let request;
            try {
                request = JSON.parse(message.toString());
            } catch (e) {
                return sendResponse(ws, 'PARSE_ERROR', null, 'error', 'Invalid JSON message format.');
            }

            const { op, key, value } = request;
            const normalizedOp = (op || '').toUpperCase();

            try {
                switch (normalizedOp) {
                    case 'SET':
                        const setResult = dataStore.set(key, value);
                        sendResponse(ws, normalizedOp, setResult.key, 'success', setResult.value);
                        break;
                    case 'GET':
                        const getValue = dataStore.get(key);
                        sendResponse(ws, normalizedOp, key, 'success', getValue);
                        break;
                    case 'DELETE':
                        const deletedKey = dataStore.del(key);
                        sendResponse(ws, normalizedOp, deletedKey, 'success', `Key '${deletedKey}' deleted.`);
                        break;
                    case 'GET_ALL':
                        const allData = dataStore.getAll();
                        sendResponse(ws, normalizedOp, null, 'success', allData);
                        break;
                    default:
                        sendResponse(ws, normalizedOp, key, 'error', `Unknown operation: ${op}. Must be GET, SET, DELETE, or GET_ALL.`);
                }
            } catch (error) {
                sendResponse(ws, normalizedOp, key, 'error', error.message);
            }
        });
    });

    // Function to send a standardized JSON response
    const sendResponse = (ws, op, key, status, resultOrMessage) => {
        const response = {
            op,
            key: key || null,
            status,
            data: (status === 'success') ? resultOrMessage : null,
            error: (status === 'error') ? resultOrMessage : null,
            timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(response));
    };


    server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    return server;
};

// --- Conditional Execution for Direct Run ---
if (require.main === module) {
    const PORT = 8080;
    startServer(PORT);
    console.log(`Express server started on http://localhost:${PORT}`);
    console.log(`WebSocket server started, required token: ${SECRET_AUTH_TOKEN}`);
}

// --- Exports for Testing ---
module.exports = { startServer, dataStore, SECRET_AUTH_TOKEN };