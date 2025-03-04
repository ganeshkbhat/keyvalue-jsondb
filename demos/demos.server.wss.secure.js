

const startWebsocketSecureServer = require('../index').startWebsocketSecureServer; // Replace with the path to your implementation
const key;
const cert;
var srv = startWebsocketSecureServer(key, cert, 3000);
