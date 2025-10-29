const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const readline = require('readline');
const express = require('express');
const path = require("path");

function httpDB() {
    const app = express();
    const datetime = Date.now();
    const PORT = port || 7000;
    const HOSTNAME = hostname || "localhost";

    if (!!apps) app.use(apps);
    if (!!middlewares.length) apps.use(middlewares);

    // Attach the singleton JSON manager to the Express app instance as app.mgr.
    app.mgr = new JsonManager();
    // Set server datatime
    app.datetime = datetime

    // Middleware to parse incoming JSON payloads
    app.use(express.json());

    // --- 3. Routes ---

    /**
     * GET route for debugging: shows the current state of the JSON store.
     */
    app.get('/', (req, res) => {
        // console.log(app.mgr.dump())
        res.status(200).json({
            status: 'ok',
            // store_state: app.mgr.dump(),
            message: 'Current state of the singleton JSON manager.',
            data: app.mgr.dump()
        });
    });


    /**
     * POST route to handle all JSON manager querys (set, get, hasKey, update).
     * Request Body Schema: { event : string, query: string, key: string, value?: any }
     *      {"key": "test", "value": 10, "event": "set" }
     */
    app.post('/', (req, res) => {
        const { event, query, key, value } = req.body;
        console.log({ event, query, key, value })
        if (req.method !== "POST") {
            return res.status(400).json({ error: 'Wrong method used' });
        }
        if (!query || !key || !event) {
            return res.status(400).json({ error: 'Missing required fields: event , query , and key.' });
        }
        switcher(req, res, app)
    });

    if (results["-s"] === "db") {
        app.listen(PORT, HOSTNAME, () => {
            console.log(`JSON Manager App running on http://${HOSTNAME}:${PORT}`);
            console.log(`Test with: curl -X POST http://${HOSTNAME}:${PORT}/ -H "Content-Type: application/json" -d '{"query": "set", "key": "counter", "value": 10}'`);
        });
    }

}
