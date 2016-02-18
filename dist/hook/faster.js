'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.init = init;
exports.attachFasterFlag = attachFasterFlag;
exports.modifyEntryName = modifyEntryName;
exports.createAppJS = createAppJS;
exports.launchServer = launchServer;
exports.getAddress = getAddress;

var _path = require('path');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _mainProcess = require('../server/main-process');

var _mainProcess2 = _interopRequireDefault(_mainProcess);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * attach cli hooks to titanium CLI
 * this function must be named "init"
 *
 * ti build --faster [--faster-port1 4157] [--faster-port2 4156]
 * @public
 */
function init(logger, config, cli) {

    var scope = { logger: logger, config: config, cli: cli, host: getAddress() };

    var hooks = {

        'build.android.config': attachFasterFlag.bind(scope),
        'build.ios.config': attachFasterFlag.bind(scope),

        'build.ios.copyResource': { pre: modifyEntryName.bind(scope) },
        'build.android.copyResource': { pre: modifyEntryName.bind(scope) },

        'build.post.compile': launchServer.bind(scope)
    };

    Object.keys(hooks).forEach(function (hookName) {
        return cli.addHook(hookName, hooks[hookName]);
    });
}

/**
 * attach --faster flag
 * @private (export for test)
 */
function attachFasterFlag(data) {
    var _data$result$ = data.result[1];
    var flags = _data$result$.flags;
    var options = _data$result$.options;


    flags.faster = { default: false, desc: 'enables faster rebuilding' };
    options['faster-port1'] = { default: 4157, desc: 'port number of http server for faster-titanium' };
    options['faster-port2'] = { default: 4156, desc: 'port number of tcp server for faster-titanim' };
}

/**
 * app.js => second-entry-after-faster-titanium.js
 * @private (export for test)
 */
function modifyEntryName(data) {
    var _cli$argv = this.cli.argv;
    var projectDir = _cli$argv['project-dir'];
    var faster = _cli$argv.faster;

    if (!faster) return;

    var _data$args = _slicedToArray(data.args, 2);

    var src = _data$args[0];
    var dist = _data$args[1];

    var isAppJS = ['', 'android', 'ipad', 'iphone', 'ios'].map(function (name) {
        return (0, _path.join)(projectDir, 'Resources', name, 'app.js');
    }).some(function (path) {
        return src === path;
    });

    if (!isAppJS) return;

    var newname = 'second-entry-after-faster-titanium.js';

    this.logger.info('[FasterTitanium] Renaming original ' + src + ' to ' + newname);

    data.args[1] = (0, _path.join)((0, _path.dirname)(dist), newname); // modify distination

    createAppJS.call(this, dist);
}

/**
 * faster-titanium => app.js
 * @private (export for test)
 */
function createAppJS(dist) {
    var _cli$argv2 = this.cli.argv;
    var fPort = _cli$argv2['faster-port1'];
    var ePort = _cli$argv2['faster-port2'];


    var optsForFasterTi = {
        fPort: parseInt(fPort, 10),
        ePort: parseInt(ePort, 10),
        host: this.host
    };
    var codeToRun = '(function(g){Ti.FasterTitanium.run(g, ' + JSON.stringify(optsForFasterTi) + ')})(this)';

    var appJSPath = (0, _path.resolve)(__dirname, '../../dist/app.js');
    var appJSCode = [(0, _fs.readFileSync)(appJSPath, 'utf8'), codeToRun].join('\n');

    this.logger.info('[FasterTitanium] Creating new app.js with host: ' + this.host + ', fPort: ' + fPort + ', ePort: ' + ePort);

    (0, _fs.writeFileSync)(dist, appJSCode);
}

/**
 * launch file/event servers to communicate with App
 */
function launchServer(data) {
    var _cli$argv3 = this.cli.argv;
    var faster = _cli$argv3.faster;
    var projectDir = _cli$argv3['project-dir'];
    var fPort = _cli$argv3['faster-port1'];
    var ePort = _cli$argv3['faster-port2'];

    if (!faster) return;

    var optsForServer = {
        fPort: parseInt(fPort, 10),
        ePort: parseInt(ePort, 10),
        host: this.host
    };

    new _mainProcess2.default(projectDir, optsForServer).start();
}

/**
 * @returns {string} IP Adress (v4)
 * @private (export for test)
 */
function getAddress() {

    var interfaces = _os2.default.networkInterfaces();

    for (var k in interfaces) {
        var itf = interfaces[k];
        for (var j in itf) {
            if (itf[j].family === 'IPv4' && !itf[j].internal) {
                return itf[j].address;
            }
        }
    }
    return 'localhost';
}