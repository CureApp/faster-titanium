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
         * clear all module caches
         */

    }, {
        key: 'clearCache',
        value: function clearCache() {
            for (key in this.modules) {
                delete this.modules[key];
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