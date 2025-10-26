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

// // USAGE 
// 
// node db.js type port ip key cert
// node db.js -s mode -t type -p port -ip ip -k key -c cert
// node db.js -s mode -t type -p port -ip ip -u username -pwd password
// 
// // defaults -s shell -t http -p 3443 -ip "127.0.0.1" -k null -c null - u null -pwd null 
//

const startServer = require('./index').startServer;
const Shell = require('./index').Shell;
const shellflags = require("shellflags");
const path = require("path");

const prefixDefinitions = [
    // -t: type : http, https, ws, wss
    { prefix: "-t", handler: () => console.log },
    // -p : port : 3443, 8080, 80, 443
    { prefix: "-p", handler: (v) => Number(v) },
    // -ip : ip : ip address, url, domain name
    { prefix: "-ip", handler: () => console.log },
    // -k : key : certificate key
    { prefix: "-k", handler: () => console.log },
    // -c : cert : certificate
    { prefix: "-c", handler: () => console.log },
    // -m : mode : db, shell
    { prefix: "-m", handler: () => console.log },
    // -u : username : username for authentication
    { prefix: "-u", handler: () => console.log },
    // -pwd : password : password for authentication
    { prefix: "-pwd", handler: () => console.log },
    // -s : mode : mode of operation : shell, db
    { prefix: "-s", handler: () => console.log },
    // // -j : json config file : password for authentication
    // { prefix: "-j", handler: () => console.log }
];

var results = shellflags(prefixDefinitions)

console.log("type: number ::", results["-t"], "port: number ::", results["-p"], ", ip: string/text ::", results["-ip"], "certkey: string/text ::", results["-k"], "username: string/text ::", results["-c"], "mode: string/text ::", results["-s"]);

// type, port, ip/url, key, certificate, server, mode
var middlewares = [];
var app = (req, res, next) => { next() };

if (!results || !results["-t"] || !results["-p"] || !results["-ip"] || !results["-k"] || !results["-c"] || !results["-u"] || !results["-pwd"] || !results["-s"]) {
    results = {
        "-t": (results["-t"]) ? results["-t"] : (process.argv.length > 2 && !!process.argv[2]) ? process.argv[2] : "http",
        "-p": (results["-p"]) ? results["-p"] : (process.argv.length > 3 && !!process.argv[3]) ? process.argv[3] : 3443,
        "-ip": (results["-ip"]) ? results["-ip"] : (process.argv.length > 4 && !!process.argv[4]) ? process.argv[4] : "127.0.0.1",
        "-k": (results["-k"]) ? results["-k"] : (process.argv.length > 5 && !!process.argv[5]) ? process.argv[5] : null,
        "-c": (results["-c"]) ? results["-c"] : (process.argv.length > 6 && !!process.argv[6]) ? process.argv[6] : null,
        "-m": (results["-m"]) ? results["-m"] : "shell",
        "-u": (results["-u"]) ? results["-u"] : null,
        "-pwd": (results["-pwd"]) ? results["-pwd"] : null,
        "-s": (results["-s"]) ? results["-s"] : "shell"
    }
}

var type = results["-t"] || "http";
var port = Number(results["-p"]) || 3443;
var ip = results["-ip"] || "127.0.0.1";
var key = results["-k"] || null;
var cert = results["-c"] || null;
var username = results["-u"] || null;
var password = results["-pwd"] || null;
var mode = results["-s"] || "shell";

console.log("results of shell command : ", JSON.stringify(results));

// if all are not defined then parse json file or json object
if (!!results["-j"]) {
    try {
        results = { ...results, ...JSON.parse(JSON.stringify(require(results["-j"]))) }
    } catch (e) {
        results = { ...results, ...JSON.parse(JSON.stringify(require(path.join(process.cwd(), results["-j"])))) }
    }
}

if (!!mode && mode === "db") {
    var srv = startServer(type, port, ip, middlewares, app, key, cert);
    console.log("Running server at: ", `${type}, ${port}, ${ip}`)
} else {
    var srv;
    if (!!username && !!password) {
        srv = Shell(port, ip, null, username, password);
    } else if (!!cert) {
        cert = "";
        srv = Shell(port, ip, cert, null, null);
    } else {
        console.log("Certificate not provided. Running shell in insecure mode");
        srv = Shell(port, ip, null, null, null);
    }
}
