"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fileServer = require('./file-server');

var _fileServer2 = _interopRequireDefault(_fileServer);

var _fileWatcher = require('./file-watcher');

var _fileWatcher2 = _interopRequireDefault(_fileWatcher);

var _eventServer = require('./event-server');

var _eventServer2 = _interopRequireDefault(_eventServer);

var _alloyCompiler = require('./alloy-compiler');

var _alloyCompiler2 = _interopRequireDefault(_alloyCompiler);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = (0, _debug2.default)('faster-titanium:MainProcess');
var ___x = (0, _debug2.default)('faster-titanium:MainProcess:error');

var wait = function wait(t) {
    return new Promise(function (y) {
        return setTimeout(y, t);
    });
};

/**
 * main process
 */

var MainProcess = function () {

    /**
     * @param {string} projDir
     * @param {Object} [options={}]
     * @param {number} [options.minIntervalSec=3] minimum interval seconds to broadcast
     */

    function MainProcess(projDir) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, MainProcess);

        var fPort = options.fPort;
        var ePort = options.ePort;
        var host = options.host;
        var minIntervalSec = options.minIntervalSec;

        /** @type {string} project dir */

        this.projDir = projDir;
        /** @type {number} @private */
        this.reservedBroadcasts = 0;
        /** @type {FileServer} */
        this.fServer = new _fileServer2.default(this.projDir, fPort, host, this.getInfo.bind(this));
        /** @type {FileWatcher} */
        this.watcher = new _fileWatcher2.default(this.projDir);
        /** @type {EventServer} */
        this.eServer = new _eventServer2.default(ePort, host);
        /** @type {AlloyCompiler} */
        this.compiler = new _alloyCompiler2.default(this.projDir);

        this.registerListeners();
    }

    /**
     * register event listeners.
     * called only once in constructor
     * @private
     */


    _createClass(MainProcess, [{
        key: 'registerListeners',
        value: function registerListeners() {

            this.fServer.on('error', ___x);
            this.eServer.on('error', ___x);
            this.watcher.on('error', ___x);

            this.watcher.on('change', this.onResourceFileChanged.bind(this));
            this.watcher.on('change:alloy', this.onAlloyFileChanged.bind(this));
            this.fServer.on('got-kill-message', this.end.bind(this));
            this.fServer.on('got-reload-message', this.broadcastReload.bind(this));
        }

        /**
         * start fileserver and eventserver
         * @return {Promise}
         * @public
         */

    }, {
        key: 'start',
        value: function start() {
            ____('starting servers');
            return Promise.all([this.fServer.listen(), this.eServer.listen()]).catch(___x);
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

            if ((0, _util.isAppJS)(this.projDir, path)) {
                this.fServer.clearAppJSCache();
            }
            this.broadcastReload();
        }

        /**
         * called when files in app directory (Alloy project) changed
         * @param {string} path
         * @private
         */

    }, {
        key: 'onAlloyFileChanged',
        value: function onAlloyFileChanged(path) {
            if (path === this.projDir + '/app/alloy.js') {
                this.fServer.clearAppJSCache();
            }

            ____('changed:alloy ' + path);

            this.willBroadcast(this.compileAlloy(path).catch(___x));
        }

        /**
         * broadcast
         */

    }, {
        key: 'willBroadcast',
        value: function willBroadcast(promise) {
            var _this = this;

            this.reservedBroadcasts++;
            return promise.then(function (x) {
                _this.reservedBroadcasts--;
                return _this.broadcastReload(0);
            });
        }

        /**
         * send reload message to all connected clients
         * @return {Promise}
         * @private
         */

    }, {
        key: 'broadcastReload',
        value: function broadcastReload() {
            var _this2 = this;

            var duration = arguments.length <= 0 || arguments[0] === undefined ? 1000 : arguments[0];


            this.reservedBroadcasts++;

            return wait(duration).then(function (x) {
                _this2.reservedBroadcasts--;
                ____("this.reservedBroadcasts", _this2.reservedBroadcasts);

                if (_this2.reservedBroadcasts > 0) {
                    return;
                }

                _this2.eServer.broadcast({ event: 'reload' });
            });
        }

        /**
         * compile alloy when one of the files in alloy changes
         * @param {string} path
         * @todo support for non-ios|android OS
         * @private
         */

    }, {
        key: 'compileAlloy',
        value: function compileAlloy(path) {
            var _this3 = this;

            this.watcher.unwatchResources();

            return this.compiler.compile(path).then(function (x) {
                return _this3.watcher.watchResources();
            });
        }
    }, {
        key: 'getInfo',
        value: function getInfo() {
            return {
                'Project Root': this.projDir,
                'Connections': this.eServer.updateSockets().length,
                'Process Uptime': process.uptime() + ' [sec]'
                //'Reloaded Times' : this.stats.reloadedTimes
            };
        }
    }]);

    return MainProcess;
}();

exports.default = MainProcess;