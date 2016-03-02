'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = postPreferences;
function postPreferences() {
    var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


    return fetch('/prefs', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    }).then(function (res) {
        return res.json();
    });
}