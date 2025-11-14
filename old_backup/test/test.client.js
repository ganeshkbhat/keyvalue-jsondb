// const assert = require('assert');
// const sinon = require('sinon');
// const { Http, Https, Ws, Wss } = require('../index').Clients();
// const http = require('http');
// const https = require('https');
// const WebSocket = require('ws');
// const fs = require('fs');
// const url = require('url');

// describe('Network Functions', () => {
//   let httpStub, httpsStub, wsStub, wssStub, fsStub;
//   const certPath = './test_cert.pem'; // Create a dummy cert for testing

//   before(() => {
//     fs.writeFileSync(certPath, 'test cert content');
//   });

//   after(() => {
//     fs.unlinkSync(certPath);
//   });

//   beforeEach(() => {
//     httpStub = sinon.stub(http, 'request');
//     httpsStub = sinon.stub(https, 'request');
//     wsStub = sinon.stub(WebSocket.prototype, 'send');
//     wssStub = sinon.stub(WebSocket.prototype, 'on');
//     fsStub = sinon.stub(fs, 'readFileSync').returns('test cert content');
//   });

//   afterEach(() => {
//     httpStub.restore();
//     httpsStub.restore();
//     wsStub.restore();
//     wssStub.restore();
//     fsStub.restore();
//   });

//   describe('Http', () => {
//     it('should make an HTTP POST request', async () => {
//       const mockReq = {
//         on: sinon.stub().callsFake(function (event, cb) {
//           if (event === 'end') cb();
//           return this;
//         }),
//         write: sinon.stub().returnsThis(),
//         end: sinon.stub().returnsThis(),
//       };
//       httpStub.callsFake((options, callback) => {
//         callback({ on: sinon.stub().returnsThis(), end: sinon.stub().returnsThis(), write: sinon.stub().returnsThis() });
//         return mockReq;
//       });

//       const result = await Http('http://example.com', 'test message');
//       assert.strictEqual(result, undefined);
//       assert(httpStub.calledOnce);
//       assert.strictEqual(httpStub.getCall(0).args[0].method, 'POST');
//       assert.strictEqual(mockReq.write.getCall(0).args[0], 'test message');
//     });

//     it('should reject with an error for invalid protocol', async () => {
//       await assert.rejects(Http('https://example.com', 'test message'), /Invalid protocol: http/);
//     });
//   });

//   describe('Https', () => {
//     it('should make an HTTPS POST request', async () => {
//       const mockReq = {
//         on: sinon.stub().callsFake(function (event, cb) {
//           if (event === 'end') cb();
//           return this;
//         }),
//         write: sinon.stub().returnsThis(),
//         end: sinon.stub().returnsThis(),
//       };
//       httpsStub.callsFake((options, callback) => {
//         callback({ on: sinon.stub().returnsThis(), end: sinon.stub().returnsThis(), write: sinon.stub().returnsThis() });
//         return mockReq;
//       });

//       const result = await Https('https://example.com', certPath, 'test message');
//       assert.strictEqual(result, undefined);
//       assert(httpsStub.calledOnce);
//       assert.strictEqual(httpsStub.getCall(0).args[0].method, 'POST');
//       assert.strictEqual(mockReq.write.getCall(0).args[0], 'test message');
//     });

//     it('should reject with an error for invalid protocol', async () => {
//       await assert.rejects(Https('http://example.com', certPath, 'test message'), /Invalid protocol: https/);
//     });
//   });

//   describe('Ws', () => {
//     it('should connect to a WebSocket server', async () => {
//       const mockWs = new WebSocket('ws://test');
//       const wsConstructorStub = sinon.stub(global, 'WebSocket').returns(mockWs);

//       setTimeout(() => {
//         mockWs.emit('open');
//         mockWs.emit('message', 'test message');
//       }, 0);

//       const result = await Ws('ws://example.com');
//       assert.strictEqual(result, 'test message');
//       assert(wsStub.calledOnce);
//       wsConstructorStub.restore();
//     });

//     it('should reject with an error for invalid protocol', async () => {
//       await assert.rejects(Ws('wss://example.com'), /Invalid protocol: ws/);
//     });
//   });

//   describe('Wss', () => {
//     it('should connect to a secure WebSocket server', async () => {
//       const mockWs = new WebSocket('wss://test');
//       const wsConstructorStub = sinon.stub(global, 'WebSocket').returns(mockWs);

//       setTimeout(() => {
//         mockWs.emit('open');
//         mockWs.emit('message', 'test message');
//       }, 0);

//       const result = await Wss('wss://example.com', certPath);
//       assert.strictEqual(result, 'test message');
//       assert(wsStub.calledOnce);
//       wsConstructorStub.restore();
//     });

//     it('should reject with an error for invalid protocol', async () => {
//       await assert.rejects(Wss('ws://example.com', certPath), /Invalid protocol: wss/);
//     });
//   });

// });

