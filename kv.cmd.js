
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const readline = require('readline');
const express = require('express');
const path = require("path");



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

    const search = function (query = { key: '', value: '' }) {
        console.log(`Search key results for: ${query}`)
    };
    const searchKey = function (query = { key: '' }) {
        console.log(`Search key results for: ${query.key}`)
    };
    const searchValue = function (query = { value: '' }) {
        console.log(`Search value results for: ${query.value}`)
    };
    const searchKeyValue = function (query = { key: '', value: '' }) {
        console.log(`Search key results for: ${query}`)
    };
    const hasKey = function (query = { key: '' }) {
        console.log(`Has key: ${query.key}`)
    };
    const getKey = function (query = { key: '' }) {
        console.log(`Get key: ${query} - `, manager.get(key))
    };
    const init = function (query) {
        console.log(`Initialized with: ${JSON.stringify(query.data)}`)
    };
    const clear = function () {
        console.log('Cleared')
    };
    const load = function (query = { data: "" }) {
        console.log(`Loaded: ${JSON.stringify(query.data)}`)
    }
    const read = function (query = { key: "" }) {
        console.log(ClientAPI().search({ event: 'read', query }))
    }
    const create = function (query = { key: '', value: '' }) {
        console.log(`Created: ${query.key} = ${query.value}`)
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

        if (commandName === 'set' && valueParts.length >= 2) {
            const key = valueParts[0];
            const val = valueParts.slice(1).join(' ');
            console.log(`${key} - ${val}`);
            commandMap.set(key, val);
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
            console.log(`${value}`);
        } else if (commandName === 'get') {
            value = valueParts.join(' ');
            console.log(`${value}`);
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


