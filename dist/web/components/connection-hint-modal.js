'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _globalState = require('../global-state');

var _globalState2 = _interopRequireDefault(_globalState);

var _fa = require('./fa');

var _fa2 = _interopRequireDefault(_fa);

var _modal = require('../styles/modal');

var _modal2 = _interopRequireDefault(_modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var wait = function wait(msec) {
    return new Promise(function (y) {
        return setTimeout(y, msec);
    });
};

var windowStyle = {
    position: 'relative',
    margin: '200px auto',
    background: 'rgba(255,255,255, 1)',
    width: 400,
    height: 200,
    borderRadius: 6,
    boxShadow: 'rgba(113, 135, 164, 0.65098) 0 0 6 3'
};

var descriptionStyle = {
    width: 350,
    margin: '10px auto',
    height: 60,
    fontSize: 14,
    color: 'rgba(140, 140, 140, 1)'
};

var titleStyle = {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 16,
    background: '#ededed',
    background: '-webkit-gradient(linear, left top, left bottom, from(#ededed), to(#ebebeb))',
    background: '-moz-linear-gradient(top,  #ededed,  #ebebeb)',
    borderRadius: 6,
    color: 'rgba(80, 80, 80, 1)'
};

/**
 * modal for showing hint of connection with Titanium app
 */

var ConnectionHintModal = function (_React$Component) {
    _inherits(ConnectionHintModal, _React$Component);

    function ConnectionHintModal(props) {
        _classCallCheck(this, ConnectionHintModal);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ConnectionHintModal).call(this, props));
    }

    _createClass(ConnectionHintModal, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(
                'div',
                { style: _modal2.default, id: 'connection-hint-modal', onClick: function onClick(evt) {
                        return evt.target.id === 'connection-hint-modal' && _this2.close();
                    } },
                React.createElement(
                    'div',
                    { style: windowStyle },
                    React.createElement(_fa2.default, { onClick: this.close.bind(this), icon: 'close', style: { position: 'absolute', top: 15, right: 15, cursor: 'pointer' } }),
                    React.createElement(
                        'p',
                        { style: titleStyle },
                        React.createElement(_fa2.default, { icon: 'question-circle', style: { marginRight: 10 } }),
                        'Hint for connection'
                    ),
                    React.createElement(
                        'div',
                        { style: descriptionStyle },
                        this.hint
                    )
                )
            );
        }
    }, {
        key: 'close',
        value: function close() {
            _globalState2.default.set('connectionHintModal', false);
        }
    }, {
        key: 'hint',
        get: function get() {
            return '\n        If not connected, try restarting app.\n        Restart is "restart", not "resume".\n        On iOS simulator, press Command + Shift + H twice quickly and swipe up the app,\n        then the running app will be killed and you can "restart".\n        ';
        }
    }]);

    return ConnectionHintModal;
}(React.Component);

exports.default = ConnectionHintModal;