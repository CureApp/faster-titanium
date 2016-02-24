"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var wait = function wait(msec) {
    return new Promise(function (y) {
        return setTimeout(y, msec);
    });
};

var Main = function () {
    function Main() {
        _classCallCheck(this, Main);
    }

    _createClass(Main, [{
        key: 'init',
        value: function init() {
            window.addEventListener('load', this.showInfo.bind(this));
        }
    }, {
        key: 'showInfo',
        value: function showInfo() {
            fetch('/info').then(function (res) {
                return res.json();
            }).then(function (json) {
                var tableContent = Object.keys(json).map(function (k) {
                    return "<tr><td>" + k + "</td><td>" + json[k] + '</td></tr>';
                }).join('');

                document.getElementById('infoTableBody').innerHTML = tableContent;
            });
        }
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
    }, {
        key: 'disableButton',
        value: function disableButton() {
            // TODO
        }
    }]);

    return Main;
}();

window.main = new Main();
main.init();