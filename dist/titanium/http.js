'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = function ____(v) {
    return console.log('[Faster-Titanium:Http]', v);
};

var Http = function () {
    function Http() {
        _classCallCheck(this, Http);
    }

    _createClass(Http, null, [{
        key: 'get',
        value: function get(url) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var timeout = options.timeout;

            var timestamp = new Date().getTime();

            var proxy = Ti.Network.createHTTPClient();
            proxy.open('GET', url);

            Object.keys(options.header || {}).forEach(function (key) {
                proxy.setRequestHeader(key, options.header[key]);
            });

            proxy.send();

            var result = null;

            while (true) {
                if (proxy.readyState === 4) {
                    if (proxy.status == 200) {
                        result = proxy.responseText;
                        break;
                    }
                    throw new Error('[HTTP GET] status:' + proxy.status + '\n ' + proxy.responseText);
                }

                if (new Date().getTime() - timestamp > timeout) {
                    throw new Error('[HTTP GET] request timed out: ' + url);
                }
            }
            return result;
        }
    }]);

    return Http;
}();

exports.default = Http;