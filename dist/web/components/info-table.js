'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fa = require('./fa');

var _fa2 = _interopRequireDefault(_fa);

var _globalState = require('../global-state');

var _globalState2 = _interopRequireDefault(_globalState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InfoTable = function (_React$Component) {
    _inherits(InfoTable, _React$Component);

    function InfoTable(props) {
        _classCallCheck(this, InfoTable);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InfoTable).call(this, props));

        _this.state = {
            loadingStyleHighLight: false
        };
        return _this;
    }

    _createClass(InfoTable, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'table',
                { cellSpacing: '0' },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            null,
                            'Property Name'
                        ),
                        React.createElement(
                            'th',
                            null,
                            'Value',
                            React.createElement(_fa2.default, { icon: 'refresh', style: { paddingLeft: 10, fontSize: 15 }, onClick: this.props.fetchInfo })
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    this.trs
                )
            );
        }
    }, {
        key: 'infoValueTD',


        /**
         * prepare <td> tag for info value
         * @param {string} k key of info json
         * @param {string} v value of info json
         */
        value: function infoValueTD(k, v) {
            var _this2 = this;

            var modifiers = {

                'loading style': function loadingStyle(v) {
                    return React.createElement(
                        'td',
                        { style: _this2.loadingStyleCSS,
                            onClick: _this2.showSelectionModal.bind(_this2),
                            onMouseOver: function onMouseOver(x) {
                                return _this2.setState({ loadingStyleHighLight: true });
                            },
                            onMouseOut: function onMouseOut(x) {
                                return _this2.setState({ loadingStyleHighLight: false });
                            } },
                        v,
                        React.createElement(_fa2.default, { icon: 'arrow-circle-right', style: { color: '#39f', paddingLeft: 10 } })
                    );
                },

                'connection with client': function connectionWithClient(v) {
                    return React.createElement(
                        'td',
                        { style: { cursor: 'pointer' }, onClick: _this2.showConnectionHintModal.bind(_this2) },
                        React.createElement(_fa2.default, { icon: v ? 'check' : 'close', style: { color: v ? 'green' : 'red', fontSize: 30 } }),
                        React.createElement(_fa2.default, { icon: 'question-circle', style: { color: '#39f', fontSize: 13, paddingLeft: 6, verticalAlign: '20%' } })
                    );
                }
            };

            return modifiers[k] ? modifiers[k](v) : React.createElement(
                'td',
                null,
                v
            );
        }
    }, {
        key: 'showConnectionHintModal',
        value: function showConnectionHintModal() {
            _globalState2.default.set('connectionHintModal', true);
        }
    }, {
        key: 'showSelectionModal',
        value: function showSelectionModal() {
            _globalState2.default.set('selectionModal', true);
        }
    }, {
        key: 'trs',
        get: function get() {
            var _this3 = this;

            var info = this.props.info;

            return Object.keys(info).map(function (k) {
                return React.createElement(
                    'tr',
                    { key: k },
                    React.createElement(
                        'td',
                        null,
                        k
                    ),
                    _this3.infoValueTD(k, info[k])
                );
            });
        }
    }, {
        key: 'loadingStyleCSS',
        get: function get() {
            var style = {
                cursor: 'pointer',
                transition: 'background-color .3s'
            };

            if (this.state.loadingStyleHighLight) {
                style.background = '#99c2f4';
            }
            return style;
        }
    }]);

    return InfoTable;
}(React.Component);

exports.default = InfoTable;