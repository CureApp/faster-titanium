'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = _logger2.default.debug('AlertDialogReplacer');

/**
 * Overwrite Ti.UI.createAlertDialog and hide them before restarting the app.
 */

var AlertDialogReplacer = function () {
    function AlertDialogReplacer() {
        _classCallCheck(this, AlertDialogReplacer);
    }

    _createClass(AlertDialogReplacer, null, [{
        key: 'init',


        /**
         * virtual constructor for this singleton class
         */
        value: function init() {
            this.dialogs = [];
            this.replace();
        }

        /**
         * Hide alert dialogs
         * @param {function} cb callback called after hiding dialogs
         * @param {number} timer interval to call callback
         */

    }, {
        key: 'hide',
        value: function hide(cb, timer) {
            if (this.dialogs.length > 0) {
                timer = Math.max(500, timer);
            }

            ____('Hiding ' + this.dialogs.length + ' dialogs before restarting app.', 'debug');
            this.dialogs.forEach(function (d) {
                return d.hide();
            });

            ____('Restart procedure will be occurred after ' + timer + 'ms.', 'debug');
            setTimeout(cb, timer);
        }

        /**
         * Replace Ti.UI.createAlertDialog
         * Store created dialogs
         */

    }, {
        key: 'replace',
        value: function replace() {
            var _this = this;

            var orig = Ti.createAlertDialog;

            Ti.UI.createAlertDialog = function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var dialog = orig.apply(Ti.UI, args);
                ____('Dialog is created.', 'debug');
                _this.dialogs.push(dialog);
                return dialog;
            };
        }

        /**
         * global alert function, replaced in RequireAgent
         * @param {string}
         */

    }, {
        key: 'alert',
        value: function alert(message) {
            Ti.UI.createAlertDialog({ message: message }).show();
        }
    }]);

    return AlertDialogReplacer;
}();

exports.default = AlertDialogReplacer;