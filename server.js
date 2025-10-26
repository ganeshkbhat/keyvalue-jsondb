const express = require('express');
const JsonManager = require("json-faster").JsonManager;

function startServer(port, hostname, key = null, cert = null, username = null, password = null, apps = (req, res, next) => next(), middlewares = []) {
    const datetime = Date.now();
    const app = express();

    const PORT = port || 7000;
    const HOSTNAME = hostname || "localhost";

    if (!!apps) app.use(apps);
    if (!!middlewares.length) apps.use(middlewares);

    // Attach the singleton JSON manager to the Express app instance as app.jsnmgr.
    app.jsnmgr = JsonManager();
    // Set server datatime
    app.datetime = datetime

    // Middleware to parse incoming JSON payloads
    app.use(express.json());

    // --- 3. Routes ---

    /**
     * GET route for debugging: shows the current state of the JSON store.
     */
    app.get('/store', (req, res) => {
        
        res.status(200).json({
            status: 'ok',
            store_state: app.jsnmgr.dump(),
            message: 'Current state of the singleton JSON manager.'
        });
    });

    /**
     * POST route to handle all JSON manager querys (set, get, hasKey, update).
     * Request Body Schema: { query: string, key: string, value?: any }
     */
    app.post('/store', (req, res) => {
        const { query, key, value } = req.body;

        if (req.method !== "POST") {
            return res.status(400).json({ error: 'Wrong method used' }); 
        }
        if (!query || !key) {
            return res.status(400).json({ error: 'Missing required fields: query and key.' });
        }

        try {
            let result;

            switch (query.toLowerCase()) {
                case 'set':
                    // Usage: app.jsnmgr.set(key, value)
                    if (value === undefined) {
                        return res.status(400).json({ error: 'Value is required for the "set" query.' });
                    }
                    result = app.jsnmgr.write(key, value);
                    return res.status(200).json({
                        message: `Key '${key}' set successfully with ${value} value`,
                        data: result
                    });

                case 'get':
                    // Usage: app.jsnmgr.get(key)
                    const retrievedValue = app.jsnmgr.read(key);
                    return res.status(200).json({
                        message: retrievedValue !== undefined ? `Value for key '${key}' retrieved.` : `Key '${key}' not found.`,
                        key: key,
                        value: retrievedValue
                    });

                case 'has_key':
                    // Usage: app.jsnmgr.hasKey(key)
                    const exists = app.jsnmgr.hasKey(key);
                    return res.status(200).json({
                        message: `Key '${key}' ${exists ? 'exists' : 'does not exist'}.`,
                        key: key,
                        exists: exists
                    });

                case 'dump':
                    // Usage: app.jsnmgr.dump()
                    return res.status(200).json({
                        message: app.jsnmgr.dump()
                    });

                case 'dumpKey':
                // Usage: app.jsnmgr.hasKey(key)
                    return res.status(200).json({
                        message: app.jsnmgr.dumpKey(key)
                    });

                case 'update':
                    // Usage: app.jsnmgr.update(key, updaterFn)
                    // We'll demonstrate a common use case: incrementing a numerical value.
                    if (typeof value !== 'number') {
                        return res.status(400).json({ error: 'For "update" demo, value must be a number (the amount to increment/decrement).' });
                    }

                    // Internal use of updaterFn: takes the current value, adds the incoming 'value' (delta)
                    result = app.jsnmgr.update(key, (currentValue) => {
                        // Ensure the current value is treated as a number, defaulting to 0 if null/undefined.
                        const initial = typeof currentValue === 'number' ? currentValue : 0;
                        return initial + value;
                    });

                    if (result.success) {
                        return res.status(200).json({
                            message: `Key '${key}' updated successfully (incremented by ${value}).`,
                            data: {
                                old_value: result.oldValue,
                                new_value: result.newValue
                            }
                        });
                    } else {
                        return res.status(404).json({ error: result.message });
                    }
                case 'dump':
                // Usage: app.jsnmgr.dump(key, updaterFn)
                case 'dumpKey':
                // Usage: app.jsnmgr.dumpKey(key, updaterFn)
                default:
                    return res.status(400).json({ error: `Invalid query: ${query}. Valid querys are: set, get, has_key, update.` });
            }
        } catch (error) {
            console.error('JSON Manager query failed:', error.message);
            return res.status(500).json({ error: 'An unexpected server error occurred during the query.' });
        }
    });

    app.all("*", (req, res) => {

    })
    
    // --- 4. Server Start ---

    app.listen(PORT, HOSTNAME, () => {
        console.log(`JSON Manager App running on http://localhost:${PORT}`);
        console.log(`Test with: curl -X POST http://localhost:${PORT}/store -H "Content-Type: application/json" -d '{"query": "set", "key": "counter", "value": 10}'`);
    });

    return app

}

// http(s)_ws(s)
// startServer(7000, "localhost")
if (require.main === module) {
    startServer( port = 7000, hostname = "localhost" );
}
module.exports = startServer
