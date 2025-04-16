/**
 * 
 * Package: 
 * Author: Ganesh B
 * Description: 
 * Install: npm i kvjsondb --save
 * Github: https://github.com/ganeshkbhat/
 * npmjs Link: https://www.npmjs.com/package/kvjsondb
 * File: index.js
 * File Description: 
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const startServer = require('./index').startServer;

// // USAGE
// node server.js type port ip key cert
// node server.js -t type -p port -ip ip -k key -c cert


const prefixDefinitions = [
    { prefix: "-t", handler: () => console.log },
    { prefix: "-p", handler: () => console.log },
    { prefix: "-ip", handler: () => console.log },
    { prefix: "-k", handler: () => console.log },
    { prefix: "-c", handler: () => console.log },
];

var results = shellflags(prefixDefinitions)
console.log(results);

console.log("type: number ::", results["-t"], "port: number ::", results["-p"], ", ip: string/text ::", results["-ip"], "certkey: string/text ::", results["-k"], "username: string/text ::", results["-c"]);

var middlewares = [];
var app = (req, res, next) => { next() };

if (!results || results["-t"] || results["-p"] || results["-ip"] || results["-k"] || results["-c"]) {
    results = {
        "-t": (process.argv.length > 2 && !!process.argv[2]) ? process.argv[2] : "http",
        "-p": (process.argv.length > 3 && !!process.argv[3]) ? process.argv[3] : 3443,
        "-ip": (process.argv.length > 4 && !!process.argv[4]) ? process.argv[4] : "127.0.0.1",
        "-k": (process.argv.length > 5 && !!process.argv[5]) ? process.argv[5] : null,
        "-c": (process.argv.length > 6 && !!process.argv[6]) ? process.argv[6] : null
    }
}

var type = results["-t"] || "http";
var port = results["-p"] || 3443;
var ip = results["-ip"] || "127.0.0.1";
var key = results["-k"] || null;
var cert = results["-c"] || null;

var srv = startServer(type, port, ip, middlewares, app, key, cert);
console.log("Running server at: ", `${type}, ${port}, ${ip}`)

