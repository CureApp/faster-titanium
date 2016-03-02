'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * value object containing statusCode, contentType, content
 */

var ResponseInfo = function ResponseInfo() {
    var content = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var contentType = arguments.length <= 1 || arguments[1] === undefined ? 'text/plain' : arguments[1];
    var statusCode = arguments.length <= 2 || arguments[2] === undefined ? 200 : arguments[2];

    _classCallCheck(this, ResponseInfo);

    this.content = content;
    this.contentType = contentType;
    this.statusCode = statusCode;
};

exports.default = ResponseInfo;