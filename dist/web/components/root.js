'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _globalState = require('../global-state');

var _globalState2 = _interopRequireDefault(_globalState);

var _infoTable = require('./info-table');

var _infoTable2 = _interopRequireDefault(_infoTable);

var _selectionModal = require('./selection-modal');

var _selectionModal2 = _interopRequireDefault(_selectionModal);

var _connectionHintModal = require('./connection-hint-modal');

var _connectionHintModal2 = _interopRequireDefault(_connectionHintModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var wait = function wait(msec) {
    return new Promise(function (y) {
        return setTimeout(y, msec);
    });
};

var Root = function (_React$Component) {
    _inherits(Root, _React$Component);

    function Root(props) {
        _classCallCheck(this, Root);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Root).call(this, props));

        _this.state = {
            notification: '',
            selectionModal: false,
            connectionHintModal: false,
            tableInfo: {}
        };

        _globalState2.default.initialize(_this);
        return _this;
    }

    _createClass(Root, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.fetchInfo();
        }
    }, {
        key: 'fetchInfo',
        value: function fetchInfo() {
            fetch('/info').then(function (res) {
                return res.json();
            }).then(function (json) {
                _globalState2.default.set('tableInfo', json);
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                this.state.selectionModal ? React.createElement(_selectionModal2.default, null) : '',
                this.state.connectionHintModal ? React.createElement(_connectionHintModal2.default, null) : '',
                React.createElement(
                    'pre',
                    null,
                    this.state.notification
                ),
                React.createElement(_infoTable2.default, { info: this.state.tableInfo, fetchInfo: this.fetchInfo.bind(this) }),
                React.createElement(
                    'div',
                    { className: 'nice-button' },
                    React.createElement(
                        'a',
                        { onClick: this.reload.bind(this) },
                        'Reload App'
                    )
                )
            );
        }
    }, {
        key: 'reload',
        value: function reload() {

            _globalState2.default.set('notification', 'Now Reloading...');

            fetch('/reload').then(function (res) {
                return res.text();
            }).then(function (text) {
                return wait(1500);
            }).then(function (x) {
                _globalState2.default.set('notification', '');
            });
        }
    }]);

    return Root;
}(React.Component);

exports.default = Root;