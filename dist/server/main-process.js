"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _path = require('path');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _fileServer = require('./file-server');

var _fileServer2 = _interopRequireDefault(_fileServer);

var _fileWatcher = require('./file-watcher');

var _fileWatcher2 = _interopRequireDefault(_fileWatcher);

var _eventServer = require('./event-server');

var _eventServer2 = _interopRequireDefault(_eventServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var P = function P(f) {
    return new Promise(f);
};
var ____ = (0, _debug2.default)('faster-titanium:MainProcess');
var ___x = (0, _debug2.default)('faster-titanium:MainProcess:error');
var ___o = function ___o(v) {
    return ____(v) || v;
};

/**
 * main process
 */

var MainProcess = function () {

    /**
     * @param {string} projDir
     * @param {Object} [options={}]
     */

    function MainProcess(projDir) {
        var _this = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, MainProcess);

        var fPort = options.fPort;
        var ePort = options.ePort;
        var host = options.host;


        this.alloyCompiling = false;

        this.fServer = new _fileServer2.default(projDir, fPort, host);
        this.watcher = new _fileWatcher2.default(projDir);
        this.eServer = new _eventServer2.default(ePort, host);

        this.fServer.on('error', ___x);
        this.eServer.on('error', ___x);
        this.watcher.on('error', ___x);

        this.watcher.on('change', function (path) {
            return _this.broadcastReload.bind(_this);
        });
        this.watcher.on('change:alloy', this.compileAlloy.bind(this));
        this.fServer.on('got-kill-message', this.end.bind(this));
    }

    /**
     * send reload message to all connected clients
     * @param {string} path
     */


    _createClass(MainProcess, [{
        key: 'broadcastReload',
        value: function broadcastReload(path) {
            if (this.alloyCompiling) return; // suppress broadcasting while compiling alloy.

            ____('changed: ' + path);
            this.eServer.broadcast({ event: 'reload', path: path });
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

            this.alloyCompiling = true;

            ____('changed:alloy ' + path);
            var alloy = (0, _path.resolve)(__dirname, '../../node_modules/.bin/alloy');

            var relPath = (0, _path.relative)(this.watcher.projDir, path);

            Promise.all(['ios', 'android'].map(function (os) {
                return alloy + ' compile --config platform=' + os + ',file=' + relPath;
            }).map(___o).map(function (command) {
                return P(function (y) {
                    return (0, _child_process.exec)(command, y);
                });
            })).then(function (x) {
                _this2.alloyCompiling = false;
                _this2.broadcastReload(path);
            });
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
         * terminate this process
         */

    }, {
        key: 'end',
        value: function end() {
            ____('terminating servers');
            Promise.all([this.fServer.close(), this.eServer.close()]).then(function (results) {
                ____('terminating process');
                process.exit(0);
            }).catch(___x);
        }
    }]);

    return MainProcess;
}();

exports.default = MainProcess;