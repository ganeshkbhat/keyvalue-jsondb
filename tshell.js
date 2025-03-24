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

const Shell = require('./index').TShell;

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

const flags = args.filter((part) => part.startsWith('-')).join('');
let valueParts = args.slice(1).filter((part) => !part.startsWith('-'));
let filename;

if (flags === '-f') {
    if (valueParts.length === 1) {
        filename = valueParts[0]
    } else {
        console.log("valueParts: error: ", valueParts)
        console.log('Filename must be within quotes for -f flag.');
        return new Error("Filename must be within quotes for -f flag.")
    }
} else {
    console.log('dump requires -f flag with filename');
    return new Error("dump requires -f flag with filename")
}

// Add Shell Authentication here

console.log("port: number ::", Number(args[0]), ", ip: string/text ::", args[1], filename);
var srv = TShell(filename);

