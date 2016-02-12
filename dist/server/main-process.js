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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ____ = (0, _debug2.default)('faster-titanium:MainProcess');
var ___x = (0, _debug2.default)('faster-titanium:MainProcess:error');

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


        this.fServer = new _fileServer2.default(projDir, fPort, host);
        this.watcher = new _fileWatcher2.default(projDir);
        this.eServer = new _eventServer2.default(ePort, host);

        this.fServer.on('error', ___x);
        this.eServer.on('error', ___x);
        this.watcher.on('error', ___x);

        this.watcher.on('change', function (path) {
            ____('changed: ' + path);
            _this.eServer.broadcast({ event: 'reload', path: path });
        });

        this.watcher.on('change:alloy', function (path) {
            ____('changed:alloy: ' + path);
        });

        this.fServer.on('got-kill-message', this.end.bind(this));
    }

    /**
     * start fileserver and eventserver
     * @return {Promise}
     */


    _createClass(MainProcess, [{
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