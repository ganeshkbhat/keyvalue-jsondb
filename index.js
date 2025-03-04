
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const WebSocket = require('ws');
const fetch = require('node-fetch');


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


function JsonManager() {
    var data = {};

    // constructor() {
    //     this.data = {};
    // }

    // Read method with createKey functionality
    function read(key, createKey = false) {
        if (data.hasOwnProperty(key)) {
            return data[key];
        }
        if (createKey) {
            data[key] = null;
            return data[key];
        }
        return undefined;
    }

    // Write method to set a value for a key
    function write(key, value) {
        data[key] = value;
    }

    // Dumps the entire JSON object
    function dump() {
        return { ...unflattenJson(data) }; // Return a shallow copy to prevent direct modification
    }

    // Checks if a key exists
    function hasKey(key) {
        return data.hasOwnProperty(key);
    }

    // Gets the value of a key
    function getKey(key) {
        return data[key];
    }

    // instantiates the new value
    function init(obj) {
        return data = flattenJsonWithEscaping(obj);
    }

    // updates the json with new json structure
    function update(obj) {
        return { ...data, ...flattenJsonWithEscaping(obj) };
    }

    // Searches keys and returns an array of key-value pairs
    function search(criteria, options = { like: false, regex: false }) {
        const results = [];

        if (Array.isArray(criteria)) {
            // Search for keys in an array
            for (const key of criteria) {
                if (data.hasOwnProperty(key)) {
                    results.push({ key, value: data[key] });
                }
            }
        } else if (options.regex) {
            // Search using a regex
            const regex = new RegExp(criteria);
            for (const key of Object.keys(data)) {
                if (regex.test(key)) {
                    results.push({ key, value: data[key] });
                }
            }
        } else if (options.like) {
            // Partial matching
            for (const key of Object.keys(data)) {
                if (key.includes(criteria)) {
                    results.push({ key, value: data[key] });
                }
            }
        } else {
            // Exact key match
            if (data.hasOwnProperty(criteria)) {
                results.push({ key: criteria, value: data[criteria] });
            }
        }

        return results;
    }

    // Searches values and returns an array of key-value pairs
    function searchValue(criteria, options = { like: false, regex: false }) {
        const results = [];

        if (Array.isArray(criteria)) {
            // Search for values in an array
            for (const [key, value] of Object.entries(data)) {
                if (criteria.includes(value)) {
                    results.push({ key, value });
                }
            }
        } else if (options.regex) {
            // Search using a regex
            const regex = new RegExp(criteria);
            for (const [key, value] of Object.entries(data)) {
                if (regex.test(String(value))) {
                    results.push({ key, value });
                }
            }
        } else if (options.like) {
            // Partial matching
            for (const [key, value] of Object.entries(data)) {
                if (String(value).includes(criteria)) {
                    results.push({ key, value });
                }
            }
        } else {
            // Exact value match
            for (const [key, value] of Object.entries(data)) {
                if (value === criteria) {
                    results.push({ key, value });
                }
            }
        }

        return results;
    }

    // Searches both keys and values and returns an array of key-value pairs
    function searchKeyValue(criteria, options = { like: false, regex: false }) {
        const results = [];

        if (Array.isArray(criteria)) {
            // Search for keys or values in an array
            for (const key of Object.keys(data)) {
                if (
                    criteria.includes(key) ||
                    criteria.includes(data[key])
                ) {
                    results.push({ key, value: data[key] });
                }
            }
        } else if (options.regex) {
            // Search using a regex
            const regex = new RegExp(criteria);
            for (const [key, value] of Object.entries(data)) {
                if (regex.test(key) || regex.test(String(value))) {
                    results.push({ key, value });
                }
            }
        } else if (options.like) {
            // Partial matching
            for (const [key, value] of Object.entries(data)) {
                if (key.includes(criteria) || String(value).includes(criteria)) {
                    results.push({ key, value });
                }
            }
        } else {
            // Exact match for either key or value
            for (const [key, value] of Object.entries(data)) {
                if (key === criteria || value === criteria) {
                    results.push({ key, value });
                }
            }
        }

        return results;
    }

    return {
        read,
        write,
        update,
        dump,
        init,
        hasKey,
        getKey,
        search,
        searchValue,
        searchKeyValue
    }

}


