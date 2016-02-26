'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

            return _ref2 = {}, _defineProperty(_ref2, AUTO_RELOAD, 'reload everytime a file changes'), _defineProperty(_ref2, AUTO_REFLECT, 'clear loaded modules in Titanium everytime a file changes (this may clear internal variables)'), _defineProperty(_ref2, MANUAL, 'do nothing'), _ref2;
        }
    }]);

    function Preferences() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Preferences);

        this.loadStyleNum = options.loadStyle || AUTO_RELOAD;
    }

    _createClass(Preferences, [{
        key: 'style',
        get: function get() {
            return this.constructor.expressions[this.loadStyleNum];
        }
    }]);

    return Preferences;
}();

exports.default = Preferences;