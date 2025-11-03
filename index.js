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

    // 2. Middleware
    // Use express.json() to parse incoming JSON bodies
    app.use(express.json());
    
    // Set server datatime
    app.datetime = datetime;
    
    // if (!!apps || apps !== undefined) app.use(apps);
    if (!!middlewares.length) app.use(middlewares);

    // Middleware to parse JSON request bodies
    app.use(express.json());

    // Instantiate the manager for 'Item' entities
    app.dataManager = new JsonManager();
    app.dataManager.init(loadObject) 

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
            serverStartTime: app.datetime,
            requestTime: Date.now(),
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
        var allItems, foundItem, createdItem, updatedItem

        if (!event) {
            return res.status(400).json({ status: 'error', message: 'Missing required field: event (e.g., "set", "get", "dump", "update", "remove")' });
        }

        try {
            switch (event.toLowerCase()) {
                case 'set':
                    // CREATE: Uses 'set' as the event name
                    // minor codebase to test http protocol for kvjson [to be extended to ws and wss]
                    // 
                    try {
                        // console.log(1, data.key, data.value, app.dataManager.read(data.key))
                        if (!data.key || !data.value) {
                            return res.status(400).json({ status: 'error', message: 'Missing required fields: "key" (string) and "value" (object) for "set" event.' });
                        }
                        app.dataManager.write(data.key, data.value);
                        // console.log(2, data.key, data.value, app.dataManager.read(data.key))

                        createdItem = app.dataManager.write(data.key, data.value);
                        // console.log(3, data.key, data.value, createdItem, app.dataManager.read(data.key));

                        if (!app.dataManager.read(data.key)) {
                            return res.status(409).json({ status: 'error', message: `Key "${data.key}" already exists. Use "update" to modify.` });
                        }
                        // console.log(4, data.key, data.value, createdItem, app.dataManager.read(data.key))

                        return res.status(201).json({ status: 'success', event: 'set', data: { [data.key]: app.dataManager.read(data.key) } });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event, data: {key: data.key , error: e} });
                    }
                case 'get':
                    // READ ONE: Uses 'get' as the event name
                    // minor codebase to test http protocol for kvjson [to be extended to ws and wss]
                    if (!data.key) {
                        return res.status(400).json({ status: 'error', message: 'Missing "key" field for "get" event.' });
                    }
                    foundItem = app.dataManager.read(data.key);
                    if (foundItem == false) {
                        return res.status(404).json({ status: 'error', message: `Item with key "${data.key}" not found.` });
                    }
                    return res.status(200).json({ status: 'success', event: 'get', data: { "key": data.key, "value": foundItem } });
                case 'read':
                    // read: Uses 'read' or 'get' or getkey as the event name
                    try {
                        if (!data.key) {
                            return res.status(400).json({ status: 'error', message: 'Missing "key" field for "get" event.' });
                        }
                        // console.log(app.dataManager.dump());
                        allItems = app.dataManager.read(data.key);
                        return res.status(200).json({ status: 'success', event: 'dump', data: allItems, count: allItems.length });
                    }
                    catch (e) {
                        return res.status(404).json({ status: 'error', message: `Items or item with key "${data.key}" not found.` });
                    }
                
                case 'update':
                // UPDATE: Uses 'update' as the event name
                    try {
                        if (!data.key || !data.value) {
                            return res.status(400).json({ status: 'error', event: event || 'update', message: 'Missing required fields: "key" and "value" for "update" event.' });
                        }

                        const updateItem = app.dataManager.write(data.key, data.value);
                        if (!app.dataManager.read(data.key)) {
                            return res.status(409).json({ status: 'error', event: event || 'update', message: `Key "${data.key}" already exists. Use "update" to modify.` });
                        }
                        return res.status(201).json({ status: 'success', event: event || 'update', data: { [data.key]: app.dataManager.getKey(data.key) } });
                    } catch (e) {
                        return res.status(500).json({ status: 'failed', event: event || 'update', data: e });
                    }
                
                case 'dump':
                // LIST ALL: Uses 'dump' as the event name
                    try {
                        allItems = app.dataManager.dump();
                        return res.status(200).json({ status: 'success', event: 'dump', data: allItems, count: allItems.length });
                    }
                    catch (e) {
                        return res.status(400).json({ status: 'error', message: 'Missing "key" or wrong data field for "dump" event.' });
                    }
                case 'dumpkey':
                    // LIST ALL: Uses 'dump' as the event name to return key requested

                    if (!Array.isArray(data.keys) && !data.keys) {
                        // map to respond all keys in the requested data send back in an object data. date: {key: value, key2: value2}
                    } else if (!!data.keys, !!data.value) {}
                    allItems = app.dataManager.dumpkey(data.keys);
                    return res.status(200).json({ status: 'success', event: 'dump', data: allItems, count: allItems.length });

                // DELETE: Uses 'remove' as the event name
                case 'remove':
                    if (!key) {
                        return res.status(400).json({ status: 'error', message: 'Missing "key" field for "remove" event.' });
                    }
                    const deleted = app.dataManager.delete(key);
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
