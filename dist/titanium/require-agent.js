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