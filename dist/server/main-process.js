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
        var _this = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, MainProcess);

        var fPort = options.fPort;
        var ePort = options.ePort;
        var host = options.host;
        var minIntervalSec = options.minIntervalSec;


        this.lastBroadcast = 0;

        this.minIntervalSec = parseInt(minIntervalSec, 10) || 3;
        this.fServer = new _fileServer2.default(projDir, fPort, host);
        this.watcher = new _fileWatcher2.default(projDir);
        this.eServer = new _eventServer2.default(ePort, host);
        this.compiler = new _alloyCompiler2.default(projDir);

        this.fServer.on('error', ___x);
        this.eServer.on('error', ___x);
        this.watcher.on('error', ___x);

        this.watcher.on('change', function (path) {
            return ____('changed: ' + path) || _this.broadcastReload();
        });
        this.watcher.on('change:alloy', this.compileAlloy.bind(this));
        this.fServer.on('got-kill-message', this.end.bind(this));
        this.fServer.on('got-reload-message', this.broadcastReload.bind(this));
    }

    /** @type {number} */


    _createClass(MainProcess, [{
        key: 'broadcastReload',


        /**
         * send reload message to all connected clients
         */
        value: function broadcastReload() {
            if (this.timeToBroadcast > 0) {
                return ____('Broadcasting suppressed. Available in ' + this.timeToBroadcast + ' msec.');
            }

            this.eServer.broadcast({ event: 'reload' });
            this.lastBroadcast = new Date().getTime();
        }

        /**
         * compile alloy when one of the files in alloy changes
         * @param {string} path
         * @todo support for non-ios|android OS
         */

    }, {
        key: 'compileAlloy',
        value: function compileAlloy(path) {
            var _this2 = this;

            ____('changed:alloy ' + path);

            this.watcher.unwatchResources();

            this.compiler.compile(path).then(function (x) {
                return wait(_this2.timeToBroadcast);
            }).then(function (x) {
                _this2.broadcastReload(path);
                _this2.watcher.watchResources();
            }).catch(___x);
        }

        /**
         * start fileserver and eventserver
         * @return {Promise}
         */

    }, {
        key: 'start',
        value: function start() {
            ____('starting servers');
            return Promise.all([this.fServer.listen(), this.eServer.listen()]).catch(___x);
        }

        /**
         * close servers and stop watching
         */

    }, {
        key: 'end',
        value: function end() {
            ____('terminating servers');
            Promise.all([this.fServer.close(), this.eServer.close(), this.watcher.close()]);
        }
    }, {
        key: 'timeToBroadcast',
        get: function get() {
            var time = new Date().getTime();
            return Math.max(0, this.lastBroadcast + this.minIntervalSec * 1000 - time);
        }
    }]);

    return MainProcess;
}();

exports.default = MainProcess;