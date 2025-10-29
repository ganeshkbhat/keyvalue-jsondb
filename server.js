const https = require("https");
const http = require("http");
const WebSocket = require('ws');
const fs = require("fs");

const express = require('express');
const JsonManager = require("json-faster").JsonManager;

// const startServer = require('./index').startServer;
const Shell = require('./index').Shell;
const shellflags = require("shellflags");
const path = require("path");

const prefixDefinitions = [
    // -t: type : http, https, ws, wss
    { prefix: "-t", handler: () => console.log },
    // -p : port : 3443, 8080, 80, 443
    { prefix: "-p", handler: (v) => Number(v) },
    // -ip : ip : ip address, url, domain name
    { prefix: "-ip", handler: () => console.log },
    // -k : key : certificate key
    { prefix: "-k", handler: () => console.log },
    // -c : cert : certificate
    { prefix: "-c", handler: () => console.log },
    // -m : mode : db, shell
    { prefix: "-m", handler: () => console.log },
    // -u : username : username for authentication
    { prefix: "-u", handler: () => console.log },
    // -pwd : password : password for authentication
    { prefix: "-pwd", handler: () => console.log },
    // -s : mode : mode of operation : shell, db
    { prefix: "-s", handler: () => console.log },
    // // -j : json config file : password for authentication
    // { prefix: "-j", handler: () => console.log }
];

var results = shellflags(prefixDefinitions)
// type, port, ip/url, key, certificate, server, mode
var middlewares = [];
var app = (req, res, next) => { next() };

var type = results["-t"] = results["-t"] || "http";
var port = results["-p"] = Number(results["-p"]) || 3443;
var ip = results["-ip"] = results["-ip"] || "127.0.0.1";
var key = results["-k"] = results["-k"] || null;
var cert = results["-c"] = results["-c"] || null;
var username = results["-u"] = results["-u"] || null;
var password = results["-pwd"] = results["-pwd"] || null;
var mode = results["-s"] = results["-s"] || "shell";

console.log("results of shell command : ", JSON.stringify(results));

// if all are not defined then parse json file or json object
if (!!results["-j"]) {
    try {
        results = { ...results, ...JSON.parse(JSON.stringify(require(results["-j"]))) }
    } catch (e) {
        results = { ...results, ...JSON.parse(JSON.stringify(require(path.join(process.cwd(), results["-j"])))) }
    }
}


