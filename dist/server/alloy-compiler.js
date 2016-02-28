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
    }

    /** @type {string} */


    _createClass(AlloyCompiler, [{
        key: 'compile',


        /**
         * @param {string} path
         * @param {string} token identifier for this compilation
         * @return {Promise<string>}
         */
        value: function compile(path, token) {
            var _this = this;

            var compilation = undefined;

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

            return compilation.catch(___x).then(function (x) {
                return wait(200);
            }) // set some time lag for file watcher
            .then(function (x) {
                return _this.acState.finished(token);
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
            var _this3 = this;

            var relPath = (0, _path.relative)(this.projDir, path);
            var command = alloyPath + ' compile --config platform=' + this.platform + ',file=' + relPath;
            ___o(command);
            return P(function (y) {
                return (0, _child_process.exec)(command, { cwd: _this3.projDir }, y);
            });
        }

        /**
         * compile all files
         * @deprecated
         * @private
         */

    }, {
        key: 'compileAll',
        value: function compileAll() {
            var _this4 = this;

            var command = alloyPath + ' compile --config platform=' + this.platform;
            ___o(command);
            return P(function (y) {
                return (0, _child_process.exec)(command, { cwd: _this4.projDir }, y);
            });
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