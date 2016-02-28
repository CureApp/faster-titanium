"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
     * @param {number} [port=4157]
     */

    function FileServer() {
        var port = arguments.length <= 0 || arguments[0] === undefined ? 4157 : arguments[0];
        var routes = arguments[1];

        _classCallCheck(this, FileServer);

        /** @type {number} */

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FileServer).call(this));

        _this.port = parseInt(port, 10);
        /** @type {Array<Array>} */
        _this.routes = routes;
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
         * @return {Promise(ResponseInfo)}
         * @private
         */

    }, {
        key: 'handleURL',
        value: function handleURL(url) {
            var getResponseInfo = null;

            this.routes.some(function (route) {
                var _route = _slicedToArray(route, 2);

                var pattern = _route[0];
                var fn = _route[1];

                if (typeof pattern === 'string' && pattern === url || pattern instanceof RegExp && url.match(pattern)) {
                    getResponseInfo = fn;
                    return true;
                }
                return false;
            });

            if (getResponseInfo === null) {
                // not found
                return new _contentResponder2.default().notfound();
            }
            return getResponseInfo(url);
        }

        /**
         * @param {http.ServerRequest} req
         * @param {http.ServerResponse} res
         * @private
         */

    }, {
        key: 'onRequest',
        value: function onRequest(req, res) {

            var url = (0, _url.parse)(req.url).pathname;
            ____('url: ' + url);

            this.handleURL(url).then(function (responseInfo) {
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
    }]);

    return FileServer;
}(_events.EventEmitter);

exports.default = FileServer;