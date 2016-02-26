'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _fileWatcher = require('./file-watcher');

var _fileWatcher2 = _interopRequireDefault(_fileWatcher);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var P = function P(f) {
    return new Promise(f);
};
var ____ = (0, _debug2.default)('faster-titanium:EventServer');
var ___x = (0, _debug2.default)('faster-titanium:EventServer:error');

/**
 * Server connecting continuously with Titanium App.
 * Restrict connection: only one device can connect to the server.
 */

var EventServer = function (_EventEmitter) {
    _inherits(EventServer, _EventEmitter);

    /**
     * @param {string} [port]
     */

    function EventServer(port) {
        _classCallCheck(this, EventServer);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EventServer).call(this));

        _this.port = port;
        _this.client = null;
        _this.server = _net2.default.createServer(_this.addClient.bind(_this));
        _this.server.on('error', function (err) {
            return ___x(err) || _this.emit('error', err);
        });
        return _this;
    }

    /**
     * listen
     * @public
     * @return {Promise}
     */


    _createClass(EventServer, [{
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
            this.client && this.client.destroy();

            return P(function (y) {
                return _this3.server.close(y);
            }).then(function (x) {
                ____('terminated');
            });
        }

        /**
         * add a client socket
         * @param {net.Socket} socket
         */

    }, {
        key: 'addClient',
        value: function addClient(socket) {
            if (this.client) {
                ____('New connection, Overwrite existing connection.');
                if (this.client.writable) {
                    this.client.end();
                }
            } else {
                ____('New connection. Set client.');
            }

            socket.setEncoding('utf8');
            this.client = socket;
        }

        /**
         * send payload to the client
         * @param {object} [payload={}]
         */

    }, {
        key: 'send',
        value: function send() {
            var payload = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (!this.client) {
                return ____('sending message suppressed: No client.');
            }
            if (!this.client.writable) {
                this.client = null;
                return ____('sending message suppressed: Socket is not writable.');
            }

            ____('sending payload: ' + JSON.stringify(payload) + '\n');
            // as payloads are sometimes joined with previous one, the client should split them with "\n" separator
            // (see src/titanium/socket.js)
            this.client.write(JSON.stringify(payload) + '\n');
        }
    }]);

    return EventServer;
}(_events.EventEmitter);

exports.default = EventServer;