// Dummy function search (replace with your actual logic)
function run(body, queryParams) {
    try {
        // Attempt to parse body as JSON
        const parsedBody = JSON.parse(body);
        // Example: Search based on a 'query' parameter in the body or URL
        const searchQuery = parsedBody.query || queryParams.query;
        // if (searchQuery === "search") {
        //     return {
        //         results: [`Result for: ${searchQuery}`, `Another result for: ${searchQuery}`, JSON.stringify(parsedBody)],
        //     };
        // } else if (searchQuery === "create") {
        //     return {
        //         results: [`Result for: ${searchQuery}`, `Another result for: ${searchQuery}`, JSON.stringify(parsedBody)],
        //     };
        // } else if (searchQuery === "update") {
        //     return {
        //         results: [`Result for: ${searchQuery}`, `Another result for: ${searchQuery}`, JSON.stringify(parsedBody)],
        //     };
        // } else if (searchQuery === "delete") {
        //     return {
        //         results: [`Result for: ${searchQuery}`, `Another result for: ${searchQuery}`, JSON.stringify(parsedBody)],
        //     };
        // } else {
        //     return { error: 'No search query provided' };
        // }
        if (parsedBody.event === "search") {
            return {
                results: [`Result for: ${parsedBody}`, `Another result for: ${parsedBody}`, JSON.stringify(parsedBody)],
            };
        } else if (parsedBody.event === "create") {
            return {
                results: [`Result for: ${parsedBody}`, `Another result for: ${parsedBody}`, JSON.stringify(parsedBody)],
            };
        } else if (parsedBody.event === "update") {
            return {
                results: [`Result for: ${parsedBody}`, `Another result for: ${parsedBody}`, JSON.stringify(parsedBody)],
            };
        } else if (parsedBody.event === "delete") {
            return {
                results: [`Result for: ${parsedBody}`, `Another result for: ${parsedBody}`, JSON.stringify(parsedBody)],
            };
        } else {
            return { error: 'No search query provided' };
        }
    } catch (error) {
        return { error: 'Invalid JSON body or query parameter' };
    }
}

// // HTTP Server
// { "event": "search", "data": { "query": "websocket test" } }
// { "event": "create", "data": { "item": "new item" } }
function startHttpServer(port = 3000, middlewares = []) {
    const datetime = new Date.now();
    const app = express();
    app.request('/', middlewares, (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const queryParams = parsedUrl.query;
        if (path === '/') {
            if (req.method === 'POST') {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const searchResult = run(body, queryParams);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(searchResult));
                });
            } else if (req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(`{"health": "alive", "since": ${datetime} }`);
            } else {
                res.writeHead(405, { 'Content-Type': 'text/plain' });
                res.end('Method Not Allowed');
            }
        } else if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(`{"health": "alive", "since": ${datetime} }`);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    const httpServer = http.createServer(app);
    return httpServer.listen(port, () => {
        console.log('HTTP Server listening on port 3000');
    });

}

// // HTTPS Server
// { "event": "search", "data": { "query": "websocket test" } }
// { "event": "create", "data": { "item": "new item" } }
function startHttpsServer(key, cert, port = 3443, middlewares = []) {
    const datetime = new Date.now();
    const app = express();
    // HTTPS Server (requires certificate and key)
    try {
        app.request('/', middlewares, (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const path = parsedUrl.pathname;
            const queryParams = parsedUrl.query;
            if (path === '/') {
                if (req.method === 'POST') {
                    let body = '';
                    req.on('data', (chunk) => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        const searchResult = run(body, queryParams);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(searchResult));
                    });
                } else if (req.method === 'GET') {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(`{"health": "alive", "since": ${datetime} }`);
                } else {
                    res.writeHead(405, { 'Content-Type': 'text/plain' });
                    res.end('Method Not Allowed');
                }
            } else if (path === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(`{"health": "alive", "since": ${datetime} }`);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            }
        });

        const privateKey = fs.readFileSync(key, 'utf8');
        const certificate = fs.readFileSync(cert, 'utf8');
        const credentials = { key: privateKey, cert: certificate };
        const httpsServer = https.createServer(credentials, app);

        return httpsServer.listen(port, () => {
            console.log(`HTTPS Server listening on port ${port}`);
        });

    } catch (error) {
        console.error("HTTPS server could not be started. Missing or invalid certificate/key files or other error:", error);
    }
}


