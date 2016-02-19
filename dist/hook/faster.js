'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.init = init;
exports.attachFasterFlag = attachFasterFlag;
exports.renameAppJS = renameAppJS;
exports.addFasterTitanium = addFasterTitanium;
exports.launchServer = launchServer;
exports.getAddress = getAddress;
exports.multiplyRegistered = multiplyRegistered;

var _path = require('path');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _mainProcess = require('../server/main-process');

var _mainProcess2 = _interopRequireDefault(_mainProcess);

var _util = require('../util');

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

    if (multiplyRegistered.call(scope)) {
        logger.warn('[FasterTitanium] hook registration duplicated. Suppressed one: ' + __filename);
        return;
    }

    var hooks = {

        'build.android.config': attachFasterFlag.bind(scope),
        'build.ios.config': attachFasterFlag.bind(scope),

        'build.ios.copyResource': { pre: renameAppJS.bind(scope) },
        'build.android.copyResource': { pre: renameAppJS.bind(scope) },

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
 * 1. rename app.js => original-app.js
 * 2. write new app.js
 * 3. require faster-titanium and run in app.js
 * @private (export for test)
 */
function renameAppJS(data) {
    var _cli$argv = this.cli.argv;
    var faster = _cli$argv.faster;
    var projectDir = _cli$argv['project-dir'];

    if (!faster) return;

    var _data$args = _slicedToArray(data.args, 2);

    var src = _data$args[0];
    var dest = _data$args[1];


    if (!(0, _util.isAppJS)(projectDir, src)) return;

    var destDir = (0, _path.dirname)(dest);

    this.logger.info('[FasterTitanium] rename app.js into original-app.js');
    data.args[1] = destDir + '/original-app.js';

    writeNewAppJS.call(this, dest);
    addFasterTitanium.call(this, destDir);
}

/**
 * write new app.js
 */
function writeNewAppJS(dest) {
    var _cli$argv2 = this.cli.argv;
    var fPort = _cli$argv2['faster-port1'];
    var ePort = _cli$argv2['faster-port2'];

    var opts = JSON.stringify({
        fPort: parseInt(fPort, 10),
        ePort: parseInt(ePort, 10),
        host: this.host
    });

    this.logger.info('[FasterTitanium] call faster-titanium with host: ' + this.host + ', fPort: ' + fPort + ', ePort: ' + ePort + ' in app.js');

    var newAppJS = 'require(\'faster-titanium/index\').run(this, ' + opts + ')';
    (0, _fs.writeFileSync)(dest, newAppJS);
}

/**
 * copy dist/titanium/* => (dest-dir)/faster-titanium/*
 * @private (export for test)
 */
function addFasterTitanium(destDir) {
    var _this = this;

    var srcDir = (0, _path.resolve)(__dirname, '../../', 'dist/titanium');
    destDir += '/faster-titanium';
    if (!(0, _fs.existsSync)(destDir)) {
        (0, _fs.mkdirSync)(destDir);
    }
    this.logger.warn(destDir);

    (0, _fs.readdirSync)(srcDir).forEach(function (file) {
        _this.logger.info('[FasterTitanium] add faster-titanium/' + file);
        (0, _fs.writeFileSync)((0, _path.join)(destDir, file), (0, _fs.readFileSync)((0, _path.join)(srcDir, file)));
    });
}

/**
 * launch file/event servers to communicate with App
 */
function launchServer(data) {
    var _this2 = this;

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

    new _mainProcess2.default(projectDir, optsForServer).start().then(function (x) {
        console.log('\n\n                Access to FasterTitanium Web UI\n                http://' + _this2.host + ':' + fPort + '/\n\n            ');
    });
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

/**
 * check duplication of hook registration
 */
function multiplyRegistered() {
    var registered = !!this.config['faster-titanium'];
    this.config['faster-titanium'] = true;
    return registered;
}