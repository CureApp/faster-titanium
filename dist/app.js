(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./require-agent":4,"./socket":5}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = function Module() {
    _classCallCheck(this, Module);

    this.exports = {};
};

exports.default = Module;
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
     * @param {string} platform
     */

    function RequireAgent(origRequire, host, port, platform) {
        _classCallCheck(this, RequireAgent);

        this.origRequire = origRequire;
        this.modules = {};
        this.timeout = 10000;

        this.host = host;
        this.port = parseInt(port, 10);
        this.platform = platform;
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
         * @param {string} rawModuleName
         * @returns {object}
         */

    }, {
        key: 'requireRaw',
        value: function requireRaw(rawModuleName) {
            var moduleName = rawModuleName;
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

            var mod = new _module2.default();

            var fn = Function('exports, require, module', source);
            fn(mod.exports, function (v) {
                return _this.requireRaw(v);
            }, mod);

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
                timeout: this.timeout,
                header: { 'x-platform': this.platform }
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

            if (moduleName === 'app') moduleName = 'second-entry-after-faster-titanium';

            var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, moduleName + '.js');

            return file.read().text;
        }
    }]);

    return RequireAgent;
}();

exports.default = RequireAgent;
},{"./http":2,"./module":3}],5:[function(require,module,exports){
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
                        _this.dataListener && _this.dataListener('' + e.buffer);
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
},{}]},{},[1]);
