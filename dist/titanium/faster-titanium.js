"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preferences = require('../common/preferences');

var _preferences2 = _interopRequireDefault(_preferences);

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _requireAgent = require('./require-agent');

var _requireAgent2 = _interopRequireDefault(_requireAgent);

var _alloyCompilationState = require('../common/alloy-compilation-state');

var _alloyCompilationState2 = _interopRequireDefault(_alloyCompilationState);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var _alertDialogReplacer = require('./alert-dialog-replacer');

var _alertDialogReplacer2 = _interopRequireDefault(_alertDialogReplacer);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = _logger2.default.debug('FasterTitanium');

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
            _alertDialogReplacer2.default.init();
            _logger2.default.init();
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
         * @param {string} [options.host='localhost'] access token for server
         */

    }]);

    function FasterTitanium(g) {
        var _this = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, FasterTitanium);

        var fPort = options.fPort;
        var nPort = options.nPort;
        var _options$host = options.host;
        var host = _options$host === undefined ? 'localhost' : _options$host;
        var token = options.token;

        /** @type {string} access token for server */

        this.token = token;
        /** @type {boolean} whether to connect to notification server */
        this.connected = false;
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
            return _this.socket.sendText(_this.token);
        });

        this.fetchPreferences(host, fPort);
        this.registerListeners();
    }

    /**
     * get Preferences from file server
     * @param {string} host
     * @param {number} fPort
     */


    _createClass(FasterTitanium, [{
        key: 'fetchPreferences',
        value: function fetchPreferences(host, fPort) {
            var url = 'http://' + host + ':' + fPort + '/prefs';
            try {
                var response = _http2.default.get(url, { timeout: 2000 });
                var prefs = new _preferences2.default(JSON.parse(response));
                this.applyPreferences(prefs);
            } catch (e) {
                console.error(e);
            }
        }

        /**
         * register event listeners.
         * called only once in constructor
         * @private
         */

    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            var _this2 = this;

            this.socket.onData(this.onPayload.bind(this));
            this.socket.onClose(function (x) {
                ____('Connection closed.');
                if (_this2.connected) {
                    _this2.showDialog('TCP server is terminated. \n(This dialog will be closed in 3sec.)', 3000);
                }
                _logger2.default.serverLogDisabled();
                _this2.connected = false;
                _this2.connectLater(10);
            });
            this.socket.onError(this.socketError.bind(this));
        }

        /**
         * apply the given preferences
         * @param {Preferences} prefs
         */

    }, {
        key: 'applyPreferences',
        value: function applyPreferences(prefs) {
            _logger2.default.debugMode = prefs.tiDebug;
            _logger2.default.localLog = prefs.localLog;
            _logger2.default.serverLog = prefs.serverLog;
            ____('New preferences: ' + JSON.stringify(prefs), 'trace');
        }

        /**
         * Show dialog with given message
         * The dialog will close in {msec} milliseconds.
         * @param {string} message
         * @param {number} msec
         */

    }, {
        key: 'showDialog',
        value: function showDialog(message) {
            var msec = arguments.length <= 1 || arguments[1] === undefined ? 3000 : arguments[1];

            var dialog = Ti.UI.createAlertDialog({
                title: 'FasterTitanium',
                message: message
            });

            dialog.show();
            setTimeout(function (x) {
                return dialog.hide();
            }, msec);
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
                case 'connected':
                    this.connected = true;
                    _logger2.default.serverLogEnabled(this.socket);
                    ____('Connection established to ' + this.socket.url);
                    break;
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
                case 'preferences':
                    this.applyPreferences(new _preferences2.default(payload.prefs));
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
            var _this3 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            if (!options.names) return;

            options.names.forEach(function (name) {
                ____('clearing cache ' + name);
                _this3.reqAgent.clearCache(name);
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
            var _this4 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var _options$timer = options.timer;
            var timer = _options$timer === undefined ? 0 : _options$timer;
            var _options$force = options.force;
            var force = _options$force === undefined ? false : _options$force;


            this.willReload++;

            _alertDialogReplacer2.default.hide(function (x) {
                // hides alert dialogs before restart. Then the given callback is executed.
                _this4.willReload--;

                if ((_this4.acState.compiling || _this4.willReload > 0) && !force) {
                    return ____('Reload suppressed because ongoing alloy compilations exist. Use web reload button to force reloading: ' + _this4.url);
                }

                _this4.socket.end();

                try {
                    ____('reloading app');
                    Ti.App._restart();
                } catch (e) {
                    ____('reload');
                    _this4.reqAgent.clearAllCaches();
                    _this4.reqAgent.require('app');
                }
            }, timer);
        }
    }]);

    return FasterTitanium;
}();

exports.default = FasterTitanium;


if (typeof Ti !== 'undefined') Ti.FasterTitanium = FasterTitanium;