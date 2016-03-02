(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Memorize alloy compilation state (start/finish)
 */

var AlloyCompilationState = function () {
    function AlloyCompilationState() {
        var timeout = arguments.length <= 0 || arguments[0] === undefined ? 5000 : arguments[0];

        _classCallCheck(this, AlloyCompilationState);

        if (timeout === false) {
            timeout = 1000 * 3600 * 24; // 1day (= never called)
        }
        this.tokens = {};
        this.timeout = timeout;
    }

    /**
     * memorize start of alloy compilation
     * @param {string} token identifier
     */


    _createClass(AlloyCompilationState, [{
        key: "started",
        value: function started(token) {
            var _this = this;

            var timer = setTimeout(function (x) {

                delete _this.tokens[token];
            }, this.timeout);

            this.tokens[token] = timer;
        }

        /**
         * clear alloy compilation memory
         * @param {string} token identifier
         */

    }, {
        key: "finished",
        value: function finished(token) {
            if (this.tokens[token]) {
                clearTimeout(this.tokens[token]);
                delete this.tokens[token];
            }
        }

        /**
         * is alloy compiling
         * @type {boolean}
         */

    }, {
        key: "compiling",
        get: function get() {
            return Object.keys(this.tokens).length > 0;
        }
    }]);

    return AlloyCompilationState;
}();

exports.default = AlloyCompilationState;
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AUTO_RELOAD = 1;
var AUTO_REFLECT = 2;
var MANUAL = 3;

var Preferences = function () {
    _createClass(Preferences, null, [{
        key: 'selections',
        get: function get() {
            return {
                AUTO_RELOAD: AUTO_RELOAD,
                AUTO_REFLECT: AUTO_REFLECT,
                MANUAL: MANUAL
            };
        }
    }, {
        key: 'expressions',
        get: function get() {
            var _ref;

            return _ref = {}, _defineProperty(_ref, AUTO_RELOAD, 'auto-reload'), _defineProperty(_ref, AUTO_REFLECT, 'auto-reflect'), _defineProperty(_ref, MANUAL, 'manual'), _ref;
        }
    }, {
        key: 'descriptions',
        get: function get() {
            var _ref2;

            return _ref2 = {}, _defineProperty(_ref2, AUTO_RELOAD, 'Reload everytime a file changes.'), _defineProperty(_ref2, AUTO_REFLECT, 'Clear loaded modules in Titanium everytime a file changes (this may clear internal variables).'), _defineProperty(_ref2, MANUAL, 'Do nothing.'), _ref2;
        }
    }]);

    function Preferences() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Preferences);

        var _options$loadStyleNum = options.loadStyleNum;
        var loadStyleNum = _options$loadStyleNum === undefined ? AUTO_RELOAD : _options$loadStyleNum;
        var _options$tiDebug = options.tiDebug;
        var tiDebug = _options$tiDebug === undefined ? false : _options$tiDebug;
        var _options$serverLog = options.serverLog;
        var serverLog = _options$serverLog === undefined ? true : _options$serverLog;
        var _options$localLog = options.localLog;
        var localLog = _options$localLog === undefined ? false : _options$localLog;

        /** @type {number} load style type */

        this.loadStyleNum = loadStyleNum;
        /** @type {boolean} whether to show titanium log in server console */
        this.tiDebug = tiDebug;
        /** @type {boolean} whether to show titanium log in server console */
        this.serverLog = serverLog;
        /** @type {boolean} whether to show titanium log in titanium console */
        this.localLog = localLog;
    }

    _createClass(Preferences, [{
        key: 'apply',
        value: function apply() {
            var _this = this;

            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            Object.keys(this).forEach(function (key) {
                var newValue = params[key];
                if ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === _typeof(_this[key])) _this[key] = newValue;
            });
        }
    }, {
        key: 'tiDebugNum',
        get: function get() {
            return Number(this.tiDebug);
        }
    }, {
        key: 'style',
        get: function get() {
            return this.constructor.expressions[this.loadStyleNum];
        }
    }]);

    return Preferences;
}();

