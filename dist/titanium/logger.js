'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var firstLoaded = new Date().getTime();

/**
 * Singleton class. Class itself has states.
 */

var Logger = function () {
    function Logger() {
        _classCallCheck(this, Logger);
    }

    _createClass(Logger, null, [{
        key: 'init',


        // pseudo constructor of this singleton.
        value: function init() {
            this.socket = null;
            this.queue = [];

            this.debugMode = false;
            this.localLog = false;
            this.serverLog = false;

            this.TiAPI = Ti.API;
            this.console = console;

            this.overwriteConsole();
        }
    }, {
        key: 'overwriteConsole',


        /**
         * overwrite Ti.API.* and console.*
         */
        value: function overwriteConsole() {
            var _this = this;

            try {
                (function () {
                    var API = {};

                    _this.severities.forEach(function (severity) {
                        var fn = _this.TiAPI[severity];
                        API[severity] = function () {
                            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                                args[_key] = arguments[_key];
                            }

                            _this.log(args, severity);
                        };
                    });
                    Ti.API = API;
                    console = API;
                })();
            } catch (e) {}
        }
    }, {
        key: 'log',
        value: function log(args, severity, options) {

            this.serverLog && this.sendToServer(args, severity, options);

            this.localLog && this.showLocalLog(args, severity, options);
        }
    }, {
        key: 'showLocalLog',
        value: function showLocalLog(args, severity) {
            var _TiAPI;

            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if (options.debugname) {
                args.unshift('[' + options.debugname + ']');
            }
            (_TiAPI = this.TiAPI)[severity].apply(_TiAPI, _toConsumableArray(args));
        }

        /**
         * @param {string} debugname
         */

    }, {
        key: 'debug',
        value: function debug(debugname) {
            var _this2 = this;

            return function (arg) {
                var severity = arguments.length <= 1 || arguments[1] === undefined ? 'info' : arguments[1];
                return _this2.debugMode && _this2.log([arg], severity, { debugname: debugname });
            };
        }

        /**
         * @param {Socket} socket
         */

    }, {
        key: 'serverLogEnabled',
        value: function serverLogEnabled(socket) {
            this.socket = socket;

            while (this.queue.length) {
                var _queue$shift = this.queue.shift();

                var args = _queue$shift.args;
                var severity = _queue$shift.severity;
                var options = _queue$shift.options;

                this.sendToServer(args, severity, options);
            }
        }
    }, {
        key: 'serverLogDisabled',
        value: function serverLogDisabled() {
            this.socket = null;
        }

        /**
         * send log to server via socket
         */

    }, {
        key: 'sendToServer',
        value: function sendToServer(args, severity) {
            var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            if (!this.socket) {
                options.time = new Date().toISOString();
                return this.queue.push({ args: args, severity: severity, options: options });
            }

            try {
                this.socket.send({ type: 'log', args: args, severity: severity, options: options });
            } catch (e) {
                this.console.warn('Couldn\'t send log to server. Socket is not writable.');
            }
        }
    }, {
        key: 'severities',
        get: function get() {
            return ['log', 'info', 'trace', 'warn', 'debug', 'critical', 'error'];
        }
    }]);

    return Logger;
}();

exports.default = Logger;