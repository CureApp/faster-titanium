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
    return console.log('[Faster-Titanium]', v);
};

var FasterTitanium = function () {
    _createClass(FasterTitanium, null, [{
        key: 'run',
        value: function run() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return new FasterTitanium(options);
        }
    }]);

    function FasterTitanium() {
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, FasterTitanium);

        var _options$fPort = options.fPort;
        var fPort = _options$fPort === undefined ? 4157 : _options$fPort;
        var _options$ePort = options.ePort;
        var ePort = _options$ePort === undefined ? 4156 : _options$ePort;
        var _options$host = options.host;
        var host = _options$host === undefined ? 'localhost' : _options$host;


        this.reqAgent = new _requireAgent2.default(host, fPort, this.getPlatform());

        var socket = new _socket2.default({ host: host, port: parseInt(ePort, 10) });

        socket.onData(function (payload) {
            socket.end();
            _this.reload();
        });

        this.reqAgent.require('second-entry-after-faster-titanium');
    }

    /**
     * @returns {string}
     */


    _createClass(FasterTitanium, [{
        key: 'getPlatform',
        value: function getPlatform() {
            return Ti.Platform.osname;
        }

        /**
         * reload this app
         */

    }, {
        key: 'reload',
        value: function reload() {
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
    return console.log('[Faster-Titanium:RequireAgent]', v);
};

var RequireAgent = function () {

    /**
     * @param {string} host
     * @param {number} port
     * @param {string} platform
     */

    function RequireAgent(host, port, platform) {
        _classCallCheck(this, RequireAgent);

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
            var source = this.getServerSource(moduleName);
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
         * @returns {object}
         */

    }, {
        key: 'getServerSource',
        value: function getServerSource(moduleName) {

            var url = 'http://' + this.host + ':' + this.port + '/' + moduleName + '.js';
            ____('access to ' + url);

            return _http2.default.get(url, {
                timeout: this.timeout,
                header: { 'x-platform': this.platform }
            });
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
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Socket);

        var host = options.host;
        var port = options.port;


        this.dataListener = null;

        this.proxy = Ti.Network.Socket.createTCP({
            host: host,
            port: port,

            connected: function connected(v) {

                Ti.Stream.pump(v.socket, function (e) {
                    _this.dataListener && _this.dataListener('' + e.buffer);
                }, 1024, true);
            },

            error: function error(e) {
                console.log(e);
            }
        });

        this.proxy.connect();
    }

    _createClass(Socket, [{
        key: 'onData',
        value: function onData(fn) {
            if (typeof fn === 'function') {
                this.dataListener = fn;
            }
        }
    }, {
        key: 'end',
        value: function end() {
            this.proxy.close();
        }
    }]);

    return Socket;
}();

exports.default = Socket;
},{}]},{},[1]);
