"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _socket = require('./socket');

var _socket2 = _interopRequireDefault(_socket);

var _requireAgent = require('./require-agent');

var _requireAgent2 = _interopRequireDefault(_requireAgent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = function ____(v) {
    return console.log('[Faster-Titanium]', v);
};

var FasterTitanium = function () {
    _createClass(FasterTitanium, null, [{
        key: 'run',
        value: function run() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            return new FasterTitanium(options);
        }
    }]);

    function FasterTitanium() {
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, FasterTitanium);

        var _options$fPort = options.fPort;
        var fPort = _options$fPort === undefined ? 4157 : _options$fPort;
        var _options$ePort = options.ePort;
        var ePort = _options$ePort === undefined ? 4156 : _options$ePort;
        var _options$host = options.host;
        var host = _options$host === undefined ? 'localhost' : _options$host;


        this.reqAgent = new _requireAgent2.default(host, fPort, this.getPlatform());

        var socket = new _socket2.default({ host: host, port: parseInt(ePort, 10) });

        socket.onData(function (payload) {
            socket.end();
            _this.reload();
        });

        this.reqAgent.require('second-entry-after-faster-titanium');
    }

    /**
     * @returns {string}
     */


    _createClass(FasterTitanium, [{
        key: 'getPlatform',
        value: function getPlatform() {
            return Ti.Platform.osname;
        }

        /**
         * reload this app
         */

    }, {
        key: 'reload',
        value: function reload() {
            try {
                ____('reloading app');
                Ti.App._restart();
            } catch (e) {
                ____('reloading App via legacy method');
                this.reqAgent.require('app');
            }
        }
    }]);

    return FasterTitanium;
}();

exports.default = FasterTitanium;


if (typeof Ti !== 'undefined') Ti.FasterTitanium = FasterTitanium;