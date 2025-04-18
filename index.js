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
const express = require('express');
const path = require("path");
const { JsonManager, flattenJsonWithEscaping, unflattenJson, writeToFile } = require("json-faster");


const manager = new JsonManager();


function CommonFuncs() {

    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function hasKey(body, queryParams) {
        return manager.hasKey(body.query);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function getKey(body, queryParams) {
        return manager.getKey(body.query);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function search(body, queryParams) {
        return manager.search(body.query, body.options);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function searchValue(body, queryParams) {
        return manager.searchValue(body.query, body.options);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function searchKeyValue(body, queryParams) {
        return manager.searchKeyValue(body.query, body.options);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function read(body, queryParams) {
        return manager.read(body.query, body.options);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function create(body, queryParams) {
        return manager.write(body.query.key, body.query.value);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function update(body, queryParams) {
        return manager.update(body.query);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function del(body, queryParams) {
        return manager.deleteKey(body.query);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function dump(body, queryParams) {
        return manager.dump();
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function dumpKeys(body, queryParams) {
        return manager.dumpKeys(body.query, body.options, body.type);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function dumpToFile(body, queryParams) {
        return manager.dumpToFile(manager.dump(), body.filename);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function dumpKeysToFile(body, queryParams) {
        // return manager.dumpToFile(manager.dump(body.query, body.options, body.type), body.filename); // consider this functionality as well
        return manager.dumpToFile(manager.dumpKeys(body.query, body.options, body.type), body.filename);
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function load(body, queryParams) {
        return manager.update(!!body.query ? body.query : {}); // use previous data plus load new data
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function init(body, queryParams) {
        return manager.init(body.query || {}); // load data
    }


    /**
     *
     *
     * @param {*} body
     * @param {*} queryParams
     * @return {*} 
     */
    function clear(body, queryParams) {
        return manager.init(body.query || {}); // clear with blank object
    }


    return {
        hasKey,
        getKey,
        search,
        searchValue,
        searchKeyValue,
        read,
        create,
        update,
        del,
        dump,
        dumpKeys,
        dumpToFile,
        dumpKeysToFile,
        load,
        init,
        clear
    }

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
        const {
            hasKey,
            getKey,
            search,
            searchValue,
            searchKeyValue,
            read,
            create,
            update,
            del,
            dump,
            dumpKeys,
            dumpToFile,
            dumpKeysToFile,
            load,
            init,
            clear
        } = CommonFuncs();

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
        } else if (parsedBody.event === "dumpKeys") {
            return dumpKeys(body, queryParams);
        } else if (parsedBody.event === "dumpToFile") {
            return dumpToFile(body, queryParams);
        } else if (parsedBody.event === "dumpKeysToFile") {
            return dumpKeysToFile(body, queryParams);
        } else {
            return { error: 'No search query provided' };
        }
    } catch (error) {
        return { error: 'Invalid JSON body or query parameter' };
    }
}


/**
 *
 *
 * @param {*} ws websocket server instance
 * @param {*} data
 */
const broadcast = function (ws, data) {
    for (var i in ws.clients) {
        ws.clients[i].send(data);
    }
};


/**
 *
 *
 * @param {*} msg
 */
const processWs = function (msg) {
    const searchResult = run(body, queryParams);
}


/**
 *
 *
 * @param {*} msg
 */
const processWss = function (msg) {
    const searchResult = run(body, queryParams);
}


/**
 *
 * HTTP Server
 * 
 * { "event": "search", "query": "websocket test", options: {} }, 
 * { "event": "create", "query": "new item", options: {} }
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
    if (!!middlewares.length) apps.use(middlewares);

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
 * { "event": "search", "query": "websocket test", options: {} }, 
 * { "event": "create", "query": "new item", options: {} }
 *
 * @param {number} [port=3443]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 * @param {*} key
 * @param {*} cert
 * @return {*} 
 */
function startHttpsServer(port = 3443, ip = "127.0.0.1", key, cert, middlewares = [], app = (req, res, next) => next()) {

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
 * { "event": "search", "query": "websocket test", options: {} }, 
 * { "event": "create", "query": "new item", options: {} }
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
                if ([
                    "hasKey",
                    "getKey",
                    "search",
                    "searchValue",
                    "searchKeyValue",
                    "read",
                    "create",
                    "update",
                    "del",
                    "dump",
                    "dumpKeys",
                    "dumpToFile",
                    "dumpKeysToFile",
                    "load",
                    "init",
                    "clear"
                ].includes(event)) {
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
 * { "event": "search", "query": "websocket test", options: {} }, 
 * { "event": "create", "query": "new item", options: {} }
 *
 * @param {number} [port=3443]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 * @param {*} key
 * @param {*} cert
 */
function startWebsocketSecureServer(port = 3443, ip = "127.0.0.1", key, cert, middlewares = [], app = (req, res, next) => next()) {
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
    // Example Usage:
    // async function main() {
    //     const httpUrl = 'http://example.com';
    //     const httpsUrl = 'https://www.google.com';
    //     const wsUrl = 'ws://echo.websocket.events';
    //     const wssUrl = 'wss://echo.websocket.events';
    //     const certPath = './your_cert.pem';
    //     try {
    //         const httpResponse = await Http(httpUrl, 'Test HTTP message');
    //         console.log('HTTP Response:', httpResponse);
    // 
    //         const httpsResponse = await Https(httpsUrl, certPath, 'Test HTTPS message');
    //         console.log('HTTPS Response:', httpsResponse);
    // 
    //         const wsResponse = await Ws(wsUrl);
    //         console.log('WS Response:', wsResponse);
    // 
    //         const wssResponse = await Wss(wssUrl, certPath);
    //         console.log('WSS Response:', wssResponse);
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    //     }
    //     main();
    // 

    /**
     *
     *
     * @param {*} serverPath
     * @param {*} message
     * @param {*} options
     * @return {*} 
     */
    function Http(serverPath, message, options) {
        const parsedUrl = url.parse(serverPath);
        if (parsedUrl.protocol !== 'http:') return Promise.reject(new Error('Invalid protocol: http'));

        return new Promise((resolve, reject) => {

            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.path,
                method: 'POST',
                ...options
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (message) {
                req.write(message);
            }

            req.end();
        });

    }

    /**
     *
     *
     * @param {*} serverPath
     * @param {*} cert
     * @param {*} message
     * @param {*} options
     * @return {*} 
     */
    function Https(serverPath, cert, message, options) {
        const parsedUrl = url.parse(serverPath);
        if (parsedUrl.protocol !== 'https:') return Promise.reject(new Error('Invalid protocol: https'));

        return new Promise((resolve, reject) => {
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.path,
                method: 'POST',
                ca: fs.readFileSync(cert),
                ...options
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (message) {
                req.write(message);
            }

            req.end();
        });

    }


    /**
     *
     *
     * @param {*} serverPath
     * @param {*} message
     * @param {*} options
     * @return {*} 
     */
    function Ws(serverPath, message, options) {
        const parsedUrl = url.parse(serverPath);
        if (parsedUrl.protocol !== 'ws:') return Promise.reject(new Error('Invalid protocol: ws'));

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(url.format(parsedUrl));

            ws.on('open', () => {
                ws.send(message);
            });

            ws.on('message', (msg) => {
                // process message and respond
                resolve(processWs(msg));
                // ws.close();
                // resolve(msg);
            });

            ws.on('close', () => {
                resolve('WebSocket Closed');
            });

            ws.on('error', (error) => {
                reject(error);
            });
        });

    }


    /**
     *
     *
     * @param {*} serverPath
     * @param {*} certKey
     * @param {*} message
     * @param {*} options
     * @return {*} 
     */
    function Wss(serverPath, certKey, message, options) {
        const parsedUrl = url.parse(serverPath);
        if (parsedUrl.protocol !== 'wss:') return Promise.reject(new Error('Invalid protocol: wss'));

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(url.format(parsedUrl), {
                ca: fs.readFileSync(certKey),
            });

            ws.on('open', () => {
                ws.send(message);
            });

            ws.on('message', (msg) => {
                // process message and respond
                resolve(processWss(msg));
                // ws.close();
                // resolve(msg);
            });

            ws.on('close', () => {
                resolve('WebSocket Secured Closed');
            });

            ws.on('error', (error) => {
                reject(error);
            });
        });
    }

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
 * @param {*} ipURL
 * @param {*} options
 * @param {string} [type="http"]
 * @return {*} 
 */
function ClientAPI(ipURL, options, type = "http") {
    // // options
    // { port, headers : { username, password, token, ca, etc } }

    const httpAPI = Clients().Http;
    // httpAPI(hURL, message)
    // // message = { event, query, options }
    // // message = { event, query = { key, value }, options }
    // // message = { event, query, options, type }
    // // message = { event, query, options, type, filename } // dumpToFile, dumpKeysToFile

    const httpsAPI = Clients().Https;
    // httpsAPI(hURL, message)
    // // message = { event, query, options }
    // // message = { event, query = { key, value }, options }
    // // message = { event, query, options, type }
    // // message = { event, query, options, type, filename } // dumpToFile, dumpKeysToFile

    const wsAPI = Clients().Ws;
    // wsAPI(hURL, message)
    // // message = { event, query, options }
    // // message = { event, query = { key, value }, options }
    // // message = { event, query, options, type }
    // // message = { event, query, options, type, filename } // dumpToFile, dumpKeysToFile

    const wssAPI = Clients().Wss;
    // wssAPI(hURL, message)
    // // message = { event, query, options }
    // // message = { event, query = { key, value }, options }
    // // message = { event, query, options, type }
    // // message = { event, query, options, type, filename } // dumpToFile, dumpKeysToFile

    var request = (type === "wss") ? wssAPI : (type === "ws") ? wsAPI : (type === "https") ? httpsAPI : httpAPI;

    return {
        hasKey: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        getKey: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        setKey: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        updateKey: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        delKey: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        read: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        dump: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        dumpToFile: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        dumpKeys: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        dumpKeysToFile: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        init: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        clear: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        load: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        search: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        searchValue: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        searchKey: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        },
        searchKeyValue: (msg, opts) => {
            return request(ipURL, msg, { ...options, ...opts })
        }
    }

}


/**
 *
 *
 * @param {*} port
 * @param {*} ip
 * @param {*} certkey
 * @param {*} username
 * @param {*} password
 */
function Shell(port, ip, certkey, username, password) {

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
    const dumpsToFile = (filename) => `Dumped to: ${filename}`;

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
        dumpToFile: dumpsToFile
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
 */
function TShell(port, ip, filename) {

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
    const dumpsToFile = (filename) => `Dumped to: ${filename}`;

    var d = fs.readFileSync(path.parse(filename), { encoding: "utf-8", flag: "rw" });
    load(d);

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
        dumpToFile: dumpsToFile
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

        if (flags === '-f') {
            if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
            } else {
                console.log('Filename must be within quotes for -f flag.');
                return new Error("Filename must be within quotes for -f flag.")
            }
        } else {
            console.log('dump requires -f flag with filename');
            return new Error("dump requires -f flag with filename")
        }

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
function startServer(type = "all", port = 3443, ip = "127.0.0.1", middlewares = [], app = (req, res, next) => next(), key, cert) {
    if (type === "ws") return startWebsocketServer(port, ip, middlewares, app);
    if (type === "wss") return startWebsocketSecureServer(port, ip, middlewares, app, key, cert);
    if (type === "https") return startHttpsServer(port, ip, middlewares, app, key, cert);
    if (type === "http") return startHttpServer(port, ip, middlewares, app);
    if (type === "all") {
        if (!key || !cert) {
            return {
                ws: startWebsocketServer(port, ip, middlewares, app),
                http: startHttpServer(port, ip, middlewares, app, key, cert)
            }
        } else {
            return {
                ws: startWebsocketServer(port, ip, middlewares, app),
                http: startHttpServer(port, ip, middlewares, app, key, cert),
                wss: startWebsocketSecureServer(port, ip, middlewares, app, key, cert),
                https: startHttpsServer(port, ip, middlewares, app, key, cert)
            }
        }
    };
}


/**
 *
 *
 * @param {*} key
 * @param {number} [port=3443]
 * @param {string} [ip="127.0.0.1"]
 */
function RShell(key, port, ip) {

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
    const dumpsToFile = (filename) => `Dumped to: ${filename}`;

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
        dumpToFile: dumpsToFile
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
    Shell,
    RShell,
    TShell
}