// WebSocket Server
// { "event": "search", "data": { "query": "websocket test" } }
// { "event": "create", "data": { "item": "new item" } }
function startWebsocketServer(port = 3000, middlewares = []) {
    const httpServer = startHttpServer(port);
    const wss = new WebSocket.Server({ server: httpServer });
    wss.on('connection', (ws, req) => {
        const queryParams = url.parse(req.url, true).query;
        ws.on('message', (message) => {
            try {
                const { event, data } = JSON.parse(message);
                if (['search', 'create', 'update', 'delete'].includes(event)) {
                    if (event === 'search') {
                        const result = run(JSON.stringify(data), queryParams);
                        ws.send(JSON.stringify({ event: 'searchResult', data: result }));
                    } else {
                        // Handle create, update, delete events
                        console.log(`Received ${event} event with data:`, data, queryParams);
                        ws.send(JSON.stringify({ event: `${event}Result`, data: { status: 'OK', received: data } }));
                    }
                } else {
                    ws.send(JSON.stringify({ error: 'Invalid event name' }));
                }
            } catch (error) {
                ws.send(JSON.stringify({ error: 'Invalid JSON message' }));
            }
        });
    });
}


// WebSocket Secure Server
// { "event": "search", "data": { "query": "websocket test" } }
// { "event": "create", "data": { "item": "new item" } }
function startWebsocketSecureServer(key, cert, port = 3443, middlewares = []) {
    const httpsServer = startHttpsServer(key, cert, port);
    if (httpsServer) {
        const wssSecure = new WebSocket.Server({ server: httpsServer });
        wssSecure.on('connection', (ws, req) => {
            const queryParams = url.parse(req.url, true).query;
            ws.on('message', (message) => {
                try {
                    const { event, data } = JSON.parse(message);
                    if (['search', 'create', 'update', 'delete'].includes(event)) {
                        if (event === 'search') {
                            const result = run(JSON.stringify(data), queryParams);
                            ws.send(JSON.stringify({ event: 'searchResult', data: result }));
                        } else {
                            // Handle create, update, delete events
                            console.log(`Received ${event} event (secure) with data:`, data, queryParams);
                            ws.send(JSON.stringify({ event: `${event}Result`, data: { status: 'OK', received: data } }));
                        }
                    } else {
                        ws.send(JSON.stringify({ error: 'Invalid event name' }));
                    }
                } catch (error) {
                    ws.send(JSON.stringify({ error: 'Invalid JSON message' }));
                }
            });
        });
    }
}


function ClientsHttp() {

    // // Using axios
    // const axios = require('axios');
    // async function httpPostRequest() {
    //     try {
    //         const response = await axios.post('http://localhost:3000/api/data', {
    //             event: 'search',
    //             data: { query: 'websocket test' },
    //         });
    //         console.log('HTTP Response:', response.data);
    //     } catch (error) {
    //         console.error('HTTP Error:', error.message);
    //     }
    // }
    // httpPostRequest();
    // async function httpPostCreate(serverPath) {
    //     try {
    //         const response = await axios.post(serverPath, {
    //             event: 'create',
    //             data: { item: 'new item' }
    //         });
    //         console.log("HTTP create response", response.data);
    //     } catch (error) {
    //         console.error("HTTP create error", error.message);
    //     }
    // }
    // httpPostCreate();

    // //Using fetch
    // const fetch = require('node-fetch');

    async function httpFetchPostSearch(serverPath) {
        try {
            const response = await fetch(serverPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event: 'search', data: { query: "websocket test" } })
            });
            const data = await response.json();
            console.log("Fetch http search response:", data);
        } catch (error) {
            console.error("Fetch http search error:", error);
        }
    }
    // httpFetchPostSearch();

    async function httpFetchPostCreate(serverPath) {
        try {
            const response = await fetch(serverPath, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ event: "create", data: { item: "new item" } })
            });
            const data = await response.json();
            console.log("Fetch http create response:", data);
        } catch (error) {
            console.error("Fetch http create error:", error);
        }
    }
    // httpFetchPostCreate();
}