function startDB(port, hostname, key = null, cert = null, username = null, password = null, apps = (req, res, next) => next(), middlewares = [], protocol = "wss") {

    const app = express();
    const datetime = Date.now();
    const PORT = port || 7000;
    const HOSTNAME = hostname || "localhost";

    if (!!apps) app.use(apps);
    if (!!middlewares.length) apps.use(middlewares);

    // Attach the singleton JSON manager to the Express app instance as app.jsnmgr.
    app.jsnmgr = new JsonManager();
    // Set server datatime
    app.datetime = datetime

    // Middleware to parse incoming JSON payloads
    app.use(express.json());

    // --- 3. Routes ---

    /**
     * GET route for debugging: shows the current state of the JSON store.
     */
    app.get('/', (req, res) => {
        app.jsnmgr.write("test", 10)
        console.log(app.jsnmgr.dump())
        res.status(200).json({
            status: 'ok',
            // store_state: app.jsnmgr.dump(),
            message: 'Current state of the singleton JSON manager.'
        });
    });



    /**
     * POST route to handle all JSON manager querys (set, get, hasKey, update).
     * Request Body Schema: { event : string, query: string, key: string, value?: any }
     *      {"key": "test", "value": 10, "event": "set", "query": "test" }
     */
    app.post('/', (req, res) => {
        const { event, query, key, value } = req.body;

        if (req.method !== "POST") {
            return res.status(400).json({ error: 'Wrong method used' });
        }
        if (!query || !key || !event) {
            return res.status(400).json({ error: 'Missing required fields: event , query , and key.' });
        }

        try {
            let result;

            switch (event.toLowerCase()) {
                case 'set':
                    try {
                        // Usage: app.jsnmgr.set(key, value)
                        if (key === undefined || key === null || value === null || value === undefined) {
                            return res.status(400).json({ error: 'Value is required for the "set" query.' });
                        }
                        result = app.jsnmgr.write(key, value);
                        return res.status(200).json({
                            message: `Key '${key}' set successfully with ${value} value: ${JSON.stringify(result)}`,
                            data: {
                                key: key,
                                value: value
                            }
                        });

                    } catch (e) {
                        return res.status(400).json({ error: e });
                    }

                case 'get':
                    try {
                        if (key === undefined || key === null) {
                            return res.status(400).json({ error: 'Key is required for the "get" or read query.' });
                        }
                        // Usage: app.jsnmgr.get(key)
                        const retrievedGetValue = app.jsnmgr.read(key);
                        return res.status(200).json({
                            message: (retrievedGetValue !== undefined || retrievedGetValue !== null) ? `Value for key '${key}' retrieved.` : `Key '${key}' not found.`,
                            data: {
                                key: key,
                                value: retrievedGetValue
                            }
                        });
                    } catch (e) {
                        return res.status(400).json({ error: e });
                    }


                case 'read':
                    try {
                        if (key === undefined || key === null) {
                            return res.status(400).json({ error: 'Key is required for the "get or read" query.' });
                        }
                        // Usage: app.jsnmgr.get(key)
                        const retrievedReadValue = app.jsnmgr.read(key);
                        return res.status(200).json({
                            message: (retrievedReadValue !== undefined || retrievedReadValue !== null) ? `Value for key '${key}' retrieved.` : `Key '${key}' not found.`,
                            data: {
                                key: key,
                                value: retrievedReadValue
                            }
                        });
                    } catch (e) {
                        return res.status(400).json({ error: e });
                    }
                // case 'update':
                //     // // Usage: app.jsnmgr.update(key, updaterFn)
                //     // // We'll demonstrate a common use case: incrementing a numerical value.
                //     // if (typeof value !== 'number') {
                //     //     return res.status(400).json({ error: 'For "update" demo, value must be a number (the amount to increment/decrement).' });
                //     // }

                //     // // Internal use of updaterFn: takes the current value, adds the incoming 'value' (delta)
                //     // result = app.jsnmgr.update(key, (currentValue) => {
                //     //     // Ensure the current value is treated as a number, defaulting to 0 if null/undefined.
                //     //     const initial = typeof currentValue === 'number' ? currentValue : 0;
                //     //     return initial + value;
                //     // });

                //     // if (result.success) {
                //     //     return res.status(200).json({
                //     //         message: `Key '${key}' updated successfully (incremented by ${value}).`,
                //     //         data: {
                //     //             old_value: result.oldValue,
                //     //             new_value: result.newValue
                //     //         }
                //     //     });
                //     // } else {
                //     //     return res.status(404).json({ error: result.message });
                //     // }
                //     const result = app.jsnmgr.update(data)
                //     return res.status(200).json({
                //         message: `dump attached`,
                //         data: { dumpKey: result }
                //     });
                case 'haskey':
                    if (key === undefined || key === null) {
                        return res.status(400).json({ error: 'Key is required for the "haskey" query.' });
                    }
                    // Usage: app.jsnmgr.hasKey(key)
                    let exist = app.jsnmgr.hasKey(key);
                    return res.status(200).json({
                        message: `Key '${key}' ${exist ? 'exist' : 'does not exist'}.`,
                        data: {
                            key: key,
                            exists: exist
                        }
                    });
                case 'getkey':
                    if (key === undefined || key === null) {
                        return res.status(400).json({ error: 'Key is required for the "haskey" query.' });
                    }
                    // Usage: app.jsnmgr.hasKey(key)
                    let exists = app.jsnmgr.hasKey(key);
                    let val = app.jsnmgr.get(key);
                    return res.status(200).json({
                        message: `Key '${key}' ${exists ? 'exists' : 'does not exist'}.`,
                        data: {
                            key: key,
                            value: val,
                            exists: exists
                        }
                    });
                case 'dump':
                    // Usage: app.jsnmgr.dump()
                    return res.status(200).json({
                        message: `dump attached`,
                        data: { dump: app.jsnmgr.dump() }
                    });

                case 'dumpkey':
                    if (key === undefined || key === null) {
                        return res.status(400).json({ error: 'Key is required for the "dumpkey" query.' });
                    }
                    // Usage: app.jsnmgr.hasKey(key)
                    return res.status(200).json({
                        message: `dump attached with results`,
                        data: { dumpKey: app.jsnmgr.dumpKey(key) }
                    });
                // case 'dumpToFile':
                // // Usage: app.jsnmgr.dump(key, updaterFn)

                // case 'dumpKeysToFile':
                // // Usage: app.jsnmgr.dumpKey(key, updaterFn)

                default:
                    return res.status(400).json({
                        error: `Invalid query: ${query}. Valid querys are: "haskey", "getkey", "search",
                        "searchvalue", "searchkeyvalue", "read", "create", "update", "del",
                        "dump", "dumpkeys", "dumptofile", "dumpkeystofile", "load", "init", "clear"` });
            }

        }
        catch (error) {
            console.error('JSON Manager query failed:', error.message);
            return res.status(500).json({ error: 'An unexpected server error occurred during the query.' });
        }

    });

    // app.all("*", (req, res) => { })

    // if (!!app && !!protocol === "wss") {
    //     const wssSecure = new WebSocket.Server({ server: app });
    //     wssSecure.on('connection', (ws, req) => {

    //         const queryParams = url.parse(req.url, true).query;
    //         ws.on('message', (message) => {
    //             try {
    //                 const { event, data, key, value } = JSON.parse(message);
    //                 if ([
    //                     "hasKey",
    //                     "getKey",
    //                     "search",
    //                     "searchValue",
    //                     "searchKeyValue",
    //                     "read",
    //                     "create",
    //                     "update",
    //                     "del",
    //                     "dump",
    //                     "dumpKeys",
    //                     "dumpToFile",
    //                     "dumpKeysToFile",
    //                     "load",
    //                     "init",
    //                     "clear"
    //                 ].includes(event)) {
    //                     if (event === 'search') {
    //                         const result = run(JSON.stringify(data), queryParams);
    //                         ws.send(JSON.stringify({ event: 'searchResult', data: result }));
    //                     } else {
    //                         // Handle create, update, delete events
    //                         console.log(`Received ${event} event (secure) with data:`, data, queryParams);
    //                         ws.send(JSON.stringify({ event: `${event}Result`, data: { status: 'OK', received: data } }));
    //                     }
    //                 } else {
    //                     ws.send(JSON.stringify({ error: 'Invalid event name' }));
    //                 }
    //             } catch (error) {
    //                 ws.send(JSON.stringify({ error: 'Invalid JSON message' }));
    //             }
    //         });

    //     });

    // }

    app.listen(PORT, HOSTNAME, () => {
        console.log(`JSON Manager App running on http://${HOSTNAME}:${PORT}`);
        console.log(`Test with: curl -X POST http://${HOSTNAME}:${PORT}/ -H "Content-Type: application/json" -d '{"query": "set", "key": "counter", "value": 10}'`);
    });

    return app

}

var srv

if (!!mode && mode === "db") {
    srv = startDB(type, port, ip, middlewares, app, key, cert);
    console.log("Running server at: ", `${type}, ${port}, ${ip}`)
} else {
    if (!!username && !!password) {
        srv = Shell(port, ip, null, username, password);
    } else if (!!cert) {
        cert = "";
        srv = Shell(port, ip, cert, null, null);
    } else {
        console.log("Certificate not provided. Running shell in insecure mode");
        srv = Shell(port, ip, null, null, null);
    }
}


// http(s)_ws(s)
// startDB(7000, "localhost")
if (require.main === module) {
    startDB(port = 7000, hostname = "localhost");
}

module.exports = startDB