exports.default = Preferences;
},{}],3:[function(require,module,exports){
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

            setTimeout(function (x) {
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
},{"../common/alloy-compilation-state":1,"../common/preferences":2,"./http":4,"./logger":5,"./require-agent":7,"./socket":8}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Http = function () {
    function Http() {
        _classCallCheck(this, Http);
    }

    _createClass(Http, null, [{
        key: 'get',
        value: function get(url) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var timeout = options.timeout;

            var timestamp = new Date().getTime();

            var proxy = Ti.Network.createHTTPClient();
            proxy.open('GET', url);

            Object.keys(options.header || {}).forEach(function (key) {
                proxy.setRequestHeader(key, options.header[key]);
            });

            proxy.send();

            var result = null;

            while (true) {
                if (proxy.readyState === 4) {
                    if (proxy.status == 200) {
                        result = proxy.responseText;
                        break;
                    }
                    throw new Error('[HTTP GET] status:' + proxy.status + '\n ' + proxy.responseText + '. url = ' + url);
                }

                if (new Date().getTime() - timestamp > timeout) {
                    throw new Error('[HTTP GET] request timed out: ' + url);
                }
            }
            return result;
        }
    }]);

    return Http;
}();

exports.default = Http;
},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var firstLoaded = new Date().getTime();

/**
 * Singleton class. Class itself has states.
 */

var Logger = function () {
    function Logger() {
        _classCallCheck(this, Logger);
    }

    _createClass(Logger, null, [{
        key: 'init',


        // pseudo constructor of this singleton.
        value: function init() {
            this.socket = null;
            this.queue = [];

            this.debugMode = false;
            this.localLog = false;
            this.serverLog = false;

            this.TiAPI = Ti.API;
            this.console = console;

            this.overwriteConsole();
        }
    }, {
        key: 'overwriteConsole',


        /**
         * overwrite Ti.API.* and console.*
         */
        value: function overwriteConsole() {
            var _this = this;

            try {
                (function () {
                    var API = {};

                    _this.severities.forEach(function (severity) {
                        var fn = _this.TiAPI[severity];
                        API[severity] = function () {
                            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                                args[_key] = arguments[_key];
                            }

                            _this.log(args, severity);
                        };
                    });
                    Ti.API = API;
                    console = API;
                })();
            } catch (e) {}
        }
    }, {
        key: 'log',
        value: function log(args, severity, options) {

            this.serverLog && this.sendToServer(args, severity, options);

            this.localLog && this.showLocalLog(args, severity, options);
        }
    }, {
        key: 'showLocalLog',
        value: function showLocalLog(args, severity) {
            var _TiAPI;

            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if (options.debugname) {
                args.unshift('[' + options.debugname + ']');
            }
            (_TiAPI = this.TiAPI)[severity].apply(_TiAPI, _toConsumableArray(args));
        }

        /**
         * @param {string} debugname
         */

    }, {
        key: 'debug',
        value: function debug(debugname) {
            var _this2 = this;

            return function (arg) {
                var severity = arguments.length <= 1 || arguments[1] === undefined ? 'info' : arguments[1];
                return _this2.debugMode && _this2.log([arg], severity, { debugname: debugname });
            };
        }

        /**
         * @param {Socket} socket
         */

    }, {
        key: 'serverLogEnabled',
        value: function serverLogEnabled(socket) {
            this.socket = socket;

            while (this.queue.length) {
                var _queue$shift = this.queue.shift();

                var args = _queue$shift.args;
                var severity = _queue$shift.severity;
                var options = _queue$shift.options;

                this.sendToServer(args, severity, options);
            }
        }
    }, {
        key: 'serverLogDisabled',
        value: function serverLogDisabled() {
            this.socket = null;
        }

        /**
         * send log to server via socket
         */

    }, {
        key: 'sendToServer',
        value: function sendToServer(args, severity) {
            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if (!this.socket) {
                options.time = new Date().toISOString();
                return this.queue.push({ args: args, severity: severity, options: options });
            }

            try {
                this.socket.send({ type: 'log', args: args, severity: severity, options: options });
            } catch (e) {
                this.console.warn('Couldn\'t send log to server. Socket is not writable.');
            }
        }
    }, {
        key: 'severities',
        get: function get() {
            return ['log', 'info', 'trace', 'warn', 'debug', 'critical', 'error'];
        }
    }]);

    return Logger;
}();

exports.default = Logger;
},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * shimming node.js module
 */

