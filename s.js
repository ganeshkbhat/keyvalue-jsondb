const http = require('http');

/**
 * Makes an HTTP POST request to a specified host and port.
 *
 * NOTE: This function uses the 'http' module. If you need HTTPS,
 * simply change `const http = require('http');` to
 * `const http = require('https');` and adjust the default port if necessary.
 *
 * @param {string} host The hostname (e.g., 'jsonplaceholder.typicode.com').
 * @param {number} port The port number (e.g., 80 for HTTP, 443 for HTTPS).
 * @param {string} path The endpoint path (e.g., '/posts').
 * @param {object} payload The JavaScript object to send as the request body.
 * @param {object} [requestOptions={}] Optional. Additional options for http.request (e.g., timeout, agent, custom headers).
 * @returns {Promise<string>} A Promise that resolves with the response body as a string.
 */
function makePostRequest(host, port, path, payload, requestOptions = {}) {
    // Stringify the payload to send it as JSON
    const postData = JSON.stringify(payload);

    // Define the request options.
    // We spread the custom options first, then use the mandatory function arguments
    // and calculated values (Content-Type/Length) to ensure correctness.
    const options = {
        ...requestOptions, // Custom options (e.g., timeout, agent) are added first
        hostname: host,
        port: port,
        path: path,
        method: 'POST', // Enforce POST method
        headers: {
            ...requestOptions.headers, // Merge user-provided headers (allows custom headers)
            'Content-Type': 'application/json', // Override/ensure correct content type
            'Content-Length': Buffer.byteLength(postData) // Override/ensure correct content length
        }
    };

    return new Promise((resolve, reject) => {
        // Create the request
        const req = http.request(options, (res) => {
            let data = '';

            // Set the encoding of the response
            res.setEncoding('utf8');

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                // Check for successful HTTP status codes (2xx)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                } else {
                    reject(new Error(`Request failed with status code ${res.statusCode}: ${data}`));
                }
            });
        });

        // Handle errors during the request (e.g., DNS lookup failure, connection refused)
        req.on('error', (e) => {
            reject(new Error(`Problem with request: ${e.message}`));
        });
        
        // Handle timeout if set in options
        if (options.timeout) {
            req.setTimeout(options.timeout, () => {
                req.destroy(new Error(`Request timeout after ${options.timeout}ms`));
            });
        }

        // Write data to request body
        req.write(postData);
        req.end();
    });
}

// --- Example Usage ---
async function runExample() {
    const host = 'jsonplaceholder.typicode.com'; // A public API for testing

    console.log(`Attempting POST request to https://${host}:${port}/posts...`);

    const testPayload = {
        title: 'foo',
        body: 'bar baz',
        userId: 1,
    };
    
    // --- New: Custom options for the request ---
    const customOptions = {
        timeout: 5000, // Example: Set a 5 second timeout
        headers: {
            'X-Custom-Auth': 'Bearer 12345' // Example: Add a custom header
        }
    };

    try {
        // Updated call signature to include customOptions
        console.log(`\nSending request with timeout of ${customOptions.timeout}ms and custom header...`);
        
        // We use port 80 as per the 'http' require, but note the warning below.
        const response = await makePostRequest(host, 80, '/posts', testPayload, customOptions);
        
        console.log('\n--- Request Successful ---');
        console.log('Sent Data:', testPayload);
        console.log('Received Response:', response);
        
        // The jsonplaceholder service returns the posted data plus an ID
        const parsedResponse = JSON.parse(response);
        console.log('New Resource ID:', parsedResponse.id);

    } catch (error) {
        console.error('\n--- Request Failed ---');
        // If running this in a real Node environment against jsonplaceholder,
        // it will fail with an error like 'socket hang up' because it requires HTTPS.
        console.error(error.message);
        console.log("\n*Note: If you see a failure related to status code or hanging up, try changing `require('http')` to `require('https')` and `port` to 443, as many services require SSL.*");
    }
}

// runExample(); // Uncomment this line to run the example function

module.exports = {
    makePostRequest
};

// If you run this file directly via `node post_request.js`, the example will execute.
if (require.main === module) {
    runExample();
}