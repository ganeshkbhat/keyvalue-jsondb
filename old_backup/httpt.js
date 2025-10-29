const http = require("http");
const url = require("url");
const express = require("express");
/**
 *
 *
 * @param {*} serverPath
 * @param {*} message
 * @param {*} options
 * @return {*} 
 */
function Http(serverPath, message, options) {
    console.log(url.parse(serverPath), serverPath, message)
    const parsedUrl = url.parse(serverPath);
    if (parsedUrl.protocol !== 'http:') return Promise.reject(new Error('Invalid protocol: http'));

    return new Promise((resolve, reject) => {

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.path,
            method: 'POST',
            ...options
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (message) {
            req.write(message);
        }

        req.end();
    });

}


/**
 *
 * HTTP Server
 * 
 * { "event": "search", "query": "websocket test", options: {} }, 
 * { "event": "create", "query": "new item", options: {} }
 * 
 * @param {number} [port=3000]
 * @param {string} [ip="127.0.0.1"]
 * @param {*} [middlewares=[]]
 * @param {*} [app=(req, res, next) => next()]
 * @return {*} 
 */
function startHttpServer(port = 3000, ip = "127.0.0.1", middlewares = [], app = (req, res, next) => next()) {
    const datetime = Date.now();
    const apps = express();
    if (!!app) apps.use(app);
    if (!!middlewares.length) apps.use(middlewares);

    apps.all('/', (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const uriPath = parsedUrl.pathname;
        const queryParams = parsedUrl.query;
        if (uriPath === '/') {
            if (req.method === 'POST') {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    const searchResult = run(body, queryParams);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(searchResult));
                });
            } else if (req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(`{"health": "alive", "since": ${datetime} }`);
            } else {
                res.writeHead(405, { 'Content-Type': 'text/plain' });
                res.end('Method Not Allowed');
            }
        } else if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(`{"health": "alive", "since": ${datetime} }`);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    const httpServer = http.createServer(apps);
    return httpServer.listen(port, ip, () => {
        console.log('HTTP Server listening on port 3000');
    });

}

function Ws(serverPath, message, options) {
    const parsedUrl = url.parse(serverPath);
    if (parsedUrl.protocol !== 'ws:') return Promise.reject(new Error('Invalid protocol: ws'));

    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url.format(parsedUrl));

        ws.on('open', () => {
            ws.send(message);
        });

        ws.on('message', (msg) => {
            // process message and respond
            // resolve(processWs(msg));
            ws.send(processWs(msg))
            // ws.close();
            // resolve(msg);
        });

        ws.on('close', () => {
            resolve('WebSocket Closed');
        });

        ws.on('error', (error) => {
            // reject(error);
            ws.send({ error: "closing connect" })
            // ws.close();
        });
    });

}


startHttpServer(9000, "localhost", [])

