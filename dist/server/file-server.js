"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _resourceResponder = require('./resource-responder');

var _resourceResponder2 = _interopRequireDefault(_resourceResponder);

var _events = require('events');

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
     * @param {string} projDir project root directory (absolute path)
     * @param {number} [port=4157]
     * @param {string} [host=127.0.0.1]
     */

    function FileServer(projDir) {
        var port = arguments.length <= 1 || arguments[1] === undefined ? 4157 : arguments[1];
        var host = arguments.length <= 2 || arguments[2] === undefined ? '127.0.0.1' : arguments[2];

        _classCallCheck(this, FileServer);

        /** @type {string} */

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FileServer).call(this));

        _this.projDir = projDir;

        /** @type {number} */
        _this.port = parseInt(port, 10);

        /** @type {string} */
        _this.host = host;

        /** @type {net.Socket[]} */
        _this.sockets = [];

        /** @type {http.Server} */
        _this.server = _http2.default.createServer(_this.onRequest.bind(_this));
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
                ____('start listening ' + _this2.host + ':' + _this2.port);
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
         * @param {http.ServerRequest} req
         * @param {http.ServerResponse} res
         * @private
         */

    }, {
        key: 'onRequest',
        value: function onRequest(req, res) {
            try {
                var url = (0, _url.parse)(req.url).pathname;
                ____('url: ' + url);

                if (url === '/') return this.responseServerInfo(res);
                if (url === '/kill') return this.emitKilled(res);
                if (url === '/reload') return this.emitReload(res);

                return this.responseResource(req, res);
            } catch (err) {
                ___x(err);
                this.respond(res, 500, 'application/json', JSON.stringify([err.message, err.stack]));
            }
        }

        /**
         * responses server error
         * @param {http.ServerRequest} req
         * @param {http.ServerResponse} res
         */

    }, {
        key: 'responseResource',
        value: function responseResource(req, res) {
            var url = (0, _url.parse)(req.url).pathname;
            var platform = req.headers['x-platform'] || 'iphone';

            if (url === '/app.js') {
                var fasterTiPath = (0, _path.resolve)(__dirname, '../../dist/app.js');
                return this.respond(res, 200, 'text/plain', _fs2.default.readFileSync(fasterTiPath));
            }

            if (url === '/second-entry-after-faster-titanium.js') {
                url = '/app.js';
            }
            var responder = new _resourceResponder2.default(this.projDir, url, platform);
            if (!responder.exists) {
                responder = new _resourceResponder2.default(this.projDir, url);
            }
            var _responder$header = responder.header;
            var statusCode = _responder$header.statusCode;
            var contentType = _responder$header.contentType;


            this.respond(res, statusCode, contentType, responder.content);
        }

        /**
         * responses server info
         * @param {http.ServerResponse} res
         */

    }, {
        key: 'responseServerInfo',
        value: function responseServerInfo(res) {

            var data = {
                projDir: this.projDir,
                uptime: process.uptime()
            };

            this.respond(res, 200, 'application/json', JSON.stringify(data));
        }

        /**
         * responses content
         * @param {http.ServerResponse} res
         * @param {number} statusCode
         * @param {string} contentType
         * @param {string} content
         * @private
         */

    }, {
        key: 'respond',
        value: function respond(res, statusCode, contentType, content) {
            ____({ statusCode: statusCode, contentType: contentType, length: content.length });
            res.writeHead(statusCode, { 'Content-Type': contentType });
            res.write(content);
            res.end();
        }

        /**
         * terminates server
         * @param {http.ServerResponse} res
         * @emits {got-kill-message}
         */

    }, {
        key: 'emitKilled',
        value: function emitKilled(res) {
            this.respond(res, 200, 'text/plain', 'Server will be terminated');
            this.emit('got-kill-message');
        }

        /**
         * @emits {got-reload-message}
         * @param {http.ServerResponse} res
         */

    }, {
        key: 'emitReload',
        value: function emitReload(res) {
            this.respond(res, 200, 'text/plain', 'Apps will be reloaded');
            this.emit('got-reload-message');
        }
    }]);

    return FileServer;
}(_events.EventEmitter);

exports.default = FileServer;