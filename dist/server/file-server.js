"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fs = require('fs');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _events = require('events');

var _contentResponder = require('./content-responder');

var _contentResponder2 = _interopRequireDefault(_contentResponder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var P = function P(f) {
    return new Promise(f);
};
var ____ = (0, _debug2.default)('faster-titanium:FileServer');
var ___x = (0, _debug2.default)('faster-titanium:FileServer:error');

/**
 * Serve resource files
 */

var FileServer = function (_EventEmitter) {
    _inherits(FileServer, _EventEmitter);

    /**
     * @param {number} port
     * @param {string} token
     * @param {Array} routes
     */

    function FileServer(port, token, routes) {
        _classCallCheck(this, FileServer);

        /** @type {number} */

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FileServer).call(this));

        _this.port = parseInt(port, 10);
        /** @type {string} */
        _this.token = token;
        /** @type {Array<Array>} */
        _this.routes = routes;
        /** @type {net.Socket[]} */
        _this.sockets = [];
        /** @type {http.Server} */
        _this.server = _http2.default.createServer(function (req, res) {
            _this.parseBody(req, function (err, body) {
                return err ? _this.emit('error', err) : _this.onRequest(req, res, body);
            });
        });

        _this.server.on('error', function (err) {
            return ___x(err) || _this.emit('error', err);
        });
        _this.server.on('connection', function (socket) {
            return _this.sockets.push(socket);
        });
        return _this;
    }

    /**
     * listen
     * @public
     * @return {Promise}
     */


    _createClass(FileServer, [{
        key: 'listen',
        value: function listen() {
            var _this2 = this;

            return P(function (y) {
                return _this2.server.listen(_this2.port, y);
            }).then(function (x) {
                ____('start listening ' + _this2.port);
            });
        }

        /**
         * close server
         * @public
         * @return {Promise}
         */

    }, {
        key: 'close',
        value: function close() {
            var _this3 = this;

            ____('terminating...');
            this.sockets.forEach(function (socket) {
                return socket.destroy();
            });
            return P(function (y) {
                return _this3.server.close(y);
            }).then(function (x) {
                ____('terminated');
            });
        }

        /**
         * get instance of ResponseInfo with url matching passed routes
         * @param {string} url
         * @param {string} method
         * @param {string|Object} body
         * @return {Promise(ResponseInfo)}
         * @private
         */

    }, {
        key: 'handleURL',
        value: function handleURL(url, method, body) {
            var getResponseInfo = null;

            this.routes.some(function (route) {
                var pattern = route[0];
                var fn = route[route.length - 1];
                var expectedMethod = typeof route[1] === 'string' ? route[1] : 'GET';

                if (typeof pattern === 'string' && pattern === url && method === expectedMethod || pattern instanceof RegExp && url.match(pattern)) {
                    getResponseInfo = fn;
                    return true;
                }
                return false;
            });

            if (getResponseInfo === null) {
                // not found
                return new _contentResponder2.default().notfound();
            }
            return getResponseInfo(url, body);
        }

        /**
         * @param {http.ServerRequest} req
         * @param {http.ServerResponse} res
         * @param {string|Object} body
         * @private
         */

    }, {
        key: 'onRequest',
        value: function onRequest(req, res, body) {

            var url = (0, _url.parse)(req.url).pathname;
            ____('url: ' + url + ', method: ' + req.method + ', body: ' + JSON.stringify(body));

            this.handleURL(url, req.method, body).then(function (responseInfo) {
                var statusCode = responseInfo.statusCode;
                var contentType = responseInfo.contentType;
                var content = responseInfo.content;

                ____({ statusCode: statusCode, contentType: contentType, length: content.length });

                res.writeHead(statusCode, { 'Content-Type': contentType });
                res.write(content);
                res.end();
            }).catch(function (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify([err.message, err.stack]));
                res.end();
            });
        }

        /**
         * parse request body
         * @param {http.ServerRequest} req
         * @param {function(err: error, body: string|Object): void} fn
         */

    }, {
        key: 'parseBody',
        value: function parseBody(req, cb) {

            if (req.method === 'GET') return cb(null, '');

            var body = '';
            req.setEncoding('utf8');
            req.on('error', function (e) {
                return cb(e);
            });
            req.on('data', function (str) {
                return body += str;
            });
            req.on('end', function (x) {
                if (req.headers['content-type'] === 'application/json') body = JSON.parse(body);
                cb(null, body);
            });
        }
    }]);

    return FileServer;
}(_events.EventEmitter);

exports.default = FileServer;