'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Socket = function () {
    function Socket() {
        var _this = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Socket);

        var host = options.host;
        var port = options.port;


        this.dataListener = null;

        this.proxy = Ti.Network.Socket.createTCP({
            host: host,
            port: port,

            connected: function connected(v) {

                Ti.Stream.pump(v.socket, function (e) {
                    _this.dataListener && _this.dataListener('' + e.buffer);
                }, 1024, true);
            },

            error: function error(e) {
                console.log(e);
            }
        });

        this.proxy.connect();
    }

    _createClass(Socket, [{
        key: 'onData',
        value: function onData(fn) {
            if (typeof fn === 'function') {
                this.dataListener = fn;
            }
        }
    }, {
        key: 'end',
        value: function end() {
            this.proxy.close();
        }
    }]);

    return Socket;
}();

exports.default = Socket;