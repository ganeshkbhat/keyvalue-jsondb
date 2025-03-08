/**
 * 
 * Package: 
 * Author: Ganesh B
 * Description: 
 * Install: npm i kvjsondb --save
 * Github: https://github.com/ganeshkbhat/
 * npmjs Link: https://www.npmjs.com/package/
 * File: index.js
 * File Description: 
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const readline = require('readline');
const fetch = require('node-fetch');
const express = require('express');
const { JsonManager, flattenJsonWithEscaping, unflattenJson } = require("json-faster");

const manager = new JsonManager();


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function hasKey(body, queryParams) {
    return manager.hasKey(body.data.query);
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function getKey(body, queryParams) {
    return manager.getKey(body.data.query);
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function search(body, queryParams) {
    return manager.search(body.data.query);
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function searchValue(body, queryParams) {
    return manager.searchValue(body.data.query);
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function searchKeyValue(body, queryParams) {
    return manager.searchKeyValue(body.data.query);
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function read(body, queryParams) {
    return manager.read(body.data.query);
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function create(body, queryParams) {
    let arr = body.data.query.split(",");
    return manager.write(arr[0], arr[1]);
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function update(body, queryParams) {
    return manager.update(body.data.query);
}

/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function del(body, queryParams) {
    return manager.del(body.data.query);
}

/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function dump(body, queryParams) {
    return manager.dump(body.data.query);
}

/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function load(body, queryParams) {
    return manager.update(body.data.query || {}); // use previous data plus load new data
}

/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function init(body, queryParams) {
    return manager.init(body.data.query || {}); // load data
}

/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function clear(body, queryParams) {
    return manager.init({}); // clear with blank object
}


/**
 *
 *
 * @param {*} body
 * @param {*} queryParams
 * @return {*} 
 */
function run(body, queryParams) {
    try {
        // Attempt to parse body as JSON
        const parsedBody = JSON.parse(body);
        // Example: Search based on a 'query' parameter in the body or URL
        const searchQuery = parsedBody.query || queryParams.query;

        if (parsedBody.event === "search") {
            return search(body, queryParams);
        } else if (parsedBody.event === "searchKey") {
            return hasKey(body, queryParams);
        } else if (parsedBody.event === "searchValue") {
            return searchValue(body, queryParams);
        } else if (parsedBody.event === "searchKeyValue") {
            return searchKeyValue(body, queryParams);
        } else if (parsedBody.event === "hasKey") {
            return hasKey(body, queryParams);
        } else if (parsedBody.event === "getKey") {
            return getKey(body, queryParams);
        } else if (parsedBody.event === "init") {
            return init(body, queryParams);
        } else if (parsedBody.event === "clear") {
            return clear(body, queryParams);
        } else if (parsedBody.event === "load") {
            return load(body, queryParams);
        } else if (parsedBody.event === "read") {
            return read(body, queryParams);
        } else if (parsedBody.event === "create") {
            return create(body, queryParams);
        } else if (parsedBody.event === "update") {
            return update(body, queryParams);
        } else if (parsedBody.event === "delete") {
            return del(body, queryParams);
        } else if (parsedBody.event === "dump") {
            return dump(body, queryParams);
        } else {
            return { error: 'No search query provided' };
        }
    } catch (error) {
        return { error: 'Invalid JSON body or query parameter' };
    }
}


/**
 *
 * HTTP Server
 * 
 * { "event": "search", "data": { "query": "websocket test" } }, 
 * { "event": "create", "data": { "item": "new item" } }
 * 
 * @param {number} [port=3000]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 * @return {*} 
 */
