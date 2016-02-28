'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = function ____(v) {
    var type = arguments.length <= 1 || arguments[1] === undefined ? 'log' : arguments[1];
    return console[type]('[FasterTitanium:AlloyCompilationState]', v);
};

/**
 * Memorize alloy compilation state (start/finish)
 */

var AlloyCompilationState = function () {
    function AlloyCompilationState() {
        var timeout = arguments.length <= 0 || arguments[0] === undefined ? 5000 : arguments[0];

        _classCallCheck(this, AlloyCompilationState);

        if (timeout === false) {
            timeout = 1000 * 3600 * 24; // 1day (= never called)
        }
        this.tokens = {};
        this.timeout = timeout;
    }

    /**
     * memorize start of alloy compilation
     * @param {string} token identifier
     */


    _createClass(AlloyCompilationState, [{
        key: 'started',
        value: function started(token) {
            var _this = this;

            var timer = setTimeout(function (x) {

                ____('Compilation timed out after ' + _this.timeout + 'msec. token=' + token);
                delete _this.tokens[token];
            }, this.timeout);

            this.tokens[token] = timer;
        }

        /**
         * clear alloy compilation memory
         * @param {string} token identifier
         */

    }, {
        key: 'finished',
        value: function finished(token) {
            if (this.tokens[token]) {
                clearTimeout(this.tokens[token]);
                delete this.tokens[token];
            }
        }

        /**
         * is alloy compiling
         * @type {boolean}
         */

    }, {
        key: 'compiling',
        get: function get() {
            return Object.keys(this.tokens).length > 0;
        }
    }]);

    return AlloyCompilationState;
}();

exports.default = AlloyCompilationState;