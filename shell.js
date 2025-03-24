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

const Shell = require('./index').Shell;
const shellflags = require("shellflags");

// const RShell = require('./index').Shell;
// var srv = RShell(port, ip, certkey)
// var srv = RShell(port, ip, "username", "password")

// 
// const port = 3443, ip = "127.0.0.1";
// process.argv is an array containing the command-line arguments
// process.argv[0] is the Node.js executable path
// process.argv[1] is the script file path
// 
// Example usage
// node my_script.js arg1 arg2 arg3
// output
// Script Path: my_script.js
// Arguments: [ 'arg1', 'arg2', 'arg3' ]
//

// // arguments after the script name
const args = process.argv.slice(2);

// // Add Shell Authentication here

var port, ip, certkey, username, password;

// if (!args[0]) {
//     console.log("Port is required, using port 3443");
//     port = 3443;
// } else {
//     port = Number(args[0])
// }

// if (!args[1]) {
//     console.log("IP Online is required, using port 3443");
//     ip = "127.0.0.1";
// } else {
//     ip = args[1];
// }


// if (!!args[2] && !!args[3]) {
//     console.log("");
//     user = args[2];
//     pass = args[3];
// }

// if (!!args[2] && !args[3]) {
//     certkey = args[2];
// }

const prefixDefinitions = [
    { prefix: "-p", handler: () => console.log },
    { prefix: "-s", handler: () => console.log },
    { prefix: "-ip", handler: () => console.log },
    { prefix: "-c", handler: () => console.log },
    { prefix: "-u", handler: () => console.log },
    { prefix: "-pwd", handler: () => console.log }
];

var results = shellflags(prefixDefinitions)
console.log(results);

console.log("port: number ::", Number(args[0]), ", ip: string/text ::", args[1],  "certkey: string/text ::", args[2], "username: string/text ::", args[3], "password: string/text ::", args[4]);
console.log("port: number ::", results["-p"], ", ip: string/text ::", results["-ip"],  "certkey: string/text ::", results["-c"], "username: string/text ::", results["-u"], "password: string/text ::", results["-pwd"]);

port = results["-p"] || 3443
ip = results["-ip"] || "127.0.0.1"
certkey = results["-c"]
username = results["-u"]
password = results["-pwd"]

console.log("port: number ::", port, ", ip: string/text ::", ip,  "certkey: string/text ::", certkey, "username: string/text ::", username, "password: string/text ::", password);

var srv;

if (!!username && !!password) {
    srv = Shell(port, ip, null, username, password);
} else if (!!certkey) {
    console.log("Certificate not provided. Running shell in insecure mode");
    certkey = "";
    srv = Shell(port, ip, certkey, null, null);
}
