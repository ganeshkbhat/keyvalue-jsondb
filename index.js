const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const readline = require('readline');
const JsonManager = require("json-faster").JsonManager;
const express = require('express');
const path = require("path");

// -----------------------------------------------------------
// Express Server for Command-Based Single Endpoint API
// -----------------------------------------------------------

// has to run if shell has to run. 
// ** seperate this from server shell
//   + server shell 
//   + client shell 
// 
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
    app.datetime = datetime
    // if (!!apps || apps !== undefined) app.use(apps);
    if (!!middlewares.length) app.use(middlewares);

    
    // Attach the singleton JSON manager 
    // Keys and values are stored here.
    app.dataStore = new JsonManager();

    /**
     * GET route for debugging: shows the current state of the JSON store.
     */
    app.get('/', (req, res) => {
        // console.log(app.mgr.dump())
        res.status(200).json({
            status: 'ok',
            // store_state: app.mgr.dump(),
            message: 'Current state of the singleton JSON manager.',
            data: app.dataStore.dump()
        });
    });


    // 2. HTTP and WebSocket Server Setup
    // Create the standard HTTP server using the Express app
    const server = http.createServer(app);
    let wss = new WebSocket.Server({ server });
    
    app.all("*", (req, res) => { })

    // 3. WebSocket Connection Handler
    // This route manages all operations based on req.body.event and req.body.data {key, value, other
    wss.on('connection', (ws) => {
        console.log('Client connected via WebSocket.');

        // Event listener for incoming messages (commands)
        ws.on('message', (message) => {
            let reqBody;
            try {
                // WebSocket messages are buffers, convert to string, then parse JSON
                reqBody = JSON.parse(message.toString(), "utf8");
                console.log('Received JSON command:', reqBody);
            } catch (e) {
                // Handle invalid JSON sent by the client
                const errorResponse = { success: false, error: 'Invalid JSON format in WebSocket message.' };
                ws.send(JSON.stringify(errorResponse));
                return;
            }

            // Destructure event and data from the received body
            const { event, data } = reqBody;
            let response; // The response object to be sent back

            // Check for essential request body components
            if (!event) {
                response = {
                    success: false,
                    error: "Missing 'event' field in the message.",
                    expected_events: ["set", "get", "search"]
                };
                return ws.send(JSON.stringify(response));
            }

            // Determine the action based on the 'event' field
            try {
                switch (event.toLowerCase()) {
                    case 'set':
                        // Required data: key and value
                        const { key, value } = data || {};
                        if (!key || value === undefined) {
                            response = { success: false, error: "For 'set' event, 'data.key' and 'data.value' are required." };
                        } else {
                            app.dataStore.set(key, value);
                            response = {
                                success: true,
                                message: `Key '${key}' set successfully.`,
                                current_value: value
                            };
                        }
                        break;

                    case 'get':
                        // Required data: key
                        const getKey = data?.key;
                        if (!getKey) {
                            response = { success: false, error: "For 'get' event, 'data.key' is required." };
                        } else {
                            const getValue = app.dataStore.get(getKey);
                            if (getValue !== undefined) {
                                response = {
                                    success: true,
                                    key: getKey,
                                    value: getValue
                                };
                            } else {
                                response = {
                                    success: false,
                                    message: `Key '${getKey}' not found.`
                                };
                            }
                        }
                        break;

                    case 'search':
                        // Required data: key (used here as a search term for simplicity)
                        const searchTerm = data?.key;
                        if (!searchTerm) {
                            response = { success: false, error: "For 'search' event, 'data.key' (search term) is required." };
                        } else {
                            // Simulate a simple search: find all keys/values containing the search term
                            const results = [];
                            for (const [k, v] of app.dataStore.entries()) {
                                // Convert both key and value to string for loose search
                                if (String(k).includes(searchTerm) || String(v).includes(searchTerm)) {
                                    results.push({ key: k, value: v });
                                }
                            }

                            response = {
                                success: true,
                                message: `Found ${results.length} results matching '${searchTerm}'.`,
                                results: results
                            };
                        }
                        break;

                    default:
                        // Handle unsupported events
                        response = {
                            success: false,
                            error: `Unsupported event type: '${event}'.`,
                            expected_events: ["set", "get", "search"]
                        };
                }
            } catch (error) {
                console.error("Error processing event:", error);
                response = { success: false, error: "An unexpected server error occurred during event processing." };
            }

            // Send the response back to the client as a JSON string
            ws.send(JSON.stringify(response));
        });

        ws.on('close', () => {
            console.log('Client disconnected.');
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });


    // 4. HTTP Connection Handler
    // This route manages all operations based on req.body.event and req.body.data {key, value, other}
    app.post('/', (req, res) => {
        // Destructure event and data from the request body
        const { event, data } = req.body;
        const events = ["set", "get", "search", "searchkey", "searchvalue", "searchkeyvalue", "haskey", "getkey"]
        // Check for essential request body components
        if (!event || !events.includes(event)) {
            return res.status(400).json({
                error: "Missing 'event' field in the request body.",
                expected_events: events
            });
        }

        // Determine the action based on the 'event' field
        console.log(`Received event: ${event}`);

        try {
            switch (event.toLowerCase()) {
                case 'set':
                    // Required data: key and value
                    const { key, value } = data || {};
                    if (!key || value === undefined) {
                        return res.status(400).json({ error: "For 'set' event, 'data.key' and 'data.value' are required." });
                    }

                    app.dataStore.set(key, value);
                    return res.status(200).json({
                        success: true,
                        message: `Key '${key}' set successfully.`,
                        current_value: value
                    });

                case 'get':
                    // Required data: key
                    const getKey = data?.key;
                    if (!getKey) {
                        return res.status(400).json({ error: "For 'get' event, 'data.key' is required." });
                    }

                    const getValue = app.dataStore.get(getKey);
                    if (getValue !== undefined) {
                        return res.status(200).json({
                            success: true,
                            key: getKey,
                            value: getValue
                        });
                    } else {
                        return res.status(404).json({
                            success: false,
                            message: `Key '${getKey}' not found.`
                        });
                    }

                case 'search':
                    // Required data: key (used here as a search term for simplicity)
                    const searchTerm = data?.key;
                    if (!searchTerm) {
                        return res.status(400).json({ error: "For 'search' event, 'data.key' (search term) is required." });
                    }

                    // Simulate a simple search: find all keys containing the search term
                    const results = [];
                    for (const [k, v] of app.dataStore.entries()) {
                        if (String(k).includes(searchTerm) || String(v).includes(searchTerm)) {
                            results.push({ key: k, value: v });
                        }
                    }

                    return res.status(200).json({
                        success: true,
                        message: `Found ${results.length} results matching '${searchTerm}'.`,
                        results: results
                    });

                default:
                    // Handle unsupported events
                    return res.status(400).json({
                        error: `Unsupported event type: '${event}'.`,
                        expected_events: ["set", "get", "search"]
                    });
            }
        } catch (error) {
            console.error("Error processing request:", error);
            return res.status(500).json({ error: "An unexpected server error occurred." });
        }
    });

    // 4. Server Start
    app.listen(PORT, HOSTNAME, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Use POST requests to the root path '/' with a JSON body.`);
        console.log(`Example body to set a value: {"event": "set", "data": {"key": "user_id", "value": 1234}}`);
    });

    // To run this server:
    // 1. Make sure you have Node.js installed.
    // 2. Run 'npm install express' in your terminal.
    // 3. Save the code as 'server.js'.
    // 4. Run 'node server.js'.
    // 5. Test with a tool like cURL or Postman.
    // -----------------------------------------------------------
    return app
}



startServer()
