'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.showLogo = showLogo;

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _fs = require('fs');

var _path = require('path');

var _mainProcess = require('../server/main-process');

var _mainProcess2 = _interopRequireDefault(_mainProcess);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = function log(str, color) {
    return console.log(color ? _chalk2.default[color](str) : str);
};

_commander2.default.arguments('[proj-dir]').option('-f, --fport <port number>', 'port number of the http server', parseInt).option('-n, --nport <port number>', 'port number of the notification server', parseInt).option('-p, --platform <platform name>', 'ios|android').option('-t, --token <token>', 'access token').parse(process.argv);

function run() {

    var projDir = _commander2.default.args[0];
    if (!projDir) return _commander2.default.help();

    var hasOptions = ['fport', 'nport', 'platform', 'token'].every(function (opt) {
        var hasValue = _commander2.default[opt] != null;
        return hasValue || log('"' + opt + '" option wasn\'t passed.', 'yellow');
    });
    if (!hasOptions) return _commander2.default.help();

    var opts = {
        fPort: _commander2.default.fport,
        nPort: _commander2.default.nport,
        host: 'localhost',
        platform: _commander2.default.platform,
        token: _commander2.default.token
    };

    var absProjDir = absolutePath(projDir);

    if (!isDirectory(absProjDir)) {
        log(absProjDir + ' is not a valid directory.', 'red');
        _commander2.default.help();
        return;
    }

    showLogo();

    var ftProcess = new _mainProcess2.default(absProjDir, opts);

    ftProcess.launchServers();
    ftProcess.run();
    log('FasterTitanium successfully launched.', 'green');
    log('\thttp server url: ' + ftProcess.url, 'green');
    log('\tproject dir: ' + ftProcess.projDir, 'green');
    log('\tplatform: ' + ftProcess.platform, 'green');
    log('\tnotification server port: ' + ftProcess.nPort, 'green');
    log('\taccess token: ' + ftProcess.token, 'green');
}

function showLogo() {
    log((0, _fs.readFileSync)(__dirname + '/../../doc/txt-logo', 'utf8'), 'green');

    var _require = require(__dirname + '/../../package.json');

    var version = _require.version;
    var author = _require.author;

    log('\tFasterTitanium ' + version + ' by ' + author + ' Accelerate Titanium development.\n', 'green');
}

/**
 * @param {string}
 * @return {string}
 */
function absolutePath(relPath) {
    if (relPath.charAt(0) === '/') return (0, _path.resolve)(relPath);
    return (0, _path.resolve)(process.cwd(), relPath);
}

/**
 * @param {string}
 * @return {boolean}
 */
function isDirectory(dir) {
    try {
        return (0, _fs.statSync)(dir).isDirectory;
    } catch (e) {
        return false;
    }
}

if (require.main === module) run();