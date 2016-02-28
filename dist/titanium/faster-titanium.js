"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _requireAgent = require('./require-agent');

var _requireAgent2 = _interopRequireDefault(_requireAgent);

var _alloyCompilationState = require('../common/alloy-compilation-state');

var _alloyCompilationState2 = _interopRequireDefault(_alloyCompilationState);

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
         * create instance of FasterTitanium and start app
         * @param {Object} g global object of Titanium environment
         * @param {Object} options
         * @param {number} options.fPort port number of file server
         * @param {number} options.nPort port number of notification server
         * @param {string} [options.host='localhost'] host hostname of the servers
         */
        value: function run(g, options) {
            var ft = new FasterTitanium(g, options);
            FasterTitanium.instance = ft;
            ft.startApp();
        }

        /**
         * @param {Object} g global object of Titanium environment
         * @param {Object} options
         * @param {number} options.fPort port number of file server
         * @param {number} options.nPort port number of notification server
         * @param {string} [options.host='localhost'] host hostname of the servers
         */

    }]);

    function FasterTitanium(g) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, FasterTitanium);

        var fPort = options.fPort;
        var nPort = options.nPort;
        var _options$host = options.host;
        var host = _options$host === undefined ? 'localhost' : _options$host;

        /** @type {Object} global object of Titanium environment */

        this.global = g;
        /** @type {RequireAgent} */
        this.reqAgent = new _requireAgent2.default(this.global.require, host, fPort);
        /** @type {string} file server URL */
        this.url = 'http://' + host + ':' + fPort;
        /** @type {number} the number of reload events excepted to occur @private */
        this.expectedReloads = 0;
        /** @type {AlloyCompilationState} */
        this.acState = new _alloyCompilationState2.default();
        /** @type {number} counter, only used in reload()*/
        this.willReload = 0;
        /** @type {Socket} file server URL */
        this.socket = new _socket2.default({ host: host, port: parseInt(nPort, 10) });
        this.socket.onConnection(function (x) {
            return ____('Connection established to ' + host + ':' + nPort);
        });

        this.registerListeners();
    }

    /**
     * register event listeners.
     * called only once in constructor
     * @private
     */


    _createClass(FasterTitanium, [{
        key: 'registerListeners',
        value: function registerListeners() {
            var _this = this;

            this.socket.onData(this.onPayload.bind(this));
            this.socket.onClose(function (x) {
                alert('[FasterTitanium] TCP server is terminated.');
                _this.connectLater(10);
            });
            this.socket.onError(this.socketError.bind(this));
        }

        /**
         * connect to notification server and begin app with the given code
         */

    }, {
        key: 'startApp',
        value: function startApp() {
            this.socket.connect();
            this.reqAgent.require('app');
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
         * event listener called when the notification server sends payload
         * @param {string} payload (can be parsed as JSON)
         */

    }, {
        key: 'onPayload',
        value: function onPayload(payload) {
            ____('payload: ' + JSON.stringify(payload), 'trace');

            switch (payload.event) {
                case 'alloy-compilation':
                    this.acState.started(payload.token);
                    break;
                case 'alloy-compilation-done':
                    this.acState.finished(payload.token);
                    break;
                case 'reload':
                    this.reload(payload);
                    break;
                case 'reflect':
                    this.reflect(payload);
                    break;
                default:
                    break;
            }
        }

        /**
         * clear existing caches of the changed modules
         */

    }, {
        key: 'reflect',
        value: function reflect() {
            var _this2 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (!options.names) return;

            options.names.forEach(function (name) {
                ____('clearing cache ' + name);
                _this2.reqAgent.clearCache(name);
            });
        }

        /**
         * reload this app
         * @param {Object} [options={}]
         * @param {number} [options.timer=0]
         * @param {boolean} [options.force=false]
         */

    }, {
        key: 'reload',
        value: function reload() {
            var _this3 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var _options$timer = options.timer;
            var timer = _options$timer === undefined ? 0 : _options$timer;
            var _options$force = options.force;
            var force = _options$force === undefined ? false : _options$force;


            this.willReload++;

            setTimeout(function (x) {
                _this3.willReload--;

                if ((_this3.acState.compiling || _this3.willReload > 0) && !force) {
                    return ____('Reload suppressed because ongoing alloy compilations exist. Use web reload button to force reloading: ' + _this3.url);
                }

                _this3.socket.end();

                try {
                    ____('reloading app');
                    Ti.App._restart();
                } catch (e) {
                    ____('reload');
                    _this3.reqAgent.clearAllCaches();
                    _this3.reqAgent.require('app');
                }
            }, timer);
        }
    }]);

    return FasterTitanium;
}();

exports.default = FasterTitanium;


if (typeof Ti !== 'undefined') Ti.FasterTitanium = FasterTitanium;