function ClientsHttps() {
    // // Using axios
    // const axios = require('axios');
    // const fs = require('fs');
    // const https = require('https');
    //
    // async function httpsPostRequest(serverPath) {
    //     try {
    //         const cert = fs.readFileSync('path/to/certificate.crt');
    //         const httpsAgent = new https.Agent({ ca: cert });

    //         const response = await axios.post(serverPath, {
    //             event: 'search',
    //             data: { query: 'websocket test' },
    //         }, { httpsAgent });
    //         console.log('HTTPS Response:', response.data);
    //     } catch (error) {
    //         console.error('HTTPS Error:', error.message);
    //     }
    // }
    // httpsPostRequest();
    // async function httpsPostCreate(serverPath) {
    //     try {
    //         const cert = fs.readFileSync('path/to/certificate.crt');
    //         const httpsAgent = new https.Agent({ ca: cert });

    //         const response = await axios.post(serverPath, {
    //             event: 'create',
    //             data: { item: 'new item' }
    //         }, { httpsAgent });
    //         console.log("HTTPS create response", response.data);
    //     } catch (error) {
    //         console.error("HTTPS create error", error.message);
    //     }
    // }
    // httpsPostCreate();

    // //Using fetch
    // const fetch = require('node-fetch');

    async function httpsFetchPostSearch(serverPath) {
        try {
            const cert = fs.readFileSync('path/to/certificate.crt');
            const agent = new https.Agent({ ca: cert });
            const response = await fetch(serverPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'search', data: { query: 'websocket test' } }),
                agent: agent
            });
            const data = await response.json();
            console.log("HTTPS fetch search response:", data);
        } catch (error) {
            console.error("HTTPS fetch search error:", error);
        }
    }
    // httpsFetchPostSearch();

    async function httpsFetchPostCreate(serverPath) {
        try {
            const cert = fs.readFileSync('path/to/certificate.crt');
            const agent = new https.Agent({ ca: cert });
            const response = await fetch(serverPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event: 'create', data: { item: 'new item' } }),
                agent: agent
            });
            const data = await response.json();
            console.log("HTTPS fetch create response:", data);
        } catch (error) {
            console.error("HTTPS fetch create error:", error);
        }
    }
    // httpsFetchPostCreate();
}


function ClientsWs(serverPath) {
    // 'ws://localhost:3000'
    const ws = new WebSocket(serverPath);

    ws.on('open', () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify({ event: 'search', data: { query: 'websocket test' } }));
        ws.send(JSON.stringify({ event: 'create', data: { item: 'new item' } }));
    });

    ws.on('message', (data) => {
        console.log('WS Message:', JSON.parse(data));
        ws.close();
    });

    ws.on('close', () => {
        console.log('WebSocket disconnected');
    });

    ws.on('error', (error) => {
        console.error('WebSocket Error:', error);
    });
}

function ClientsWss(serverPath) {
    // 'wss://localhost:443'
    
    const cert = fs.readFileSync('path/to/certificate.crt');
    const wss = new WebSocket(serverPath, {
        ca: cert,
    });

    wss.on('open', () => {
        console.log('WSS connected');
        wss.send(JSON.stringify({ event: 'search', data: { query: 'websocket test' } }));
        wss.send(JSON.stringify({ event: 'create', data: { item: 'new item' } }));
    });

    wss.on('message', (data) => {
        console.log('WSS Message:', JSON.parse(data));
        wss.close();
    });

    wss.on('close', () => {
        console.log('WSS disconnected');
    });

    wss.on('error', (error) => {
        console.error("WSS error:", error);
    });
}

module.exports = {
    JsonManager,
    flattenJsonWithEscaping,
    unflattenJson,
    startHttpServer,
    startHttpsServer,
    startWebsocketServer,
    startWebsocketSecureServer,
    ClientsHttp,
    ClientsHttps,
    ClientsWs,
    ClientsWss
}

