'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Logger titanium logs into server console
 */

var TiLog = function () {
    function TiLog() {
        _classCallCheck(this, TiLog);
    }

    _createClass(TiLog, null, [{
        key: 'log',
        value: function log(args, options) {
            this.__base('INFO', '', '', args, options);
        }
    }, {
        key: 'info',
        value: function info(args, options) {
            this.__base('INFO', '', '', args, options);
        }
    }, {
        key: 'warn',
        value: function warn(args, options) {
            this.__base('WARN', '\u001b[33m', '\u001b[0m', args, options);
        }
    }, {
        key: 'debug',
        value: function debug(args, options) {
            this.__base('DEBUG', '\x1b[38;5;240m', '\x1b[0m', args, options);
        }
    }, {
        key: 'trace',
        value: function trace(args, options) {
            this.__base('TRACE', '\x1b[38;5;233m', '\x1b[0m', args, options);
        }
    }, {
        key: 'error',
        value: function error(args, options) {
            this.__base('ERROR', '\u001b[31m', '\u001b[0m', args, options);
        }
    }, {
        key: 'critical',
        value: function critical(args, options) {
            this.__base('CRITICAL', '\u001b[31m', '\u001b[0m', args, options);
        }
    }, {
        key: '__base',
        value: function __base(name, startANSI, endANSI, args) {
            var options = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
            var time = options.time;
            var debugname = options.debugname;

            var title = debugname ? debugname + ':' + name : name;

            var consoleArgs = [startANSI + ('[Ti:' + title + ']')].concat(_toConsumableArray(args));

            if (time) {
                var timediff = new Date().getTime(time) - new Date().getTime();
                if (timediff < 0) consoleArgs.push('\u001b[36m' + timediff + 'ms\u001b[0m'); // cyan
            }
            if (endANSI) consoleArgs.push(endANSI);

            console.log.apply(console, consoleArgs);
        }
    }]);

    return TiLog;
}();

exports.default = TiLog;