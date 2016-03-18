'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Socket = function () {
    function Socket() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Socket);

        var host = options.host;
        var port = options.port;


        this.host = host;
        this.port = port;
        this.dataListener = null;
        this.errorListener = null;
        this.proxy = this.createTCPSocket();
    }

    /** @type {string} */


    _createClass(Socket, [{
        key: 'connect',


        /**
         * connect to TCP server
         */
        value: function connect() {
            this.proxy.connect();
        }

        /**
         * reconnect to TCP server
         */

    }, {
        key: 'reconnect',
        value: function reconnect() {
            this.end();
            delete this.proxy;
            this.proxy = this.createTCPSocket();
            this.connect();
        }

        /**
         * create socket proxy for TCP connection
         */

    }, {
        key: 'createTCPSocket',
        value: function createTCPSocket() {
            var _this = this;

            return Ti.Network.Socket.createTCP({
                host: this.host,
                port: this.port,

                connected: function connected(v) {

                    _this.connectionListener && _this.connectionListener();

                    Ti.Stream.pump(v.socket, function (e) {
                        // end signal
                        if (!e.buffer) {
                            return _this.closeListener && _this.closeListener();
                        }
                        if (!_this.dataListener) return;

                        ('' + e.buffer).trim().split('\n') // split two or more JSONs (see src/server/event-server.js)
                        .map(function (str) {
                            try {
                                return JSON.parse(str);
                            } catch (e) {
                                console.error(e);return null;
                            }
                        }).filter(function (v) {
                            return v != null;
                        }).forEach(function (payload) {
                            return _this.dataListener(payload);
                        });
                    }, 1024, true);
                },

                error: function error(e) {
                    return _this.errorListener && _this.errorListener(e);
                }
            });
        }

        /**
         * send payload to server
         * @param {Object} payload
         */

    }, {
        key: 'send',
        value: function send(payload) {
            var buf = Ti.createBuffer({ value: JSON.stringify(payload) + '\n' });
            var bytes = this.proxy.write(buf);
        }

        /**
         * send string to server
         * @param {string} str
         */

    }, {
        key: 'sendText',
        value: function sendText(str) {
            var buf = Ti.createBuffer({ value: str });
            var bytes = this.proxy.write(buf);
        }

        /**
         * set listener of data event
         * @param {function} fn
         */

    }, {
        key: 'onData',
        value: function onData(fn) {
            if (typeof fn === 'function') this.dataListener = fn;
        }

        /**
         * set listener of close event
         * @param {function} fn
         */

    }, {
        key: 'onClose',
        value: function onClose(fn) {
            if (typeof fn === 'function') this.closeListener = fn;
        }

        /**
         * set listener of connection event
         * @param {function} fn
         */

    }, {
        key: 'onConnection',
        value: function onConnection(fn) {
            if (typeof fn === 'function') this.connectionListener = fn;
        }

        /**
         * set listener of error event
         * @param {function} fn
         */

    }, {
        key: 'onError',
        value: function onError(fn) {
            if (typeof fn === 'function') this.errorListener = fn;
        }

        /**
         * close socket
         */

    }, {
        key: 'end',
        value: function end() {
            try {
                this.proxy.close();
            } catch (e) {}
        }
    }, {
        key: 'url',
        get: function get() {
            return this.host + ':' + this.port;
        }
    }]);

    return Socket;
}();

exports.default = Socket;