"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _fs = require('fs');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _util = require('../common/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = (0, _debug2.default)('faster-titanium:ResourceLoader');
var ___x = (0, _debug2.default)('faster-titanium:ResourceLoader:error');

/**
 * Get contents of Titanium Resources
 */

var ResourceLoader = function () {

    /**
     * @param {string} url
     * @param {string} projDir
     * @param {string} platform
     */

    function ResourceLoader(url, projDir, platform) {
        _classCallCheck(this, ResourceLoader);

        /** @type {string} */
        this.projDir = projDir;
        /** @type {string} */
        this.platformDirname = (0, _util.getPlatformDirname)(platform);
        /** @type {string} */
        this.url = url;
    }

    /** @type {Buffer} */


    _createClass(ResourceLoader, [{
        key: 'load',
        value: function load(path) {
            if ((0, _fs.existsSync)(path)) {
                ____('path: ' + path);
                return (0, _fs.readFileSync)(path); // TODO cache results
            }
            return null;
        }
    }, {
        key: 'content',
        get: function get() {
            return this.load(this.platformPath) || this.load(this.commonPath) || null;
        }
    }, {
        key: 'platformPath',
        get: function get() {
            return (0, _path.join)(this.projDir, 'Resources', this.platformDirname, this.url);
        }
    }, {
        key: 'commonPath',
        get: function get() {
            return (0, _path.join)(this.projDir, 'Resources', this.url);
        }

        /** @type {boolean} */

    }, {
        key: 'exists',
        get: function get() {
            return (0, _fs.existsSync)(this.path); // TODO cache results
        }
    }]);

    return ResourceLoader;
}();

exports.default = ResourceLoader;