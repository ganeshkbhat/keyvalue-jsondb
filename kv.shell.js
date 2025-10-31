
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const readline = require('readline');
const express = require('express');
const path = require("path");
const JsonManager = require("json-faster").JsonManager;
const manager = new JsonManager()


// -----------------------------------------------------------
// Shell Commands Single Endpoint API
// -----------------------------------------------------------

// has to run if shell has to run. 
// ** seperate this from server shell
//   + server shell 
//   + client shell 
// 
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
 * @returns {Promise<string>} A Promise that resolves with the response body as a string.
 */
function makePostRequest(host, port, path, payload) {
    // Stringify the payload to send it as JSON
    const postData = JSON.stringify(payload);

    // Define the request options
    const options = {
        hostname: host,
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
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

        // Write data to request body
        req.write(postData);
        req.end();
    });
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

    // has to run if shell has to run. 
    // ** seperate this from server shell
    //   + server shell 
    //   + client shell 

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


    const search = function (key = '', value = '') {
        console.log(`Search key results for: ${query}`)
    };
    const searchKey = function (key = '') {
        console.log(`Search key results for: ${key}`)
    };
    const searchValue = function (value = '') {
        console.log(`Search value results for: ${value}`)
    };
    const searchKeyValue = function (key = '', value = '') {
        console.log(`Search key results for: ${key} , ${value}`)
    };

    const hasKey = function (key = '') {
        console.log(`Has key: ${key}`)
    };

    const getKey = async function (key = '') {
        // set a http command for get feature for JSON.manager
        // console.log(`Get key: ${query} - `, manager.get(key))
        console.log(key) //, manager.search({ event: 'read', }))
        return await makePostRequest(ip, port, path = "/", payload = { event: 'read', data: {k : key }})
    };

    const init = function (jsonValues = {}) {
        // set a http command for get feature for JSON.manager
        
        console.log(`Initialized with: ${JSON.stringify(query.data)}`)
        makePostRequest(ip, port, path = "/", payload = { event: 'init', data: jsonValues})
    };
    const clear = function () {
        console.log('Cleared')
    };
    const load = function (jsonValues = {}) {
        console.log(`Loaded: ${JSON.stringify(query.data)}`)
    }
    const read = function (key = "") {
        console.log(key, data.search({ event: 'read', }))
    }
    const create = function (key = '', value = '') {
        console.log(`Created: ${key} = ${value}`)
    };
    const update = function (query = { data: "" }) {
        console.log(`Updated with: ${JSON.stringify(query.data)}`)
    };
    const deleteItem = function (query = { key: "" }) {
        console.log(`Deleted: ${query.key}`)
    };
    const dump = function (query = { filename: "" }) {
        console.log(`Dumped to: ${query.filename}`)
    };
    const dumpsToFile = function (query = { filename: "" }) {
        console.log(`Dumped to: ${query.filename}`)
    };

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

        console.log(value, valueParts)

        if (commandName === 'set' && valueParts.length >= 2) {
            const key = valueParts[0];
            const val = valueParts.slice(1).join(' ');
            console.log("value", `${key} - ${val}`);
            commandMap.set(key, val)
            return recursivePrompt();
        }

        if (commandName === 'load') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = { filename: valueParts[0].slice(1, -1) }; // Remove quotes
                    console.log(`running  command map 1 ${JSON.stringify(value)} ${value.filename}`);
                } else {
                    console.log('Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                try {
                    value = JSON.parse(valueParts.join(' '));
                    // console.log(`${value}`);
                } catch (e) {
                    console.log('Invalid JSON for', commandName);
                    return recursivePrompt();
                }
            }
        } else if (commandName === 'init') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = { filename: valueParts[0].slice(1, -1) }; // Remove quotes
                    console.log(`${value}`);
                } else {
                    console.log('Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                try {
                    value = JSON.parse(valueParts.join(' '));
                    console.log(`${value}`);
                } catch (e) {
                    console.log('Invalid JSON for', commandName);
                    return recursivePrompt();
                }
            }
        } else if (commandName === 'update') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = { filename: valueParts[0].slice(1, -1) }; // Remove quotes
                    console.log(`${value}`);
                } else {
                    console.log('Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                try {
                    value = JSON.parse(valueParts.join(' '));
                    console.log(`${value}`);
                } catch (e) {
                    console.log('Invalid JSON for', commandName);
                    return recursivePrompt();
                }
            }
        } else if (commandName === 'load' || commandName === 'init' || commandName === 'update') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = { filename: valueParts[0].slice(1, -1) }; // Remove quotes
                    console.log(`${value}`);
                } else {
                    console.log('Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                try {
                    value = JSON.parse(valueParts.join(' '));
                    console.log(`${value}`);
                } catch (e) {
                    console.log('Invalid JSON for', commandName);
                    return recursivePrompt();
                }
            }
        } else if (commandName === 'dump') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = valueParts[0].slice(1, -1);
                    console.log(`${value}`);
                } else {
                    console.log('Error: Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                console.log('dump requires -f flag with filename');
                return recursivePrompt();
            }
        } else if (commandName === 'dumpKey') {
            if (flags === '-f') {
                if (valueParts.length === 1 && valueParts[0].startsWith('"') && valueParts[0].endsWith('"')) {
                    value = valueParts[0].slice(1, -1);
                    console.log(`${value}`);
                } else {
                    console.log('Error: Filename must be within quotes for -f flag.');
                    return recursivePrompt();
                }
            } else {
                console.log('dump requires -f flag with filename');
                return recursivePrompt();
            }
        } else if (commandName === 'read') {
            value = valueParts.join(' ');
            console.log(`${value}`);
        } else if (commandName === 'has') {
            value = valueParts.join(' ');
            console.log(`has ${value}`);
        } else if (commandName === 'get') {
            value = valueParts.join(' ');
            let s = getKey(value)
            console.log(`${value} - ${s}`);
        } else if (commandName === 'del') {
            value = valueParts.join(' ');
            console.log(`${value}`);
            // } else if (commandName === 'read' || commandName === 'has' || commandName === 'get' || commandName === 'del') {
            //     value = valueParts.join(' ');
            //     console.log(`${value}`);
        } else if (commandName === 'search') {
            value = valueParts.join(' ');
            console.log(`${value}`);
        } else if (commandName === 'clear') {
            //no arguments required
            console.log(`${value}`);
        } else if (commandName === 'init') {
            //no arguments required
            console.log(`${value}`);
        } else if (commandName === 'clear' || commandName === 'init') {
            //no arguments required
            console.log(`${value}`);
        } else {
            value = valueParts.join(' ');
            console.log(`${value}`);
        }

        if (commandMap[commandName]) {
            let commandFunction = commandMap[commandName];
            if (typeof commandFunction === 'object' && flags) {
                commandFunction = commandFunction[flags];
            } else if (typeof commandFunction === 'object' && !flags) {
                commandFunction = commandFunction[''];
            }

            if (commandFunction) {
                console.log(commandFunction(value), commandFunction);
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

Shell()

module.exports = Shell


