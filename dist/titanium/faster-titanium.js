"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _requireAgent = require('./require-agent');

var _requireAgent2 = _interopRequireDefault(_requireAgent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = function ____(v) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'log' : arguments[1];
    return console[type]('[FasterTitanium]', v);
};

var FasterTitanium = function () {
    _createClass(FasterTitanium, null, [{
        key: 'run',


        /**
         * create instance of FasterTitanium and initialize app
         * @param {Object} g global object of Titanium environment
         * @param {Object} options
         * @param {number} [options.fPort=4157] port number of file server
         * @param {number} [options.ePort=4156] port number of event server
         * @param {string} [options.host='localhost'] host hostname of the servers
         */
        value: function run(g) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var ft = new FasterTitanium(g, options);
            FasterTitanium.instance = ft;
            ft.init();
        }

        /**
         * @param {Object} g global object of Titanium environment
         * @param {Object} options
         * @param {number} [options.fPort=4157] port number of file server
         * @param {number} [options.ePort=4156] port number of event server
         * @param {string} [options.host='localhost'] host hostname of the servers
         */

    }]);

    function FasterTitanium(g) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, FasterTitanium);

        var _options$fPort = options.fPort;
        var fPort = _options$fPort === undefined ? 4157 : _options$fPort;
        var _options$ePort = options.ePort;
        var ePort = _options$ePort === undefined ? 4156 : _options$ePort;
        var _options$host = options.host;
        var host = _options$host === undefined ? 'localhost' : _options$host;

        /** @type {Object} global object of Titanium environment */

        this.global = g;

        /** @type {RequireAgent} */
        this.reqAgent = new _requireAgent2.default(this.global.require, host, fPort, this.getPlatform());

        /** @type {string} file server URL */
        this.url = 'http://' + host + ':' + fPort;

        /** @type {Socket} file server URL */
        this.socket = new _socket2.default({ host: host, port: parseInt(ePort, 10) });
        this.socket.onConnection(function (x) {
            return ____('Connection established to ' + host + ':' + ePort);
        });
        this.socket.onData(this.reload.bind(this));
        this.socket.onClose(function (x) {
            return alert('[FasterTitanium] TCP server is terminated.');
        });
        this.socket.onError(this.socketError.bind(this));
    }

    /**
     * connect to event server and begin app
     */


    _createClass(FasterTitanium, [{
        key: 'init',
        value: function init() {
            this.socket.connect();
            this.reqAgent.require('second-entry-after-faster-titanium');
        }

        /**
         * @returns {string}
         */

    }, {
        key: 'getPlatform',
        value: function getPlatform() {
            return Ti.Platform.osname;
        }

        /**
         * @param {Object} err error from TCP socket
         */

    }, {
        key: 'socketError',
        value: function socketError(err) {
            switch (err.code) {
                case 50:
                    // Network Unreachable
                    ____('Network unreachable. Try reconnecting in 10secs', 'warn');
                    this.connectLater(10);
                    break;
                case 57:
                    // Socket is not connected
                    ____('Connectiton failed. Try reconnecting in 1sec', 'warn');
                    this.connectLater(1);
                    break;
                case 61:
                    // Connection refused
                    ____('Connectiton refused. Check if server is alive: ' + this.url, 'warn');
                    this.connectLater(10);
                    break;
                default:
                    console.warn(err);
                    ____('TCP Socket Error. Try reconnecting in 10secs', 'warn');
                    this.connectLater(10);
                    break;
            }
        }

        /**
         * connect to TCP server later
         */

    }, {
        key: 'connectLater',
        value: function connectLater() {
            var _context;

            var sec = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];

            setTimeout((_context = this.socket).reconnect.bind(_context), sec * 1000);
        }

        /**
         * reload this app
         */

    }, {
        key: 'reload',
        value: function reload() {

            this.socket.end();

            try {
                ____('reloading app');
                Ti.App._restart();
            } catch (e) {
                ____('reloading App via legacy method');
                this.reqAgent.require('app');
            }
        }
    }]);

    return FasterTitanium;
}();

exports.default = FasterTitanium;


if (typeof Ti !== 'undefined') Ti.FasterTitanium = FasterTitanium;