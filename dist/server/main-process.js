"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fileServer = require('./file-server');

var _fileServer2 = _interopRequireDefault(_fileServer);

var _fileWatcher = require('./file-watcher');

var _fileWatcher2 = _interopRequireDefault(_fileWatcher);

var _eventServer = require('./event-server');

var _eventServer2 = _interopRequireDefault(_eventServer);

var _contentResponder = require('./content-responder');

var _contentResponder2 = _interopRequireDefault(_contentResponder);

var _alloyCompiler = require('./alloy-compiler');

var _alloyCompiler2 = _interopRequireDefault(_alloyCompiler);

var _preferences = require('../common/preferences');

var _preferences2 = _interopRequireDefault(_preferences);

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
     * @param {number} fPort port number of the file server
     * @param {number} ePort port number of the event server
     * @param {string} host host name or IP Address
     * @param {string} platform platform name (ios|android|mobileweb|windows)
     */

    function MainProcess(projDir) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, MainProcess);

        var fPort = options.fPort;
        var ePort = options.ePort;
        var host = options.host;
        var platform = options.platform;

        /** @type {string} project dir */

        this.projDir = projDir;
        /** @type {string} hostname or IP Address */
        this.host = host;
        /** @type {string} platform os name of the Titanium App */
        this.platform = platform;
        /** @type {Preferences} */
        this.prefs = new _preferences2.default();
        /** @type {FileServer} */
        this.fServer = new _fileServer2.default(fPort, this.routes);
        /** @type {FileWatcher} */
        this.watcher = new _fileWatcher2.default(this.projDir);
        /** @type {EventServer} */
        this.eServer = new _eventServer2.default(ePort);

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
            this.eServer.on('error', ___x);
            this.watcher.on('error', ___x);

            this.watcher.on('change', this.onResourceFileChanged.bind(this));
            this.watcher.on('change:alloy', this.onAlloyFileChanged.bind(this));
        }

        /**
         * launch fileserver and eventserver
         * @return {Promise}
         * @public
         */

    }, {
        key: 'launchServers',
        value: function launchServers() {
            ____('launching servers');
            return Promise.all([this.fServer.listen(), this.eServer.listen()]).catch(___x);
        }

        /**
         * starting file watching
         * @public
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
            Promise.all([this.fServer.close(), this.eServer.close(), this.watcher.close()]);
        }

        /**
         * called when files in Resources directory changed
         * @param {string} path
         * @private
         */

    }, {
        key: 'onResourceFileChanged',
        value: function onResourceFileChanged(path) {
            ____('changed: ' + path);

            this.sendReload({ timer: 1000 });
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
            var _this = this;

            ____('changed:alloy ' + path);

            this.send({ event: 'will-reload' });

            this.watcher.unwatchResources();

            /** @type {AlloyCompiler} */
            var compiler = new _alloyCompiler2.default(this.projDir, this.platform);
            return compiler.compile(path).catch(___x).then(function (x) {
                return _this.watcher.watchResources();
            }).then(function (x) {
                return _this.sendReload({ reserved: true });
            }).catch(___x);
        }

        /**
         * send message to the client of event server
         * @param {Object} payload
         * @param {string} payload.event event name. oneof will-reload|reload|reflect
         */

    }, {
        key: 'send',
        value: function send(payload) {
            console.assert(payload && payload.event);
            this.eServer.send(payload);
        }

        /**
         * send reload message to all connected clients
         * @param {Object} [options={}]
         * @return {Promise}
         * @private
         */

    }, {
        key: 'sendReload',
        value: function sendReload() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var payload = _extends({}, { event: 'reload' }, options);
            this.send(payload);
        }
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
        key: 'ePort',
        get: function get() {
            return this.eServer.port;
        }
    }, {
        key: 'routes',
        get: function get() {
            var _this2 = this;

            var responder = new _contentResponder2.default();
            return [['/', function (url) {
                return responder.webUI();
            }], ['/info', function (url) {
                return responder.respondJSON(_this2.info);
            }], ['/kill', function (url) {
                process.nextTick(_this2.end.bind(_this2));
                return responder.respond();
            }], ['/reload', function (url) {
                _this2.sendReload({ force: true });
                return responder.respond();
            }], [/^\/faster-titanium-web-js\//, function (url) {
                return responder.webJS(url.slice('/faster-titanium-web-js/'.length));
            }], [/^\//, function (url) {
                return (// any URL
                    responder.resource(url, _this2.projDir, _this2.platform)
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
                'project root': this.projdir,
                'event server port': this.ePort,
                'process uptime': process.uptime() + ' [sec]',
                'platform': this.platform,
                'loading style': this.prefs.style
                //'Reloaded Times' : this.stats.reloadedTimes
            };
        }
    }]);

    return MainProcess;
}();

exports.default = MainProcess;