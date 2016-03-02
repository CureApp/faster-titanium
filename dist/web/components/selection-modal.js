'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preferences = require('../../common/preferences');

var _preferences2 = _interopRequireDefault(_preferences);

var _globalState = require('../global-state');

var _globalState2 = _interopRequireDefault(_globalState);

var _postPreferences = require('../post-preferences');

var _postPreferences2 = _interopRequireDefault(_postPreferences);

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
    margin: '200px auto',
    background: 'rgba(255,255,255, 1)',
    width: 400,
    height: 300,
    borderRadius: 6,
    boxShadow: 'rgba(113, 135, 164, 0.65098) 0 0 6 3'
};

var descriptionStyle = {
    width: 250,
    margin: '10px auto',
    height: 60,
    fontSize: 12,
    color: 'rgba(140, 140, 140, 1)'
};

var selectStyle = {
    width: 250,
    fontSize: 20,
    color: 'rgba(100, 100, 100, 1)',
    border: '1 solid #ddd'
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
 * modal for selection of loading style
 */

var SelectionModal = function (_React$Component) {
    _inherits(SelectionModal, _React$Component);

    function SelectionModal(props) {
        _classCallCheck(this, SelectionModal);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SelectionModal).call(this, props));

        _this.state = {
            selected: 0,
            desc: ''
        };
        return _this;
    }

    _createClass(SelectionModal, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(
                'div',
                { style: _modal2.default, id: 'selection-modal', onClick: function onClick(evt) {
                        return evt.target.id === 'selection-modal' && _this2.close();
                    } },
                React.createElement(
                    'div',
                    { style: windowStyle },
                    React.createElement(
                        'p',
                        { style: titleStyle },
                        'Choose the loading style.'
                    ),
                    React.createElement(
                        'div',
                        { style: descriptionStyle },
                        this.state.desc
                    ),
                    React.createElement(
                        'select',
                        { style: selectStyle, size: '3', onChange: function onChange(evt) {
                                return _this2.setState({ selected: evt.target.value });
                            } },
                        React.createElement(
                            'option',
                            { onMouseOver: this.showStyleDescription.bind(this), value: '1' },
                            'auto-reload'
                        ),
                        React.createElement(
                            'option',
                            { onMouseOver: this.showStyleDescription.bind(this), value: '2' },
                            'auto-reflect'
                        ),
                        React.createElement(
                            'option',
                            { onMouseOver: this.showStyleDescription.bind(this), value: '3' },
                            'manual'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'nice-button', id: 'change-loading-style-btn' },
                        React.createElement(
                            'a',
                            { onClick: this.changeLoadingStyle.bind(this) },
                            'Change'
                        )
                    )
                )
            );
        }

        /**
         * send custom loading style name to the server
         */

    }, {
        key: 'changeLoadingStyle',
        value: function changeLoadingStyle() {
            var _this3 = this;

            var loadStyleNum = parseInt(this.state.selected);

            (0, _postPreferences2.default)({ loadStyleNum: loadStyleNum }).then(function (json) {
                _this3.close();
                _globalState2.default.set('tableInfo', 'loading style', _preferences2.default.expressions[loadStyleNum]);
                _globalState2.default.set('notification', 'loading style changed.');
            }).then(function (x) {
                return wait(2000);
            }).then(function (x) {
                return _globalState2.default.set('notification', '');
            });
        }
    }, {
        key: 'showStyleDescription',
        value: function showStyleDescription(evt) {

            var index = evt.target.value;
            var desc = _preferences2.default.descriptions[index];
            this.setState({ desc: desc });
        }
    }, {
        key: 'close',
        value: function close() {
            _globalState2.default.set('selectionModal', false);
        }
    }]);

    return SelectionModal;
}(React.Component);

exports.default = SelectionModal;