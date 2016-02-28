"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * handles state of Root component
 */

var GlobalState = function () {
    _createClass(GlobalState, null, [{
        key: "initialize",
        value: function initialize(root) {
            GlobalState.instance = new GlobalState(root);
        }
    }, {
        key: "set",
        value: function set() {
            var _GlobalState$instance;

            (_GlobalState$instance = GlobalState.instance).set.apply(_GlobalState$instance, arguments);
        }
    }]);

    function GlobalState(root) {
        _classCallCheck(this, GlobalState);

        this.root = root;
        this.state = clone(this.root.state);
    }

    /**
     * set(k1, k2, k3, v) => state[k1][k2][k3] = v
     */


    _createClass(GlobalState, [{
        key: "set",
        value: function set() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var value = args.pop();
            var lastKey = args.pop();
            var obj = args.reduce(function (obj, k) {
                return obj[k];
            }, this.state);
            obj[lastKey] = value;
            this.root.setState(clone(this.state));
        }
    }]);

    return GlobalState;
}();

exports.default = GlobalState;


function clone(obj) {
    return JSON.parse(JSON.stringify(obj)); // todo: better implementation like Immutable.js
}