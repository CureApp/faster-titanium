'use strict';

require('shelljs/global');

var _path = require('path');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = function log(str, color) {
    return console.log(color ? _chalk2.default[color](str) : str);
};

function run() {
    log('begin uninstalling faster-titanium');
    var tiPath = which('titanium');
    if (!tiPath) {
        log('titanium command not found. Finish installation.', 'red');
        return;
    }

    var hookPath = (0, _path.resolve)(__dirname, '../../dist/hook/faster.js');
    var result = exec(tiPath + ' -q config paths.hooks -r ' + hookPath);

    if (result.code) {
        log('Uninstall failed.', 'red');
        console.log(result);
    } else {
        log('Uninstall succeeded.', 'green');
    }
}

if (require.main === module) run();