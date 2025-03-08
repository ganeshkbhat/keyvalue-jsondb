/**
 * 
 * Package: 
 * Author: Ganesh B
 * Description: 
 * Install: npm i kvjsondb --save
 * Github: https://github.com/ganeshkbhat/
 * npmjs Link: https://www.npmjs.com/package/
 * File: index.js
 * File Description: 
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const startServer = require('./index').startServer;

var srv = startServer(!!process.args[2] ? process.args[2] : "http", !!process.args[3] ? process.args[3] : 3443, !!process.args[4] ? process.args[4] : "127.0.0.1", [], (req, res, next) => { next() }, !!process.args[5] ? process.args[5] : null, !!process.args[6] ? process.args[6] : null);

