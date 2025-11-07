const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const readline = require('readline');
const JsonManager = require("json-faster").JsonManager;
const express = require('express');
const path = require("path");

// options = { username, password, key, cert, middlewares: [], apps: null }
function startServer(port, hostname = "localhost", options = {}, apps = [], middlewares = [], loadObject = {}) {
    const app = express();
    const datetime = Date.now();
    const PORT = port || 7000;
    const HOSTNAME = hostname || "localhost";

    // Use express.json() to parse incoming JSON bodies
    app.use(express.json());

    // Set server start datatime 
    app.datetime = datetime;

    // if (!!apps || apps !== undefined) app.use(apps);
    if (!!middlewares.length) app.use(middlewares);


    // Instantiate the manager for 'Item' entities
    app.dataManager = new JsonManager();
    app.dataManager.init(loadObject);

    function ensureNumeric(value) {
        // Attempt to convert the value to a number. 
        // This works on both number strings and existing number types.
        const numberValue = Number(value);

        // Check if the result is NOT 'Not-a-Number'.
        if (!isNaN(numberValue)) {
            // Successfully converted or was already a number
            return numberValue;
        }

        // If it's NaN, the original value was not a convertible number string
        return value;
    }

    /**
     * GET route for debugging: shows the current state of the JSON store.
     */
    app.get('/', (req, res) => {
        // console.log(app.mgr.dump())
        res.status(200).json({
            status: 'ok',
            // store_state: app.mgr.dump(),
            message: 'Current state of the JSON manager.',
            data: "hello"
        });
    });

    app.get('/hello', (req, res) => {
        // console.log(app.mgr.dump())
        res.status(200).json({
            status: 'ok',
            serverStartDateTime: app.datetime,
            requestDateTime: Date.now(),
            // store_state: app.mgr.dump(),
            message: 'Current state of the singleton JSON manager.',
            data: {} // app.dataManager.dump()
        });
    });

    // 4. HTTP Connection Handler
    // This route manages all operations based on req.body.event and req.body.data {key, value, other}

    app.post('/', (req, res) => {
        // Expected payload format: { event: 'action', key?: string, value?: object }
        // Renamed 'id' to 'key' for clarity in this handler
        const { event, data } = req.body;
        // needed created same named values to create or update
        var allItems, foundItem, createdItem, updatedItem, deleted

        if (!event) {
            return res.status(400).json({ status: 'error', message: 'Missing required field: event (e.g., "set", "get", "dump", "update", "remove")' });
        }

        try {
            switch (event.toLowerCase()) {
                case 'set':
                    // CREATE: Uses 'set' as the event name
                    // minor codebase to test http protocol for kvjson [to be extended to ws and wss]
                    // 
                    // event name is "set"
                    // data values are key, value 
                    // data = { "key": "setkey", "value": "setvalue" }
                    // 
                    // {"event": "set", "data": {"key": "23v", "value": "12334fmc"}}
                    // {"event": "set", "data": {"key": "2", "value": "123fmc"}}
                    // {"event": "set", "data": {"key": 12, "value": 123}}
                    try {
                        if (!data.key || !data.value) {
                            return res.status(400).json({ status: 'error', event: event, message: 'Missing required fields: "key" (string) and "value" (object) for "set" event.' });
                        }
                        
                        // data.key = ensureNumeric(data.key)
                        // data.value = ensureNumeric(data.value)
                        
                        app.dataManager.write(data.key, data.value)
                        // console.log(5, data.key, data.value)
                        console.log(6, app.dataManager.get(data.key))
                        // console.log(7, app.dataManager.read(data.key) )
                        
                        // if (!!app.dataManager.get(data.key)) {
                        //     return res.status(409).json({ status: 'error', event: event, message: `Key "${data.key}" already exists. Use "update" to modify.` });
                        // }
                        // console.log(4, data.key, data.value, app.dataManager.get(data.key) )
                        // console.log(8, app.dataManager.read(data.key) )
                        return res.status(201).json({ status: 'success', event: event, data: { [data.key]: app.dataManager.read(data.key) } });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event, data: { key: data.key, error: e } });
                    }
                case 'create':
                    // // CREATE: Uses 'create' as the event name
                    // // minor codebase to test http protocol for kvjson [to be extended to ws and wss]
                    // // 
                    // // event name is "set"
                    // // data values are key, value pairs in as an array
                    // // {"event": "create", "data": [{"key": 12, "value": "test"}, {"key": "12sdf", "value": "test"}]}
                    // // {"event": "create", "data": [{ "key": "100", "value": "testing" }, { "key": "10minimum0", "value": "testing" } ]}

                    try {
                        let result = {}
                        if (Array.isArray(data) && data.length) {
                            for (let i = 0; i < data.length; i++) {
                                data[i].key = ensureNumeric(data[i].key)
                                data[i].value = ensureNumeric(data[i].value)
                                app.dataManager.write(data[i].key, data[i].value)
                                result[data[i].key] = data[i].value
                            }
                        }
                        return res.status(201).json({ status: 'success', event: event, data: result });
                    } catch (e) {
                        return res.status(400).json({ status: 'error', event: event, message: 'Missing required fields: "key" (string) and "value" (object) for "set" event.' });
                    }

                case 'get':
                    // read: Uses 'read' or 'get' or getkey as the event name
                    // READ ONE: Uses 'get' as the event name
                    // minor codebase to test http protocol for kvjson [to be extended to ws and wss]
                    // 
                    // event name is "get"
                    // data value is key
                    // "data": {"key": "test"}
                    // 
                    // // read or get keys
                    // {"event": "get", "data": {  }}
                    // {"event": "get", "data": { "key": "setkey", "key2": "setvaluetwo" }} 
                    // {"event": "get", "data": { "key": "setkey" }}
                    // {"event": "get", "data": {"key": 12 }}
                    // {"event": "get", "data": ["setkey", "setvaluetwo"]}
                    if (!data.key) {
                        return res.status(400).json({ status: 'error', event: event, message: 'Missing "key" field for "get" event.' });
                    }
                    foundItem = app.dataManager.getKey(data.key, { createKey: false });
                    if (!foundItem) {
                        return res.status(404).json({ status: 'error', event: event, message: `Item with key "${data.key}" not found.` });
                    }
                    let dataKey = ensureNumeric(data.key)
                    return res.status(200).json({ status: 'success', event: event, data: { [dataKey]: app.dataManager.getKey(data.key) } });
                    // return res.status(200).json({ status: 'success', event: event, data: { [dataKey]: app.dataManager.getKey(ensureNumeric(foundItem)) } });
                case 'read':
                    // read: Uses 'read' or 'get' or getkey as the event name
                    // READ ONE: Uses 'get' as the event name
                    // minor codebase to test http protocol for kvjson [to be extended to ws and wss]
                    // 
                    // event name is "read"
                    // data key-values is key
                    // "data": {"key": "test"}
                    // 
                    // // read or get keys
                    // {"event": "read", "data": {"key": "test"}} 
                    // {"event": "read", "data": {"key": "2"}}
                    // {"event": "read", "data": {"key": 12}}
                    if (!data.key) {
                        return res.status(400).json({ status: 'error', event: event, message: 'Missing "key" field for "get" event.' });
                    }
                    foundItem = app.dataManager.read(data.key, { createKey: false });
                    // if (foundItem) {
                    //     return res.status(404).json({ status: 'error', event: event, message: `Item with key "${data.key}" not found.` });
                    // }
                    return res.status(200).json({ status: 'success', event: event, data: { [data.key] : foundItem } });
                // case 'init':
                //     // // CREATE: Uses 'init' as the event name
                //     // // minor codebase to test http protocol for kvjson [to be extended to ws and wss]
                //     // // 
                //     // // event name is "init"
                case 'update':
                    // UPDATE: Uses 'update' as the event name
                    // // read or get keys
                    // 
                    // event name is "update"
                    // data key-values is key and value is value
                    // "data": {"key": "test", value: "value to update for test"}
                    // 
                    // {"event": "update", "data": {"test": "testing"}}
                    // {"event": "update", "data": {"2": 23}}
                    // {"event": "update", "data": {12: "testing23", "test": "testing", 34:testing}}
                    // data now will be {"oldkeys":"new value", 12: "testing23", "test": "testing", 34:testing}}
                    try {
                        let obj = data
                        let resobj = app.dataManager.dump()
                        let r = { ...resobj, ...obj }
                        app.dataManager.update(r);
                        return res.status(201).json({ status: 'success', event: event, data: r });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event, data: e });
                    }
                case 'dump':
                    // LIST ALL: Uses 'dump' as the event name
                    // 
                    // // event name is "update"
                    // {"event": "dump", "data": {}}
                    // {"event": "dump"}
                    try {
                        let allItems = app.dataManager.dump();
                        return res.status(200).json({ status: 'success', event: event, data: allItems, count: allItems.length });
                    }
                    catch (e) {
                        return res.status(400).json({ status: 'error', event: event, message: 'Missing "key" or wrong data field for "dump" event.' });
                    }
                case 'dumpkeys':
                    // LIST ALL: Uses 'dump' as the event name to return key requested
                    // {"event": "dump", "data": {}}
                    // {"event": "dump", "data": {key: "test"}}
                    let allItems
                    try {
                        if (!!Array.isArray(data.keys) && !!data.keys) {
                            console.log(1, data)
                            // map to respond all keys in the requested data send back in an object data. date: {key: value, key2: value2}
                            allItems = app.dataManager.dumpkeys(data.keys, { like: true, regex: false }, "search");
                        }
                        return res.status(200).json({ status: 'success', event: event, data: allItems, count: allItems.length });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event, data: null });
                    }
                case 'search':
                    // LIST ALL: 
                    console.log(1, data)
                    try {
                        // searches key and value
                        let allItems = app.dataManager.search({
                            data: [...data],
                            event: "search"
                        });
                        return res.status(200).json({ status: 'success', event: event, data: allItems, count: allItems.length });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event, data: null, count: allItems.length });
                    }
                case 'searchvalue':
                    // LIST ALL: 
                    try {
                        let allItems = app.dataManager.searchvalue({
                            data: [...data],
                            event: "search"
                        });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event, data: null, count: allItems.length });
                    }
                case 'searchkeyvalue':
                    // LIST ALL: 
                    try {
                        let allItems = app.dataManager.searchvalue({
                            data: [...data],
                            event: "search"
                        });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event, data: null, count: allItems.length });
                    }
                // DELETE: Uses 'remove' as the event name
                case 'delete':
                    if (!key) {
                        return res.status(400).json({ status: 'error', message: 'Missing "key" field for "remove" event.' });
                    }
                    deleted = app.dataManager.delete(key);
                    if (!deleted) {
                        return res.status(404).json({ status: 'error', message: `Item with key "${key}" not found for deletion.` });
                    }
                case 'remove':
                    if (!key) {
                        return res.status(400).json({ status: 'error', message: 'Missing "key" field for "remove" event.' });
                    }
                    deleted = app.dataManager.delete(key);
                    if (!deleted) {
                        return res.status(404).json({ status: 'error', message: `Item with key "${key}" not found for deletion.` });
                    }
                    return res.status(200).json({ status: 'success', event: 'remove', message: `Item with key "${key}" successfully removed.` });
                default:
                    return res.status(400).json({ status: 'error', message: `Unknown event type: ${event}` });
            }
        } catch (error) {
            console.error(`Error processing event ${event}:`, error);
            return res.status(500).json({ status: 'error', message: 'Internal server error', details: error.message });
        }
    });


    function gracefulShutdown(signal) {

        // exit, beforeExit, uncaughtException, unhandledRejection
        // SIGINT, SIGTERM, SIGHUP, SIGKILL
        // https://gemini.google.com/share/89826dd9c5f1

        console.log(`\nReceived signal: ${signal}. Starting graceful shutdown...`);

        // **1. Stop accepting new requests (e.g., close HTTP server)**
        // Server.close() is a common asynchronous cleanup operation.
        if (app.server) { // Assuming your server is in a global/accessible variable
            app.server.close(() => {
                console.log('HTTP server closed.');
                // **2. Perform other cleanup**
                process.exit(0);
            });
        } else {
            // If no server or pending async tasks, just exit
            process.exit(0);
        }
    }

    // 📌 Handle explicit exit signals (e.g., Ctrl+C, kill command)
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    process.on('uncaughtException', (err) => {
        console.error('Caught unhandled exception:', err);
        // Perform cleanup or graceful shutdown
        // app.dataManager.dump
        process.exit(1);
    });

    process.on('SIGINT', () => {
        console.log('Received SIGINT. Shutting down gracefully...');
        // Perform cleanup
        // app.dataManager.dump
        process.exit(0);
    });

    // 4. Server Start
    app.server = app.listen(PORT, HOSTNAME, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Use POST requests to the root path '/' with a JSON body.`);
    });

    return app
}

startServer()
