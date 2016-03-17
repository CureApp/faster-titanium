'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * shimming node.js module
 */

var Module = function () {
    function Module(moduleName) {
        _classCallCheck(this, Module);

        /** @type {string} */
        this.moduleName = moduleName;

        /** @type {Object} */
        this.exports = {};
    }

    /** @type {string} */


    _createClass(Module, [{
        key: '__dirname',
        get: function get() {
            if (this.moduleName === 'app') {
                return undefined;
            } // app.js doesn't have __dirname

            if (this.moduleName.match('/')) {
                return this.moduleName.replace(/\/[^\/]+$/, '');
            } else {
                return '.';
            }
        }

        /** @type {string} */

    }, {
        key: '__filename',
        get: function get() {
            if (this.moduleName === 'app') {
                return undefined;
            } // app.js doesn't have __filename

            return this.moduleName.split('/').pop();
        }
    }]);

    return Module;
}();

exports.default = Module;