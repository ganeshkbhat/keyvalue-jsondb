

const startWebsocketSecureServer = require('../index').startWebsocketSecureServer; // Replace with the path to your implementation
const key;
const cert;

var srv = startWebsocketSecureServer(3000, "127.0.0.1", [], (rq, rs, n) => n(), key, cert);

