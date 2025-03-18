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

const startHttpServer = require('../index').startHttpServer; // Replace with the path to your implementation

var srv = startHttpServer(3000, "127.0.0.1", [], (rq, rs, n) => n());
// var srv = startHttpServer();


// # Example 1: POST request with JSON body (HTTP)
// curl -X POST -H "Content-Type: application/json" -d '{"query": "nodejs search"}' http://localhost:3000/

// # Example 2: POST request with query parameter (HTTP)
// curl -X POST http://localhost:3000/?query=expressjs

// # Example 3: POST request with JSON body (HTTPS)
// curl -X POST -k -H "Content-Type: application/json" -d '{"query": "https request"}' https://localhost:3443/

// # Example 4: POST request with query parameter (HTTPS)
// curl -X POST -k https://localhost:3443/?query=secure%20connection

// # Example 5: Health check (HTTP)
// curl http://localhost:3000/health

// # Example 6: Health check (HTTPS)
// curl -k https://localhost:3443/health

// # Example 7: Invalid path (HTTP)
// curl http://localhost:3000/invalidpath

// # Example 8: Invalid path (HTTPS)
// curl -k https://localhost:3443/invalidpath

// # Example 9: Method Not Allowed (HTTP - GET to /)
// curl http://localhost:3000/

// # Example 10: Method Not Allowed (HTTPS - GET to /)
// curl -k https://localhost:3443/

// # Example 11: Invalid JSON body (HTTP)
// curl -X POST -H "Content-Type: application/json" -d 'invalid json' http://localhost:3000/

// # Example 12: Invalid JSON body (HTTPS)
// curl -X POST -k -H "Content-Type: application/json" -d 'invalid json' https://localhost:3443/

// # Example 13: No Query Parameter or Body (HTTP)
// curl -X POST http://localhost:3000/

// # Example 14: No Query Parameter or Body (HTTPS)
// curl -X POST -k https://localhost:3443/