var Module = function () {
    function Module(moduleName) {
        _classCallCheck(this, Module);

        /** @type {string} */
        this.moduleName = moduleName;

        /** @type {Object} */
        this.exports = {};
    }

    /** @type {string} */


    _createClass(Module, [{
        key: '__dirname',
        get: function get() {
            if (this.moduleName === 'app') {
                return undefined;
            } // app.js doesn't have __dirname

            if (this.moduleName.match('/')) {
                return this.moduleName.replace(/\/[^\/]+$/, '');
            } else {
                return '.';
            }
        }

        /** @type {string} */

    }, {
        key: '__filename',
        get: function get() {
            if (this.moduleName === 'app') {
                return undefined;
            } // app.js doesn't have __filename

            return this.moduleName.split('/').pop();
        }
    }]);

    return Module;
}();

exports.default = Module;
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.relativePath = relativePath;

var _module = require('./module');

var _module2 = _interopRequireDefault(_module);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = _logger2.default.debug('FasterTitanium:RequireAgent');

var RequireAgent = function () {

    /**
     * @param {function} original (titanium) require function
     * @param {string} host
     * @param {number} port
     */

    function RequireAgent(origRequire, host, port) {
        _classCallCheck(this, RequireAgent);

        /** @type {function(moduleName: string):Object} */
        this.origRequire = origRequire;

        /** @type {Map<string, Module>} */
        this.modules = {};

        /** @type {number} */
        this.timeout = 10000;

        /** @type {number} */
        this.host = host;

        /** @type {number} */
        this.host = host;

        /** @type {number} */
        this.port = parseInt(port, 10);
    }

    /**
     * @param {string} moduleName
     * @returns {object}
     */


    _createClass(RequireAgent, [{
        key: 'require',
        value: function require(moduleName) {

            ____('requiring ' + moduleName, 'trace');
            if (this.modules[moduleName]) {
                return this.modules[moduleName].exports;
            }

            var source = undefined;
            try {
                source = this.getServerSource(moduleName);
            } catch (e) {
                console.warn('Couldn\'t fetch module ' + moduleName + ' from HTTP server. Use local file.');
                try {
                    source = this.getLocalSource(moduleName);
                } catch (e) {
                    console.warn('Couldn\'t fetch module ' + moduleName + ' from file system. Use original require.');
                    return this.origRequire(moduleName);
                }
            }
            var mod = this.createModule(moduleName, source);
            this.modules[moduleName] = mod;
            return mod.exports;
        }

        /**
         * require module after resolving relative path, stripping extension
         * @param {string} rawModuleName
         * @param {Module} moduleFrom module where this method is called
         * @returns {object}
         */

    }, {
        key: 'requireRaw',
        value: function requireRaw(rawModuleName, moduleFrom) {

            var moduleName = rawModuleName;

            // resolve relative path
            if (moduleName.match(/^\./)) {
                moduleName = relativePath(moduleFrom.moduleName, moduleName);
            }

            if (moduleName.match(/\.js$/)) {
                moduleName = moduleName.slice(0, -3);
            }
            return this.require(moduleName);
        }

        /**
         * @param {string} moduleName
         * @param {string} source
         */

    }, {
        key: 'createModule',
        value: function createModule(moduleName, source) {
            var _this = this;

            var mod = new _module2.default(moduleName);

            var fn = Function('exports, require, module, __dirname, __filename', source);
            fn(mod.exports, function (v) {
                return _this.requireRaw(v, mod);
            }, mod, mod.__dirname, mod.__filename);

            return mod;
        }

        /**
         * @param {string} moduleName
         * @returns {string} js code
         */

    }, {
        key: 'getServerSource',
        value: function getServerSource(moduleName) {

            var url = 'http://' + this.host + ':' + this.port + '/' + moduleName + '.js';
            ____('\tremote access: ' + url, 'trace');

            return _http2.default.get(url, {
                timeout: this.timeout
            });
        }

        /**
         * @param {string} moduleName
         * @returns {string} js code
         */

    }, {
        key: 'getLocalSource',
        value: function getLocalSource(moduleName) {

            ____('\tfile access: ' + moduleName, 'trace');

            if (moduleName === 'app') moduleName = 'original-app';

            var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, moduleName + '.js');

            return file.read().text;
        }

        /**
         * clear cache by name
         */

    }, {
        key: 'clearCache',
        value: function clearCache(name) {
            delete this.modules[name];
        }

        /**
         * clear all module caches
         */

    }, {
        key: 'clearAllCaches',
        value: function clearAllCaches() {
            for (key in this.modules) {
                this.clearCache(key);
            }
        }
    }]);

    return RequireAgent;
}();

