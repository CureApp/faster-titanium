'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AUTO_RELOAD = 1;
var AUTO_REFLECT = 2;
var MANUAL = 3;

var Preferences = function () {
    _createClass(Preferences, null, [{
        key: 'selections',
        get: function get() {
            return {
                AUTO_RELOAD: AUTO_RELOAD,
                AUTO_REFLECT: AUTO_REFLECT,
                MANUAL: MANUAL
            };
        }
    }, {
        key: 'expressions',
        get: function get() {
            var _ref;

            return _ref = {}, _defineProperty(_ref, AUTO_RELOAD, 'auto-reload'), _defineProperty(_ref, AUTO_REFLECT, 'auto-reflect'), _defineProperty(_ref, MANUAL, 'manual'), _ref;
        }
    }, {
        key: 'descriptions',
        get: function get() {
            var _ref2;

            return _ref2 = {}, _defineProperty(_ref2, AUTO_RELOAD, 'Reload everytime a file changes.'), _defineProperty(_ref2, AUTO_REFLECT, 'Clear loaded modules in Titanium everytime a file changes (this may clear internal variables).'), _defineProperty(_ref2, MANUAL, 'Do nothing.'), _ref2;
        }
    }]);

    function Preferences() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Preferences);

        var _options$loadStyleNum = options.loadStyleNum;
        var loadStyleNum = _options$loadStyleNum === undefined ? AUTO_RELOAD : _options$loadStyleNum;
        var _options$tiDebug = options.tiDebug;
        var tiDebug = _options$tiDebug === undefined ? false : _options$tiDebug;
        var _options$serverLog = options.serverLog;
        var serverLog = _options$serverLog === undefined ? true : _options$serverLog;
        var _options$localLog = options.localLog;
        var localLog = _options$localLog === undefined ? false : _options$localLog;

        /** @type {number} load style type */

        this.loadStyleNum = loadStyleNum;
        /** @type {boolean} whether to show titanium log in server console */
        this.tiDebug = tiDebug;
        /** @type {boolean} whether to show titanium log in server console */
        this.serverLog = serverLog;
        /** @type {boolean} whether to show titanium log in titanium console */
        this.localLog = localLog;
    }

    _createClass(Preferences, [{
        key: 'apply',
        value: function apply() {
            var _this = this;

            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            Object.keys(this).forEach(function (key) {
                var newValue = params[key];
                if ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === _typeof(_this[key])) _this[key] = newValue;
            });
        }
    }, {
        key: 'tiDebugNum',
        get: function get() {
            return Number(this.tiDebug);
        }
    }, {
        key: 'style',
        get: function get() {
            return this.constructor.expressions[this.loadStyleNum];
        }
    }]);

    return Preferences;
}();

exports.default = Preferences;