function startHttpServer(port = 3000, ip = "127.0.0.1", middlewares = [], app = (req, res, next) => next()) {
    const datetime = Date.now();
    const apps = express();
    if (!!app) apps.use(app);
    apps.use(middlewares);

    apps.all('/', (req, res) => {
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
    return httpServer.listen(port, ip, () => {
        console.log('HTTP Server listening on port 3000');
    });

}


/**
 *
 * HTTPS Server
 * 
 * { "event": "search", "data": { "query": "websocket test" } },
 * { "event": "create", "data": { "item": "new item" } }
 *
 * @param {number} [port=3443]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 * @param {*} key
 * @param {*} cert
 * @return {*} 
 */
function startHttpsServer(port = 3443, ip = "127.0.0.1", middlewares = [], app = (req, res, next) => next(), key, cert) {
    const datetime = new Date.now();
    const apps = express();
    if (!!app) apps.use(app);
    apps.use(middlewares)

    // HTTPS Server (requires certificate and key)
    try {
        app.all('/', (req, res) => {
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


/**
 *
 * WebSocket Server
 * 
 * { "event": "search", "data": { "query": "websocket test" } }, 
 * { "event": "create", "data": { "item": "new item" } }
 * 
 * @param {number} [port=3000]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 */
function startWebsocketServer(port = 3000, ip = "127.0.0.1", middlewares = [], app = (req, res, next) => next()) {
    const httpServer = startHttpServer(port, ip, middlewares, app);
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


/**
 *
 * WebSocket Secure Server
 * 
 * { "event": "search", "data": { "query": "websocket test" } }, 
 * { "event": "create", "data": { "item": "new item" } }
 *
 * @param {number} [port=3443]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 * @param {*} key
 * @param {*} cert
 */
function startWebsocketSecureServer(port = 3443, ip = "127.0.0.1", middlewares = [], app = (req, res, next) => next(), key, cert) {
    const httpsServer = startHttpsServer(port, middlewares, app, key, cert);

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


/**
 * Clients
 *
 * @return { * } Http, Https, Ws, Wss
 */
function Clients() {

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

    async function Http(serverPath, message, callback) {
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
    // Http(...);

    async function Https(serverPath, cert, message, callback) {
        try {
            const certificate = fs.readFileSync(cert);
            const agent = new https.Agent({ ca: certificate });

            const response = await fetch(serverPath, message, agent);
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
    // Https(...);

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
    // Ws(...)

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
    // Ws(...)

    return {
        Http,
        Https,
        Ws,
        Wss
    }
}


/**
 *
 *
 */
function Shell() {

    // set key value
    // get key
    // has key
    // search string
    // search -v string
    // search -k string
    // search -kv string
    // load -f filename
    // load jsonobject
    // read key
    // clear
    // init -f filename
    // init jsonobject
    // update -f filename
    // update jsonobject
    // del key
    // dump -f "filename/within/quotes"

    const search = (query) => `Search results for: ${query}`;
    const searchKey = (query) => `Search key results for: ${query}`;
    const searchValue = (query) => `Search value results for: ${query}`;
    const searchKeyValue = (query) => `Search key-value results for: ${query}`;
    const hasKey = (key) => `Has key: ${key}`;
    const getKey = (key) => `Get key: ${key}`;
    const init = (data) => `Initialized with: ${JSON.stringify(data)}`;
    const clear = () => 'Cleared';
    const load = (data) => `Loaded: ${JSON.stringify(data)}`;
    const read = (key) => `Read: ${key}`;
    const create = (key, value) => `Created: ${key} = ${value}`;
    const update = (data) => `Updated with: ${JSON.stringify(data)}`;
    const deleteItem = (key) => `Deleted: ${key}`;
    const dump = (filename) => `Dumped to: ${filename}`;

    const commandMap = {
        set: create,
        get: getKey,
        has: hasKey,
        search: {
            '': search,
            '-v': searchValue,
            '-k': searchKey,
            '-kv': searchKeyValue,
        },
        load: load,
        read: read,
        clear: clear,
        init: init,
        update: update,
        del: deleteItem,
        dump: dump,
    };

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    function processCommand(commandString) {
        const parts = commandString.trim().split(' ');
        const commandName = parts[0];
        const flags = parts.filter((part) => part.startsWith('-')).join('');
        let valueParts = parts.slice(1).filter((part) => !part.startsWith('-'));
        let value;

        if (commandName === 'set' && valueParts.length >= 2) {
            const key = valueParts[0];
            const val = valueParts.slice(1).join(' ');
            commandMap.set(key, val);
            return recursivePrompt();
        }

        if (commandName === 'load' || commandName === 'init' || commandName === 'update') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = { filename: valueParts[0].slice(1, -1) }; // Remove quotes
                } else {
                    console.log('Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                try {
                    value = JSON.parse(valueParts.join(' '));
                } catch (e) {
                    console.log('Invalid JSON for', commandName);
                    return recursivePrompt();
                }
            }
        } else if (commandName === 'dump') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = valueParts[0].slice(1, -1);
                } else {
                    console.log('Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                console.log('dump requires -f flag with filename');
                return recursivePrompt();
            }
        } else if (commandName === 'read' || commandName === 'has' || commandName === 'get' || commandName === 'del') {
            value = valueParts.join(' ');
        } else if (commandName === 'search') {
            value = valueParts.join(' ');
        } else if (commandName === 'clear' || commandName === 'init') {
            //no arguments required
        } else {
            value = valueParts.join(' ');
        }

        if (commandMap[commandName]) {
            let commandFunction = commandMap[commandName];
            if (typeof commandFunction === 'object' && flags) {
                commandFunction = commandFunction[flags];
            } else if (typeof commandFunction === 'object' && !flags) {
                commandFunction = commandFunction[''];
            }

            if (commandFunction) {
                console.log(commandFunction(value));
            } else {
                console.log('Invalid flags or arguments for command:', commandName);
            }
        } else {
            console.log('Invalid command:', commandName);
        }

        recursivePrompt();
    }

    function recursivePrompt() {
        rl.question('> ', (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
            } else {
                processCommand(input);
            }
        });
    }

    console.log('Recursive shell started. Type "exit" to quit.');
    recursivePrompt();
}


/**
 *
 *
 * @param {string} [type="http"]
 * @param {number} [port=3443]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 * @param {*} key
 * @param {*} cert
 * @return {*} 
 */
function startServer(type = "http", port = 3443, ip = "127.0.0.1", middlewares = [], app = (req, res, next) => next(), key, cert) {
    if (type === "ws") return startWebsocketServer(port, ip, middlewares, app);
    if (type === "wss") return startWebsocketSecureServer(port, ip, middlewares, app, key, cert);
    if (type === "https") return startHttpsServer(port, ip, middlewares, app, key, cert);
    if (type === "http") return startHttpServer(port, ip, middlewares, app);
}


module.exports = {
    JsonManager,
    flattenJsonWithEscaping,
    unflattenJson,
    startHttpServer,
    startHttpsServer,
    startWebsocketServer,
    startWebsocketSecureServer,
    startServer,
    Clients,
    Shell
}

