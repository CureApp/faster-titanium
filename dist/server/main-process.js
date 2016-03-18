"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _randomstring = require('randomstring');

var _randomstring2 = _interopRequireDefault(_randomstring);

var _fileServer = require('./file-server');

var _fileServer2 = _interopRequireDefault(_fileServer);

var _fileWatcher = require('./file-watcher');

var _fileWatcher2 = _interopRequireDefault(_fileWatcher);

var _notificationServer = require('./notification-server');

var _notificationServer2 = _interopRequireDefault(_notificationServer);

var _contentResponder = require('./content-responder');

var _contentResponder2 = _interopRequireDefault(_contentResponder);

var _alloyCompiler = require('./alloy-compiler');

var _alloyCompiler2 = _interopRequireDefault(_alloyCompiler);

var _preferences = require('../common/preferences');

var _preferences2 = _interopRequireDefault(_preferences);

var _tiLog = require('./ti-log');

var _tiLog2 = _interopRequireDefault(_tiLog);

var _util = require('../common/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = (0, _debug2.default)('faster-titanium:MainProcess');
var ___x = function ___x(e) {
    return (0, _debug2.default)('faster-titanium:MainProcess:error')(e) || (0, _debug2.default)('faster-titanium:MainProcess:error')(e.stack);
};

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

/**
 * main process
 */

var MainProcess = function () {

    /**
     * @param {string} projDir
     * @param {Object} [options={}]
     * @param {number} [options.fPort] port number of the file server
     * @param {number} [options.nPort] port number of the notification server
     * @param {string} [options.host] host name or IP Address
     * @param {string} [options.platform] platform name (ios|android|mobileweb|windows)
     * @param {string} [options.token] identifier for this process
     */

    function MainProcess(projDir) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, MainProcess);

        var fPort = options.fPort;
        var nPort = options.nPort;
        var host = options.host;
        var platform = options.platform;
        var tiDebug = options.tiDebug;
        var token = options.token;

        /** @type {string} identifier for this process */

        this.token = token || _randomstring2.default.generate(10);
        /** @type {string} project dir */
        this.projDir = projDir;
        /** @type {string} hostname or IP Address */
        this.host = host;
        /** @type {string} platform os name of the Titanium App */
        this.platform = platform;
        /** @type {Preferences} */
        this.prefs = new _preferences2.default({ tiDebug: tiDebug });
        /** @type {FileServer} */
        this.fServer = new _fileServer2.default(fPort, this.token, this.routes);
        /** @type {FileWatcher} */
        this.watcher = new _fileWatcher2.default(this.projDir);
        /** @type {NotificationServer} */
        this.nServer = new _notificationServer2.default(nPort, this.token);
        /** @type {AlloyCompiler} */
        this.alloyCompiler = new _alloyCompiler2.default(this.projDir, this.platform);
        this.registerListeners();
    }

    /** @type {string} */


    _createClass(MainProcess, [{
        key: 'registerListeners',


        /**
         * register event listeners.
         * called only once in constructor
         * @private
         */
        value: function registerListeners() {

            this.fServer.on('error', ___x);
            this.nServer.on('error', ___x);
            this.watcher.on('error', ___x);

            this.nServer.on('log', this.tilog.bind(this));
            this.watcher.on('change:Resources', this.onResourceFileChanged.bind(this));
            this.watcher.on('change:alloy', this.onAlloyFileChanged.bind(this));
        }
    }, {
        key: 'launchServers',


        /**
         * launch file server and notification server
         * @return {Promise}
         * @public
         */
        value: function launchServers() {
            ____('launching servers');
            return Promise.all([this.fServer.listen(), this.nServer.listen()]).catch(___x);
        }

        /**
         * start watching files
         * @public
         */

    }, {
        key: 'run',
        value: function run() {
            var _this = this;

            this.watch();
            process.on('exit', function (x) {
                console.log(_chalk2.default.yellow('You can restart faster-titanium server with the following command.\n'));
                console.log(_chalk2.default.yellow(_this.restartCommand));
            });
        }

        /**
         * starting file watching
         * @private
         */

    }, {
        key: 'watch',
        value: function watch() {
            ____('starting file watcher');
            this.watcher.watch();
        }

        /**
         * close servers and stop watching
         * @public
         */

    }, {
        key: 'end',
        value: function end() {
            ____('terminating servers');
            Promise.all([this.fServer.close(), this.nServer.close(), this.watcher.close()]);
        }

        /**
         * show titanium log in console
         * @param {Object} payload
         * @param {Array} payload.args
         * @param {string} payload.severity trace|debug|info|warn|error|critical
         * @param {Object} [payload.options]
         * @param {string} [payload.options.time] ISOStringfied time the log generated
         * @param {string} [payload.options.debugname] debug name
         */

    }, {
        key: 'tilog',
        value: function tilog(payload) {
            var args = payload.args;
            var severity = payload.severity;
            var options = payload.options;

            _tiLog2.default[severity](args, options);
        }

        /**
         * called when files in Resources directory changed
         * @param {string} path
         * @private
         */

    }, {
        key: 'onResourceFileChanged',
        value: function onResourceFileChanged(path) {
            if (this.alloyCompiler.compiling) return;

            ____('changed: ' + path);

            this.sendEvent({ timer: 1000, names: [(0, _util.modNameByPath)(path, this.projDir, this.platform)] });
        }

        /**
         * Called when files in app directory (Alloy project) changed
         * Compile alloy. During compilation, unwatch Resources directory.
         * @param {string} path
         * @private
         */

    }, {
        key: 'onAlloyFileChanged',
        value: function onAlloyFileChanged(path) {
            var _this2 = this;

            ____('changed:alloy ' + path);

            var token = _randomstring2.default.generate(10); // identifier for this compilation

            this.send({ event: 'alloy-compilation', token: token });

            var changedFiles = []; // files in Resources changed by alloy compilation
            var poolChanged = function poolChanged(path) {
                return changedFiles.push((0, _util.modNameByPath)(path, _this2.projDir, _this2.platform));
            };

            this.watcher.on('change:Resources', poolChanged);

            /** @type {AlloyCompiler} */
            return this.alloyCompiler.compile(path, token).then(function (result) {
                _this2.send({ event: 'alloy-compilation-done', token: token, success: result });
                _this2.watcher.removeListener('change:Resources', poolChanged);
                if (result) {
                    _this2.sendEvent({ timer: 500, names: changedFiles });
                }
            });
        }

        /**
         * send message to the client of notification server
         * @param {Object} payload
         * @param {string} payload.event event name. oneof alloy-compilation|alloy-compilation-done|reload|reflect|debug-mode
         */

    }, {
        key: 'send',
        value: function send(payload) {
            console.assert(payload && payload.event);
            this.nServer.send(payload);
        }

        /**
         * send reload|reflect event to the titanium client
         * @param {Object} [options={}]
         * @return {Promise}
         * @private
         */

    }, {
        key: 'sendEvent',
        value: function sendEvent() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var eventName = void 0;

            switch (this.prefs.style) {
                case 'manual':
                    return;
                case 'auto-reload':
                    eventName = 'reload';
                    break;
                case 'auto-reflect':
                    eventName = 'reflect';
                    break;
            }

            var payload = _extends({}, { event: eventName }, options);

            this.send(payload);
        }

        /**
         * @type {Array}
         * @todo separate this to another file
         */

    }, {
        key: 'restartCommand',
        get: function get() {
            return 'faster-ti restart -f ' + this.fPort + ' -n ' + this.nPort + ' -p ' + this.platform + ' -t ' + this.token + ' ' + this.projDir;
        }

        /** @type {string} */

    }, {
        key: 'url',
        get: function get() {
            return 'http://' + this.host + ':' + this.fPort + '/';
        }

        /** @type {number} */

    }, {
        key: 'fPort',
        get: function get() {
            return this.fServer.port;
        }

        /** @type {number} */

    }, {
        key: 'nPort',
        get: function get() {
            return this.nServer.port;
        }
    }, {
        key: 'running',
        get: function get() {
            return this.fServer.running && this.nServer.running && this.watcher.watching;
        }
    }, {
        key: 'routes',
        get: function get() {
            var _this3 = this;

            var responder = new _contentResponder2.default();
            return [['/', function (url) {
                return responder.webUI();
            }], ['/info', function (url) {
                return responder.respondJSON(_this3.info);
            }], ['/prefs', 'POST', function (url, body) {
                _this3.prefs.apply(body);
                _this3.send({ event: 'preferences', prefs: _this3.prefs });
                return responder.respondJSON(_this3.prefs);
            }], ['/prefs', 'GET', function (url) {
                return responder.respondJSON(_this3.prefs);
            }], ['/kill', function (url) {
                process.nextTick(_this3.end.bind(_this3));
                return responder.respond();
            }], ['/reload', function (url) {
                _this3.send({ event: 'reload', force: true });
                return responder.respond();
            }], ['/faster-titanium-web-js/main.js', function (url) {
                return responder.webJS();
            }], [/^\//, function (url) {
                return (// any URL
                    responder.resource(url, _this3.projDir, _this3.platform)
                );
            }]];
        }

        /**
         * information of FasterTitanium process
         * @type {Object}
         */

    }, {
        key: 'info',
        get: function get() {
            return {
                'access token': this.token,
                'project root': this.projDir,
                'notification server port': this.nPort,
                'process uptime': parseInt(process.uptime()) + ' [sec]',
                'platform': this.platform,
                'connection with client': this.nServer.connected,
                'loading style': this.prefs.style,
                'show debug log in Titanium': this.prefs.tiDebug,
                'show ti log in server console': this.prefs.serverLog,
                'show ti log in titanium console': this.prefs.localLog
            };
        }
    }]);

    return MainProcess;
}();

exports.default = MainProcess;