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

var type = (process.argv.length > 2 && !!process.argv[2]) ? process.argv[2] : "http"
var port = (process.argv.length > 3 && !!process.argv[3]) ? process.argv[3] : 3443
var ip = (process.argv.length > 4 && !!process.argv[4]) ? process.argv[4] : "127.0.0.1"
var middlewares = []
var app = (req, res, next) => { next() }
var key = (process.argv.length > 5 && !!process.argv[5]) ? process.argv[5] : null 
var cert = (process.argv.length > 6 && !!process.argv[6]) ? process.argv[6] : null

var srv = startServer(type, port, ip, middlewares, app, key, cert);

