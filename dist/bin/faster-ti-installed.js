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
    log('checking if faster-titanium is installed in titanium hook...');
    var tiPath = which('titanium');
    if (!tiPath) {
        log('titanium command not found. Finish checking.');
        return;
    }

    var hookPath = (0, _path.resolve)(__dirname, '../../dist/hook/faster.js');
    var ticonf = JSON.parse(exec(tiPath + ' config -o json', { silent: true }).output);

    if (ticonf['paths.hooks'] && ticonf['paths.hooks'].indexOf(hookPath) >= 0) {
        log('faster-titanium is already installed in titanium hook.', 'green');
        return;
    }
    log('Not installed yet. Install with the following command.\n', 'yellow');
    log('faster-ti install');
}

if (require.main === module) run();