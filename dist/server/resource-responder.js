"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _fs = require('fs');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Get contents of Titanium Resources
 */

var ResourceResponder = function () {

    /**
     * @param {string} projDir
     * @param {string} url
     * @param {string} platform
     */

    function ResourceResponder(projDir, url, platform) {
        _classCallCheck(this, ResourceResponder);

        this.projDir = projDir;
        this.url = url;
        this.platform = platform;
    }

    /** @type {Object} */


    _createClass(ResourceResponder, [{
        key: 'header',
        get: function get() {
            if (this.exists) {
                return { statusCode: 200, contentType: 'text/plain' }; // TODO change contentType by file type
            }
            return { statusCode: 404, contentType: 'text/plain' };
        }

        /** @type {Buffer} */

    }, {
        key: 'content',
        get: function get() {
            if (this.exists) {
                return (0, _fs.readFileSync)(this.path); // TODO cache results
            }
            return '404 Not Found. path = ' + this.path;
        }

        /** @type {string} */

    }, {
        key: 'path',
        get: function get() {
            return this.platform ? (0, _path.join)(this.projDir, 'Resources', this.platform, this.url) : (0, _path.join)(this.projDir, 'Resources', this.url);
        }

        /** @type {boolean} */

    }, {
        key: 'exists',
        get: function get() {
            return (0, _fs.existsSync)(this.path); // TODO cache results
        }
    }]);

    return ResourceResponder;
}();

exports.default = ResourceResponder;