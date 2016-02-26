"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preferences = require('../common/preferences');

var _preferences2 = _interopRequireDefault(_preferences);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wait = function wait(msec) {
    return new Promise(function (y) {
        return setTimeout(y, msec);
    });
};

var arrow = '&nbsp;<i class="fa fa-arrow-circle-right"></i>';

var Main = function () {
    function Main() {
        _classCallCheck(this, Main);
    }

    _createClass(Main, [{
        key: 'init',
        value: function init() {
            window.addEventListener('load', this.showInfo.bind(this));
        }

        /**
         * show server information
         */

    }, {
        key: 'showInfo',
        value: function showInfo() {
            var _this = this;

            fetch('/info').then(function (res) {
                return res.json();
            }).then(function (json) {
                var tableContent = Object.keys(json).map(function (k) {
                    return '<tr><td>' + k + '</td>' + _this.infoValueTD(k, json[k]) + '</tr>';
                }).join('');

                document.getElementById('infoTableBody').innerHTML = tableContent;
            });
        }

        /**
         * prepare <td> tag for info value
         * @param {string} k key of info json
         * @param {string} v value of info json
         */

    }, {
        key: 'infoValueTD',
        value: function infoValueTD(k, v) {
            var modifiers = {
                'loading style': function loadingStyle(v) {
                    return '<td onClick="main.toggleSelectionModal()" id="loading-style-value">' + v + arrow;
                }
            };
            return modifiers[k] ? modifiers[k](v) : '<td>' + v + '</td>';
        }

        /**
         * show/hide the loading style selection modal
         * @param {Event} evt event object. If not given, toggle will be executed. Otherwise, toggling will be done only when evt.target is #overlay.
         */

    }, {
        key: 'toggleSelectionModal',
        value: function toggleSelectionModal(evt) {
            var el = document.getElementById('overlay');
            if (!evt || evt.target === el) {
                el.style.visibility = el.style.visibility == 'visible' ? 'hidden' : 'visible';
            }
        }

        /**
         * show information of the loading style on mouse
         * @param {string} index stringified number of Preferences
         */

    }, {
        key: 'showStyleDescription',
        value: function showStyleDescription(index) {
            var desc = _preferences2.default.descriptions[index];
            document.getElementById('loading-style-description').innerText = desc;
        }

        /**
         * reload the titanium app
         */

    }, {
        key: 'reload',
        value: function reload() {
            this.disableButton();
            fetch('/reload').then(function (res) {
                return res.text();
            }).then(function (text) {
                document.getElementById('notice').innerText = 'Now Reloading...';
                return wait(1500);
            }).then(function () {
                document.getElementById('notice').innerText = '';
            }).then(this.showInfo.bind(this));
        }

        /**
         * disable reload button in reloading
         * @todo implement
         */

    }, {
        key: 'disableButton',
        value: function disableButton() {}
        // TODO


        /**
         * send custom loading style name to the server
         */

    }, {
        key: 'changeLoadingStyle',
        value: function changeLoadingStyle() {
            var td = document.getElementById('loading-style-value');
            var val = document.querySelector('#overlay select').value;
            this.toggleSelectionModal();

            fetch('/loading-style/' + val).then(function (res) {
                return res.json();
            }).then(function (json) {
                return wait(300).then(function (x) {
                    td.innerHTML = json.expression + arrow;
                    td.classList.add('changed');
                    return wait(1000);
                });
            }).then(function (x) {
                return td.classList.remove('changed');
            });
        }
    }]);

    return Main;
}();

window.main = new Main();
main.init();