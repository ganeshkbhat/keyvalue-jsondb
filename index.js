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
function startServer(port, hostname = "localhost", options = {}, apps = [], middlewares = []) {
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

    /**
         * GET route for debugging: shows the current state of the JSON store.
         */
    app.get('/', (req, res) => {
        // console.log(app.mgr.dump())
        res.status(200).json({
            status: 'ok',
            // store_state: app.mgr.dump(),
            message: 'Current state of the singleton JSON manager.',
            data: app.dataManager.dump()
        });
    });

    // 4. HTTP Connection Handler
    // This route manages all operations based on req.body.event and req.body.data {key, value, other}

    app.post('/', (req, res) => {
        // Expected payload format: { event: 'action', key?: string, value?: object }
        // Renamed 'id' to 'key' for clarity in this handler
        const { event, data } = req.body;

        if (!event) {
            return res.status(400).json({ status: 'error', message: 'Missing required field: event (e.g., "set", "get", "dump", "update", "remove")' });
        }

        try {
            switch (event.toLowerCase()) {

                // CREATE: Uses 'set' as the event name
                case 'set':
                    try {
                        console.log("data.key, data.value1", data.key, data.value)
                        if (!data.key || !data.value) {
                            return res.status(400).json({ status: 'error', message: 'Missing required fields: "key" (string) and "value" (object) for "set" event.' });
                        }
                        console.log("data.key, data.value2", data.key, data.value)
                        const createdItem = app.dataManager.write(data.key, data.value);
                        if (!app.dataManager.read(data.key)) {
                            return res.status(409).json({ status: 'error', message: `Key "${key}" already exists. Use "update" to modify.` });
                        }
                        console.log("data.key, data.value3", data.key, data.value)
                        return res.status(201).json({ status: 'success', event: 'set', result: createdItem });
                    } catch (e) {
                        console.log("data.key, data.value4", data.key, data.value)
                        console.log("event_set: error:", app.dataManager.getKey(data.key), JSON.stringify({ "event_set": e }))
                        return res.status(500).json({ status: 'failed', event: 'set', result: e });
                    }
                    
                // READ ONE: Uses 'get' as the event name
                case 'get':
                    if (!key) {
                        return res.status(400).json({ status: 'error', message: 'Missing "key" field for "get" event.' });
                    }
                    const foundItem = app.dataManager.read(key);
                    if (!foundItem) {
                        return res.status(404).json({ status: 'error', message: `Item with key "${key}" not found.` });
                    }
                    return res.status(200).json({ status: 'success', event: 'get', result: foundItem });

                // LIST ALL: Uses 'dump' as the event name
                case 'dump':
                    // app.dataManager.write("test_write", "testingvalue")
                    console.log(app.dataManager.dump())
                    const allItems = app.dataManager.dump();
                    return res.status(200).json({ status: 'success', event: 'dump', result: allItems, count: allItems.length });


                // UPDATE: Uses 'update' as the event name
                case 'update':
                    if (!key || !value) {
                        return res.status(400).json({ status: 'error', message: 'Missing required fields: "key" and "value" for "update" event.' });
                    }
                    const updatedItem = app.dataManager.update(key, value);
                    if (!updatedItem) {
                        return res.status(404).json({ status: 'error', message: `Item with key "${key}" not found for update.` });
                    }
                    return res.status(200).json({ status: 'success', event: 'update', result: updatedItem });

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


    // 4. Server Start
    app.server = app.listen(PORT, HOSTNAME, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Use POST requests to the root path '/' with a JSON body.`);
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
    return app
}



startServer()
