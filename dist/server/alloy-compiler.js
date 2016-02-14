'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _path = require('path');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var alloyPath = (0, _path.resolve)(__dirname, '../../node_modules/.bin/alloy');
var P = function P(f) {
    return new Promise(f);
};
var ____ = (0, _debug2.default)('faster-titanium:AlloyCompiler');
var ___o = function ___o(v) {
    return ____(v) || v;
};

/**
 * compiling alloy files
 */

var AlloyCompiler = function () {

    /**
     * @param {string} projDir
     */

    function AlloyCompiler(projDir) {
        _classCallCheck(this, AlloyCompiler);

        /** @type {string} */
        this.projDir = projDir;
    }

    /** @type {string} */


    _createClass(AlloyCompiler, [{
        key: 'compile',


        /**
         * @param {string} path
         * @return {Promise}
         */
        value: function compile(path) {

            if (path === this.alloyJSPath) return this.compileAlloyJS();

            if (path === this.configPath) return this.compileConfig();

            return this.compileFiles(path);
        }

        /**
         * @return {Promise}
         * @todo specific compilation
         */

    }, {
        key: 'compileAlloyJS',
        value: function compileAlloyJS() {
            return this.compileAll();
        }

        /**
         * @return {Promise}
         * @todo specific compilation
         */

    }, {
        key: 'compileConfig',
        value: function compileConfig() {
            return this.compileAll();
        }

        /**
         * @param {string} path
         * @return {Promise}
         */

    }, {
        key: 'compileFiles',
        value: function compileFiles(path) {

            var relPath = (0, _path.relative)(this.projDir, path);

            return Promise.all(this.platforms.map(function (os) {
                return alloyPath + ' compile --config platform=' + os + ',file=' + relPath;
            }).map(___o).map(function (command) {
                return P(function (y) {
                    return (0, _child_process.exec)(command, y);
                });
            }));
        }

        /**
         * compile all files
         */

    }, {
        key: 'compileAll',
        value: function compileAll() {
            return Promise.all(this.platforms.map(function (os) {
                return alloyPath + ' compile --config platform=' + os;
            }).map(___o).map(function (command) {
                return P(function (y) {
                    return (0, _child_process.exec)(command, y);
                });
            }));
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
         * @type {string[]}
         * @todo put all platforms
         */

    }, {
        key: 'platforms',
        get: function get() {
            return ['ios', 'android'];
        }
    }]);

    return AlloyCompiler;
}();

exports.default = AlloyCompiler;