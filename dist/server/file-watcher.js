"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _path = require('path');

var _fs = require('fs');

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ____ = (0, _debug2.default)('faster-titanium:FileWatcher');
var ___x = (0, _debug2.default)('faster-titanium:FileWatcher:error');

/**
 * Watch files
 */

var FileWatcher = function (_EventEmitter) {
    _inherits(FileWatcher, _EventEmitter);

    /**
     * @param {string} projDir
     */

    function FileWatcher(projDir) {
        _classCallCheck(this, FileWatcher);

        /** @type {string} path to the project dir */

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FileWatcher).call(this));

        _this.projDir = projDir;
        /** @type {number} unix time(msec) of last emission of change event */
        _this.lastEmission = 0;
        /** @type {string} value (path) of last emission */
        _this.lastEmitted = null;
        /** @type {Object} chokidar object */
        _this.watcher = _chokidar2.default.watch(_this.dirs, { ignoreInitial: true });

        ____('start watching directories: ' + _this.dirs.join(', '));

        _this.watcher.on('change', _this.onChange.bind(_this));
        _this.watcher.on('error', function (path) {
            return ___x(path) || _this.emit('error', path);
        });
        return _this;
    }

    /**
     * whether the last change event was emitted during the past 1000msec
     * @type {boolean}
     * */


    _createClass(FileWatcher, [{
        key: 'unwatchResources',


        /**
         * unwatch Resources dir (called in alloy compilation)
         */
        value: function unwatchResources() {
            ____('unwatching Resources dir');
            this.watcher.unwatch((0, _path.join)(this.projDir, 'Resources'));
        }

        /**
         * (resume) watching Resources dir
         */

    }, {
        key: 'watchResources',
        value: function watchResources() {
            ____('restart watching Resources dir');
            this.watcher.add((0, _path.join)(this.projDir, 'Resources'));
        }

        /**
         * stop watching
         */

    }, {
        key: 'close',
        value: function close() {
            this.watcher.close();
            ____('watch stopped');
        }

        /**
         * Called when a file is changed.
         * Sometimes watcher calls this twice to the same file, so memorizes past emission
         * @param {string} path
         */

    }, {
        key: 'onChange',
        value: function onChange(path) {
            if (this.lastEmitted === path && this.justEmitted) {
                ____('preventing emission twice.');
                return;
            }

            this.lastEmitted = path;
            this.lastEmission = new Date().getTime();

            if (this.isAlloyPath(path)) {
                this.emit('change:alloy', path);
            } else {
                this.emit('change', path);
            }
        }
    }, {
        key: 'isAlloyPath',
        value: function isAlloyPath(path) {
            return path.indexOf((0, _path.join)(this.projDir, 'app/')) === 0;
        }

        /** @type {string[]} */

    }, {
        key: 'justEmitted',
        get: function get() {
            return new Date().getTime() - this.lastEmission < 1000;
        }
    }, {
        key: 'dirs',
        get: function get() {
            var _this2 = this;

            return ['Resources', 'app', 'i18n'].map(function (name) {
                return (0, _path.join)(_this2.projDir, name);
            }).filter(_fs.existsSync);
        }
    }]);

    return FileWatcher;
}(_events.EventEmitter);

exports.default = FileWatcher;