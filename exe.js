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
 * // USAGE 
 *  
 *  node db.js type port ip key cert
 *  node db.js -s mode -t type -p port -ip ip -k key -c cert
 *  node db.js -s mode -t type -p port -ip ip -u username -pwd password
 *  
 *  // defaults -s shell -t http -p 3443 -ip "127.0.0.1" -k null -c null - u null -pwd null 
 *
 *
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

var srv

if (!!mode && mode === "db") {
    srv = startDB(type, port, ip, middlewares, app, key, cert);
    console.log("Running server at: ", `${type}, ${port}, ${ip}`)
} else {
    if (!!username && !!password) {
        srv = Shell(port, ip, null, username, password);
    } else if (!!cert) {
        cert = "";
        srv = Shell(port, ip, cert, null, null);
    } else {
        console.log("Certificate not provided. Running shell in insecure mode");
        srv = Shell(port, ip, null, null, null);
    }
}
