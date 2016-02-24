'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.init = init;
exports.attachFasterFlag = attachFasterFlag;
exports.launchServers = launchServers;
exports.getPorts = getPorts;
exports.manipulateAppJS = manipulateAppJS;
exports.getAddress = getAddress;
exports.multiplyRegistered = multiplyRegistered;

var _path = require('path');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _openport = require('openport');

var _openport2 = _interopRequireDefault(_openport);

var _mainProcess = require('../server/main-process');

var _mainProcess2 = _interopRequireDefault(_mainProcess);

var _util = require('../common/util');

var _browserify = require('browserify');

var _browserify2 = _interopRequireDefault(_browserify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * attach cli hooks to titanium CLI
 * this function must be named "init"
 *
 * ti build --faster [--ft-port 4157]
 * @public
 */
function init(logger, config, cli) {

    var scope = { logger: logger, config: config, cli: cli };

    if (multiplyRegistered.call(scope)) {
        logger.warn('[FasterTitanium] hook registration duplicated. Suppressed one: ' + __filename);
        return;
    }

    var hooks = [['build.config', attachFasterFlag.bind(scope)], ['build.pre.compile', launchServers.bind(scope)], // attaches scope.ftProcess

    // only ios and android have copyResource hook.
    ['build.ios.copyResource', { pre: manipulateAppJS.bind(scope) }], ['build.android.copyResource', { pre: manipulateAppJS.bind(scope) }], ['build.post.compile', startWatching.bind(scope)], ['build.post.compile', showServerInfo.bind(scope)]];

    hooks.forEach(function (args) {
        return cli.addHook.apply(cli, args);
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
    options['ft-port'] = { default: 4157, desc: 'port number for faster-titanium http server. If not available, use another open port.' };
}

/**
 * launch file/event servers to communicate with App
 */
function launchServers(data, finished) {
    var _this = this;

    var _cli$argv = this.cli.argv;
    var faster = _cli$argv.faster;
    var platform = _cli$argv.platform;
    var _cli$argv$ftPort = _cli$argv['ft-port'];
    var port = _cli$argv$ftPort === undefined ? 4157 : _cli$argv$ftPort;
    var projectDir = _cli$argv['project-dir'];

    if (!faster) return finished(null, data);

    return getPorts(port).then(function (ports) {

        var optsForServer = {
            platform: platform,
            fPort: ports[0],
            ePort: ports[1],
            host: getAddress()
        };
        _this.ftProcess = new _mainProcess2.default(projectDir, optsForServer);
        return _this.ftProcess.launchServers();
    }).then(function (x) {
        return finished(null, data);
    }, finished);
}

/**
 * @return {Promise}
 * @private
 */
function getPorts(defaultPort) {

    return new Promise(function (y, n) {

        _openport2.default.find({
            startingPort: defaultPort,
            count: 2
        }, function (err, ports) {
            return err ? n(err) : y(ports);
        });
    });
}

/**
 * original app.js => app.js with faster-titanium
 * @private (export for test)
 */
function manipulateAppJS(data, finished) {
    var _cli$argv2 = this.cli.argv;
    var faster = _cli$argv2.faster;
    var projectDir = _cli$argv2['project-dir'];

    if (!faster) return finished(null, data);

    var _data$args = _slicedToArray(data.args, 2);

    var src = _data$args[0];
    var dest = _data$args[1];


    if (!(0, _util.isAppJS)(projectDir, src)) return finished(null, data);

    var newSrc = (0, _path.dirname)(dest) + '/faster-titanium.js'; // new src path is in build dir, just because it's temporary.

    this.logger.info('[FasterTitanium] manipulating app.js: attaching faster-titanium functions');

    data.args[0] = newSrc;

    var _ftProcess = this.ftProcess;
    var fPort = _ftProcess.fPort;
    var ePort = _ftProcess.ePort;
    var host = _ftProcess.host;


    generateNewAppJS(fPort, ePort, host).then(function (code) {
        (0, _fs.writeFileSync)(newSrc, code);
        finished(null, data);
    }).catch(function (e) {
        return finished(e);
    });
}

/**
 * Generate new app.js code.
 * New app.js consists of bundled lib of faster-titanium and one line initializer
 */
function generateNewAppJS(fPort, ePort, host) {

    var opts = JSON.stringify({ fPort: fPort, ePort: ePort, host: host });

    var initialCode = 'Ti.FasterTitanium.run(this, ' + opts + ')';
    var tiEntry = (0, _path.resolve)(__dirname, '../titanium/faster-titanium'); // dist/titanium/faster-titanium

    return new Promise(function (y, n) {
        (0, _browserify2.default)(tiEntry).bundle(function (e, buf) {
            if (e) return n(e);

            y([buf.toString(), initialCode].join('\n'));
        });
    });
}

/**
 * start watching files
 */
function startWatching() {
    this.ftProcess.watch();
}

/**
 * show server information
 */
function showServerInfo() {
    this.logger.info('\n\n        Access to FasterTitanium Web UI\n        ' + this.ftProcess.url + '\n    ');
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
    var index = this.config.paths.hooks.filter(function (path) {
        return path.match(/faster-titanium\/dist\/hook\/faster\.js$/);
    }).indexOf(__filename);

    return index > 0;
}