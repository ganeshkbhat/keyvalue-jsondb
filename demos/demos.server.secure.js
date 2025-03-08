

const startHttpsServer = require('../index').startHttpsServer; // Replace with the path to your implementation
const key;
const cert;
var srv = startHttpsServer(3000, "127.0.0.1", [], (rq, rs, n) => n(), key, cert);


// openssl genpkey -algorithm RSA -out private.key
// openssl req -new -key private.key -out certificate.csr
// openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.crt
