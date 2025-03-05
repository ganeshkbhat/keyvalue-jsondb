

const startHttpsServer = require('../index').startHttpsServer; // Replace with the path to your implementation
const key;
const cert;
var srv = startHttpsServer(key, cert, 3000);


// openssl genpkey -algorithm RSA -out private.key
// openssl req -new -key private.key -out certificate.csr
// openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.crt
