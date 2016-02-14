'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _acorn = require('acorn');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * parse original app.js and export variables to global
 */

var AppJsConverter = function () {

    /**
     * @param {string} code JS code
     */

    function AppJsConverter(code) {
        _classCallCheck(this, AppJsConverter);

        /** @type {string} code */
        this.code = code;

        /** @type {string[]} codeArr */
        this.codeArr = String(this.code).split('');
    }

    /**
     * convert varable declaration in top scope to this['varname'] expression
     *
     * before: var a, b = 12;
     * after : this['a'] = undefined; this['b'] = 12;
     *
     * @return {string} new code
     *
     */


    _createClass(AppJsConverter, [{
        key: 'convert',
        value: function convert() {
            var _this = this;

            (0, _acorn.parse)(this.code, { ranges: true, ecmaVersion: 5 }).body.filter(function (node) {
                return node.type === 'VariableDeclaration';
            }).map(function (vDeclaration) {

                var newCode = vDeclaration.declarations.map(function (declarator) {
                    var _code;

                    var expression = declarator.init ? (_code = _this.code).slice.apply(_code, _toConsumableArray(declarator.init.range)) : 'undefined';

                    return 'this[\'' + declarator.id.name + '\'] = ' + expression + ';';
                }).join(' ');

                return { newCode: newCode, range: vDeclaration.range };
            }).forEach(function (info) {
                _this.replace(info.newCode, info.range);
            });

            return this.codeArr.join('');
        }

        /**
         * @param {string} newCode
         * @param {number[]} range
         * @private
         */

    }, {
        key: 'replace',
        value: function replace(newCode, range) {

            var offset = range[0];

            this.codeArr[offset] = newCode;

            for (var i = offset + 1; i < range[1]; i++) {
                this.codeArr[i] = '';
            }
        }
    }]);

    return AppJsConverter;
}();

exports.default = AppJsConverter;