/**
 * @param {string} from
 * @param {string} to
 * @private (export for test)
 */


exports.default = RequireAgent;
function relativePath(from, to) {

    var fromNodes = from.split('/');
    fromNodes.pop();

    var toNodes = to.split('/');

    for (var i in toNodes) {
        var toNode = toNodes[i];
        switch (toNode) {
            case '..':
                if (fromNodes.length === 0) {
                    throw new Error('cannot resolve relative path. from: ' + from + ', to: ' + to);
                }
                fromNodes.pop();
                break;
            case '.':
                break;
            default:
                fromNodes.push(toNode);
                break;
        }
    }
    return fromNodes.join('/');
}
},{"./http":4,"./logger":5,"./module":6}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Socket = function () {
    function Socket() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Socket);

        var host = options.host;
        var port = options.port;


        this.host = host;
        this.port = port;
        this.dataListener = null;
        this.errorListener = null;
        this.proxy = this.createTCPSocket();
    }

    /** @type {string} */


    _createClass(Socket, [{
        key: 'connect',


        /**
         * connect to TCP server
         */
        value: function connect() {
            this.proxy.connect();
        }

        /**
         * reconnect to TCP server
         */

    }, {
        key: 'reconnect',
        value: function reconnect() {
            this.end();
            delete this.proxy;
            this.proxy = this.createTCPSocket();
            this.connect();
        }

        /**
         * create socket proxy for TCP connection
         */

    }, {
        key: 'createTCPSocket',
        value: function createTCPSocket() {
            var _this = this;

            return Ti.Network.Socket.createTCP({
                host: this.host,
                port: this.port,

                connected: function connected(v) {

                    _this.connectionListener && _this.connectionListener();

                    Ti.Stream.pump(v.socket, function (e) {
                        // end signal
                        if (!e.buffer) {
                            return _this.closeListener && _this.closeListener();
                        }
                        if (!_this.dataListener) return;

                        ('' + e.buffer).trim().split('\n') // split two or more JSONs (see src/server/event-server.js)
                        .map(function (str) {
                            try {
                                return JSON.parse(str);
                            } catch (e) {
                                console.error(e);return null;
                            }
                        }).filter(function (v) {
                            return v != null;
                        }).forEach(function (payload) {
                            return _this.dataListener(payload);
                        });
                    }, 1024, true);
                },

                error: function error(e) {
                    return _this.errorListener && _this.errorListener(e);
                }
            });
        }

        /**
         * send payload to server
         * @param {Object} payload
         */

    }, {
        key: 'send',
        value: function send(payload) {
            var buf = Ti.createBuffer({ value: JSON.stringify(payload) + '\n' });
            var bytes = this.proxy.write(buf);
        }

        /**
         * send string to server
         * @param {string} str
         */

    }, {
        key: 'sendText',
        value: function sendText(str) {
            var buf = Ti.createBuffer({ value: str });
            var bytes = this.proxy.write(buf);
        }

        /**
         * set listener of data event
         * @param {function} fn
         */

    }, {
        key: 'onData',
        value: function onData(fn) {
            if (typeof fn === 'function') this.dataListener = fn;
        }

        /**
         * set listener of close event
         * @param {function} fn
         */

    }, {
        key: 'onClose',
        value: function onClose(fn) {
            if (typeof fn === 'function') this.closeListener = fn;
        }

        /**
         * set listener of connection event
         * @param {function} fn
         */

    }, {
        key: 'onConnection',
        value: function onConnection(fn) {
            if (typeof fn === 'function') this.connectionListener = fn;
        }

        /**
         * set listener of error event
         * @param {function} fn
         */

    }, {
        key: 'onError',
        value: function onError(fn) {
            if (typeof fn === 'function') this.errorListener = fn;
        }

        /**
         * close socket
         */

    }, {
        key: 'end',
        value: function end() {
            try {
                this.proxy.close();
            } catch (e) {}
        }
    }, {
        key: 'url',
        get: function get() {
            return this.host + ':' + this.port;
        }
    }]);

    return Socket;
}();

exports.default = Socket;
},{}]},{},[3]);
