
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const fetch = require('node-fetch');
const express = require('express');
const { JsonManager, flattenJsonWithEscaping, unflattenJson } = require("json-faster");


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
function startHttpServer(port = 3000, middlewares = [], app) {
    const datetime = Date.now();
    const apps = express();
    if (!!app) apps.use(app);
    apps.all('/', middlewares, (req, res) => {
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

    const httpServer = http.createServer(apps);
    return httpServer.listen(port, () => {
        console.log('HTTP Server listening on port 3000');
    });

}


// // HTTPS Server
// { "event": "search", "data": { "query": "websocket test" } }
// { "event": "create", "data": { "item": "new item" } }
function startHttpsServer(key, cert, port = 3443, middlewares = [], app) {
    const datetime = new Date.now();
    const apps = express();
    // HTTPS Server (requires certificate and key)
    try {
        if (!!app) apps.use(app);
        app.all('/', middlewares, (req, res) => {
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
        const httpsServer = https.createServer(credentials, apps);

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


// Clients
function clients() {

    async function Http(serverPath, message, callback) {
        //
        // {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ event: 'search', data: { query: "websocket test" } })
        // }
        // {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ event: "create", data: { item: "new item" } })
        // }
        //
        try {

            const response = await fetch(serverPath, message);
            const data = await response.json();
            console.log("Fetch http search response:", data);
            if (!!callback) {
                callback(null, data)
            } else {
                return Promise.resolve(data);
            }
        } catch (err) {
            console.error("Fetch http search error:", err);
            if (!!callback) {
                callback(err, null)
            } else {
                return Promise.reject(err);
            }
        }
    }
    // http();

    async function Https(serverPath, cert, message, callback) {
        //
        // {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ event: 'search', data: { query: 'websocket test' } }),
        //     agent: agent
        // }
        // {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ event: 'create', data: { item: 'new item' } }),
        //     agent: agent
        // }
        //

        try {
            const certificate = fs.readFileSync(cert);
            const agent = new https.Agent({ ca: certificate });


            const response = await fetch(serverPath, message);
            const data = await response.json();
            console.log("HTTPS fetch search response:", data);
            if (!!callback) {
                callback(null, data)
            } else {
                return Promise.resolve(data);
            }
        } catch (err) {
            console.error("Fetch http search error:", err);
            if (!!callback) {
                callback(err, null)
            } else {
                return Promise.reject(err);
            }
        }
    }
    // https();

    function Ws(serverPath, callback) {
        // 'ws://localhost:3000'
        const ws = new WebSocket(serverPath);

        ws.on('open', () => {
            console.log('WebSocket connected');
            ws.send(JSON.stringify({ event: 'search', data: { query: 'websocket test' } }));
            ws.send(JSON.stringify({ event: 'create', data: { item: 'new item' } }));
            // open(ws);
            callback(ws, "open");
        });

        ws.on('message', (data) => {
            console.log('WS Message:', JSON.parse(data));
            // message(ws)
            callback(ws, "message", data);
            // ws.close();
        });

        ws.on('close', () => {
            console.log('WebSocket disconnected');
            // close(ws)
            callback(ws, "close");
        });

        ws.on('error', (err) => {
            console.error('WebSocket Error:', err);
            // error(ws, err)
            callback(ws, "error", err);
        });
    }

    // callback(wss, event /* open, message, close, error */)
    function Wss(serverPath, cert, callback) {
        // 'wss://localhost:443'
        const certificate = fs.readFileSync(cert);
        const wss = new WebSocket(serverPath, {
            ca: certificate,
        });

        wss.on('open', () => {
            console.log('WSS connected');
            wss.send(JSON.stringify({ event: 'search', data: { query: 'websocket test' } }));
            wss.send(JSON.stringify({ event: 'create', data: { item: 'new item' } }));
            // open(wss)
            callback(wss, "open")
        });

        wss.on('message', (data) => {
            console.log('WSS Message:', JSON.parse(data));
            // message(wss, data)
            callback(wss, "message", data);
            // wss.close();
        });

        wss.on('close', () => {
            console.log('WSS disconnected');
            // close(wss)
            callback(wss, "close");
        });

        wss.on('error', (err) => {
            console.error("WSS error:", err);
            // error(wss, err)
            callback(wss, "error", err)
        });
    }

    return {
        Http,
        Https,
        Ws,
        Wss
    }
}


module.exports = {
    JsonManager,
    flattenJsonWithEscaping,
    unflattenJson,
    startHttpServer,
    startHttpsServer,
    startWebsocketServer,
    startWebsocketSecureServer,
    clients
}

