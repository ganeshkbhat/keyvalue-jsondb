// -----------------------------------------------------------
// Express Server for Command-Based Single Endpoint API
// -----------------------------------------------------------

// 1. Setup and Imports
const express = require('express');
const app = express();
const PORT = 3000;

// Simple in-memory data store to simulate a database
// Keys and values are stored here.
const dataStore = new JSONManager();

// 2. Middleware
// Use express.json() to parse incoming JSON bodies
app.use(express.json());

// 3. Single POST Route Handler
// This route manages all operations based on req.body.event
app.post('/', (req, res) => {
    // Destructure event and data from the request body
    const { event, data } = req.body;

    // Check for essential request body components
    if (!event) {
        return res.status(400).json({
            error: "Missing 'event' field in the request body.",
            expected_events: ["set", "get", "search", "searchkey", "searchvalue", "searchkeyvalue", "haskey", "getkey"]
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

                dataStore.set(key, value);
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

                const getValue = dataStore.get(getKey);
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
                for (const [k, v] of dataStore.entries()) {
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
app.listen(PORT, () => {
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
