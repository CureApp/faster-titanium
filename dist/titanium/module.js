"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = function Module(moduleName) {
    _classCallCheck(this, Module);

    /** @type {string} */
    this.moduleName = moduleName;

    /** @type {Object} */
    this.exports = {};
};

exports.default = Module;