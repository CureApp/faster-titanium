(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = function ____(v) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'log' : arguments[1];
    return console[type]('[FasterTitanium:AlloyCompilationState]', v);
};

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
        key: 'started',
        value: function started(token) {
            var _this = this;

            var timer = setTimeout(function (x) {

                ____('Compilation timed out after ' + _this.timeout + 'msec. token=' + token);
                delete _this.tokens[token];
            }, this.timeout);

            this.tokens[token] = timer;
        }

        /**
         * clear alloy compilation memory
         * @param {string} token identifier
         */

    }, {
        key: 'finished',
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
        key: 'compiling',
        get: function get() {
            return Object.keys(this.tokens).length > 0;
        }
    }]);

    return AlloyCompilationState;
}();

exports.default = AlloyCompilationState;
},{}],2:[function(require,module,exports){
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
},{"../common/alloy-compilation-state":1,"./require-agent":5,"./socket":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = function ____(v) {
    return console.log('[Faster-Titanium:Http]', v);
};

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
                    throw new Error('[HTTP GET] status:' + proxy.status + '\n ' + proxy.responseText);
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
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = function ____(v) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'log' : arguments[1];
    return console[type]('[FasterTitanium:RequireAgent]', v);
};

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

            ____('requiring ' + moduleName);
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
            ____('\tremote access: ' + url);

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

            ____('\tfile access: ' + moduleName);

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
},{"./http":3,"./module":4}],6:[function(require,module,exports){
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

    /**
     * connect to TCP server
     */


    _createClass(Socket, [{
        key: 'connect',
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
    }]);

    return Socket;
}();

exports.default = Socket;
},{}]},{},[2]);
