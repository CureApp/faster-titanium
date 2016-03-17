'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _path = require('path');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _alloyCompilationState = require('../common/alloy-compilation-state');

var _alloyCompilationState2 = _interopRequireDefault(_alloyCompilationState);

var _optimizeAlloy = require('./optimize-alloy');

var _optimizeAlloy2 = _interopRequireDefault(_optimizeAlloy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var alloyPath = (0, _path.resolve)(__dirname, '../../node_modules/.bin/alloy');
var P = function P(f) {
    return new Promise(f);
};
var ____ = (0, _debug2.default)('faster-titanium:AlloyCompiler');
var ___x = (0, _debug2.default)('faster-titanium:AlloyCompiler:error');
var ___o = function ___o(v) {
    return ____(v) || v;
};
var wait = function wait(msec) {
    return new Promise(function (y) {
        return setTimeout(y, msec);
    });
};

/**
 * compiling alloy files
 */

var AlloyCompiler = function () {

    /**
     * @param {string} projDir
     */

    function AlloyCompiler(projDir, platform) {
        _classCallCheck(this, AlloyCompiler);

        /** @type {string} */
        this.projDir = projDir;
        this.platform = platform;
        this.acState = new _alloyCompilationState2.default(false); // false: timeout = false
        this.suppressAlloyLog();
        this.suppressAlloyDeath();
    }

    /** @type {string} */


    _createClass(AlloyCompiler, [{
        key: 'suppressAlloyLog',


        /**
         * suppress normal log in alloy compilation
         */
        value: function suppressAlloyLog() {
            var alloyLogger = require('alloy/Alloy/logger');
            alloyLogger.logLevel = alloyLogger.WARN;
        }

        /**
         * suppress process being killed
         */

    }, {
        key: 'suppressAlloyDeath',
        value: function suppressAlloyDeath() {
            var alloyUtils = require('alloy/Alloy/utils');
            alloyUtils.die = function (str) {
                throw new Error(str);
            };
        }

        /**
         * @param {string} path
         * @param {string} token identifier for this compilation
         * @return {Promise<boolean>} compilation succeeded or not
         */

    }, {
        key: 'compile',
        value: function compile(path, token) {
            var _this = this;

            var compilation = void 0;

            this.acState.started(token);

            switch (path) {
                case this.alloyJSPath:
                    compilation = this.compileAlloyJS();
                    break;
                case this.configPath:
                    compilation = this.compileConfig();
                    break;
                default:
                    compilation = this.compileFiles(path);
                    break;
            }

            return compilation.then(function (x) {
                return true;
            }, function (e) {
                return console.error('Alloy compilation failed.', e) || false;
            }).then(function (result) {
                return wait(500).then(function (x) {
                    // set some time lag for file watcher
                    _this.acState.finished(token);
                    return result;
                });
            });
        }

        /**
         * @return {Promise}
         * @todo change deploytype by input
         * @private
         */

    }, {
        key: 'compileAlloyJS',
        value: function compileAlloyJS() {
            var _this2 = this;

            return this.compileFiles(this.alloyJSPath).then(function () {

                var relPath = (0, _path.relative)(_this2.projDir, _this2.alloyJSPath);

                return (0, _optimizeAlloy2.default)(_this2.projDir, relPath, { platform: _this2.platform, deploytype: 'development' });
            });
        }

        /**
         * @return {Promise}
         * @todo specific compilation
         * @private
         */

    }, {
        key: 'compileConfig',
        value: function compileConfig() {
            return this.compileAlloyJS();
        }

        /**
         * @param {string} path
         * @return {Promise}
         * @private
         */

    }, {
        key: 'compileFiles',
        value: function compileFiles(path) {
            var relPath = (0, _path.relative)(this.projDir, path);
            ____('Start compilation: ' + relPath + '.');
            try {
                require('alloy/Alloy/commands/compile/index')([], { config: 'platform=' + this.platform + ',file=' + relPath });
                return Promise.resolve();
            } catch (e) {
                ___x(e);
                return Promise.reject(e);
            }
        }
    }, {
        key: 'alloyDir',
        get: function get() {
            return this.projDir + '/app';
        }

        /** @type {string} */

    }, {
        key: 'alloyJSPath',
        get: function get() {
            return this.alloyDir + '/alloy.js';
        }

        /** @type {string} */

    }, {
        key: 'configPath',
        get: function get() {
            return this.alloyDir + '/config.json';
        }

        /**
         * is alloy compiling
         * @type {boolean}
         */

    }, {
        key: 'compiling',
        get: function get() {
            return this.acState.compiling;
        }
    }]);

    return AlloyCompiler;
}();

exports.default = AlloyCompiler;