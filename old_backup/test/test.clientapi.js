// const assert = require('assert');
// const sinon = require('sinon');
// const { Http, Https, Ws, Wss } = require('../index').Clients();
// const http = require('http');
// const https = require('https');
// const WebSocket = require('ws');
// const fs = require('fs');
// const url = require('url');

// describe('CLIENT API Functions', () => {
//     let httpStub, httpsStub, wsStub, wssStub, fsStub;
//     const certPath = './test_cert.pem'; // Create a dummy cert for testing

//     before(() => {
//         fs.writeFileSync(certPath, 'test cert content');
//     });

//     after(() => {
//         fs.unlinkSync(certPath);
//     });

//     beforeEach(() => {
//         httpStub = sinon.stub(http, 'request');
//         httpsStub = sinon.stub(https, 'request');
//         wsStub = sinon.stub(WebSocket.prototype, 'send');
//         wssStub = sinon.stub(WebSocket.prototype, 'on');
//         fsStub = sinon.stub(fs, 'readFileSync').returns('test cert content');
//     });

//     afterEach(() => {
//         httpStub.restore();
//         httpsStub.restore();
//         wsStub.restore();
//         wssStub.restore();
//         fsStub.restore();
//     });

//     describe('Http', () => {
//         it('should reject with an error for invalid protocol', async () => {
//             await assert.rejects(Http('https://example.com', 'test message'), /Invalid protocol: http/);
//         });
//     });

//     describe('Https', () => {
//         it('should reject with an error for invalid protocol', async () => {
//             await assert.rejects(Https('http://example.com', certPath, 'test message'), /Invalid protocol: https/);
//         });
//     });

//     describe('Ws', () => {
//         it('should reject with an error for invalid protocol', async () => {
//             await assert.rejects(Ws('wss://example.com'), /Invalid protocol: ws/);
//         });
//     });

//     describe('Wss', () => {
//         it('should reject with an error for invalid protocol', async () => {
//             await assert.rejects(Wss('ws://example.com', certPath), /Invalid protocol: wss/);
//         });
//     });

// });

