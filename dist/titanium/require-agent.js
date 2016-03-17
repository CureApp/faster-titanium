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

var _alertDialogReplacer = require('./alert-dialog-replacer');

var _alertDialogReplacer2 = _interopRequireDefault(_alertDialogReplacer);

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

            var source = void 0;
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

            // global variables in the source
            var variables = {
                exports: mod.exports,
                require: function require(v) {
                    return _this.requireRaw(v, mod);
                },
                module: mod,
                __dirname: mod.__dirname,
                __filename: mod.__filename,
                alert: _alertDialogReplacer2.default.alert
            };

            var varNames = Object.keys(variables).join(',');
            var varValues = Object.keys(variables).map(function (k) {
                return variables[k];
            });

            Function(varNames, source).apply(null, varValues);

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