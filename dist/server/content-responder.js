'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _fs = require('fs');

var _browserify = require('browserify');

var _browserify2 = _interopRequireDefault(_browserify);

var _responseInfo = require('./response-info');

var _responseInfo2 = _interopRequireDefault(_responseInfo);

var _resourceLoader = require('./resource-loader');

var _resourceLoader2 = _interopRequireDefault(_resourceLoader);

var _appJsConverter = require('./app-js-converter');

var _appJsConverter2 = _interopRequireDefault(_appJsConverter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * return Promise of ResponseInfo by URL
 */

var ContentResponder = function () {
    function ContentResponder() {
        _classCallCheck(this, ContentResponder);
    }

    _createClass(ContentResponder, [{
        key: 'respond',


        /**
         * create ResponseInfo
         * @param {string|Buffer} content
         * @param {string} [contentType=text/plain]
         * @param {number} [statusCode=200]
         * @return {Promise<ResponseInfo>}
         */
        value: function respond(content, contentType, statusCode) {
            return Promise.resolve(new _responseInfo2.default(content, contentType, statusCode));
        }

        /**
         * create ResponseInfo of JSON
         * @param {Object} obj
         * @param {string} [contentType=application/json]
         * @param {number} [statusCode=200]
         * @return {Promise<ResponseInfo>}
         */

    }, {
        key: 'respondJSON',
        value: function respondJSON(obj) {
            var contentType = arguments.length <= 1 || arguments[1] === undefined ? 'application/json' : arguments[1];
            var statusCode = arguments[2];

            return this.respond(JSON.stringify(obj), contentType, statusCode);
        }

        /**
         * create ResponseInfo of file
         * @param {string} path
         * @param {string} [contentType=text/plain]
         * @param {number} [statusCode=200]
         * @return {Promise<ResponseInfo>}
         */

    }, {
        key: 'respondFile',
        value: function respondFile(path, contentType, statusCode) {
            var _this = this;

            return new Promise(function (y, n) {
                (0, _fs.readFile)(path, 'utf8', function (e, o) {
                    return e ? n(e) : y(o);
                });
            }).then(function (content) {
                return _this.respond(content, contentType, statusCode);
            });
        }

        /**
         * create ResponseInfo of NOT FOUND
         * @param {string} url
         * @return {Promise<ResponseInfo>}
         */

    }, {
        key: 'notFound',
        value: function notFound(url) {
            return this.respond('404 not found: ' + url, 'text/plain', 404);
        }

        /**
         * load web/index.html
         * @return {Promise<ResponseInfo>}
         */

    }, {
        key: 'webUI',
        value: function webUI() {
            return this.respondFile(__dirname + '/../../web/index.html', 'text/html');
        }

        /**
         * load dist/web/main.js after bundling by browserify
         * @return {Promise<ResponseInfo>}
         * @todo cache the result
         */

    }, {
        key: 'webJS',
        value: function webJS() {
            var _this2 = this;

            var mainJSPath = (0, _path.resolve)(__dirname, '../../dist/web/main.js');
            return this.bundle(mainJSPath).then(function (buf) {
                return _this2.respond(buf, 'text/javascript');
            });
        }
    }, {
        key: 'bundle',
        value: function bundle(file, options) {
            return new Promise(function (y, n) {
                (0, _browserify2.default)(file, options).bundle(function (e, o) {
                    return e ? n(e) : y(o);
                });
            });
        }

        /**
         * load a file in Resources directory
         * @param {string} url
         * @param {string} projDir
         * @param {string} platform
         * @return {Promise<ResponseInfo>}
         */

    }, {
        key: 'resource',
        value: function resource(url, projDir, platform) {

            var content = new _resourceLoader2.default(url, projDir, platform).content;
            if (content === null) {
                return this.notFound(url);
            }

            /**
             * In app.js, top variables are exported as global variables.
             * Thus, AppJsConverter converts the code as such.
             * TODO Caches the result.
             */
            if (url === '/app.js') {
                content = new _appJsConverter2.default(content).convert();
            }

            return this.respond(content);
        }
    }]);

    return ContentResponder;
}();

exports.default = ContentResponder;