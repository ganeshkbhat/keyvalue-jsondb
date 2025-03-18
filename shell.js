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

// arguments after the script name
const args = process.argv.slice(2);

// Add Shell Authentication here

var port, ip;

if (!args[0]) {
    console.log("Port is required, using port 3443");
    port = 3443
} else {
    port = Number(args[0])
}

if (!args[1]) {
    console.log("IP Online is required, using port 3443");
    ip = "127.0.0.1";
} else {
    ip = args[1];
}

console.log("port: number ::", Number(args[0]), ", ip: string/text ::", args[1]);
var srv = Shell(Number(args[0]), args[1]);

