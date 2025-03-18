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

const startWebsocketServer = require('../index').startWebsocketServer; // Replace with the path to your implementation

var srv = startWebsocketServer(3000);
// var srv = startWebsocketServer();
