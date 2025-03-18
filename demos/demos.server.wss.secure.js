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

const startWebsocketSecureServer = require('../index').startWebsocketSecureServer; // Replace with the path to your implementation
const key;
const cert;

var srv = startWebsocketSecureServer(3000, "127.0.0.1", [], (rq, rs, n) => n(), key, cert);

