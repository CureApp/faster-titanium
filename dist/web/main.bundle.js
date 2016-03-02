(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AUTO_RELOAD = 1;
var AUTO_REFLECT = 2;
var MANUAL = 3;

var Preferences = function () {
    _createClass(Preferences, null, [{
        key: 'selections',
        get: function get() {
            return {
                AUTO_RELOAD: AUTO_RELOAD,
                AUTO_REFLECT: AUTO_REFLECT,
                MANUAL: MANUAL
            };
        }
    }, {
        key: 'expressions',
        get: function get() {
            var _ref;

            return _ref = {}, _defineProperty(_ref, AUTO_RELOAD, 'auto-reload'), _defineProperty(_ref, AUTO_REFLECT, 'auto-reflect'), _defineProperty(_ref, MANUAL, 'manual'), _ref;
        }
    }, {
        key: 'descriptions',
        get: function get() {
            var _ref2;

            return _ref2 = {}, _defineProperty(_ref2, AUTO_RELOAD, 'Reload everytime a file changes.'), _defineProperty(_ref2, AUTO_REFLECT, 'Clear loaded modules in Titanium everytime a file changes (this may clear internal variables).'), _defineProperty(_ref2, MANUAL, 'Do nothing.'), _ref2;
        }
    }]);

    function Preferences() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Preferences);

        var _options$loadStyleNum = options.loadStyleNum;
        var loadStyleNum = _options$loadStyleNum === undefined ? AUTO_RELOAD : _options$loadStyleNum;
        var _options$tiDebug = options.tiDebug;
        var tiDebug = _options$tiDebug === undefined ? false : _options$tiDebug;
        var _options$serverLog = options.serverLog;
        var serverLog = _options$serverLog === undefined ? true : _options$serverLog;
        var _options$localLog = options.localLog;
        var localLog = _options$localLog === undefined ? false : _options$localLog;

        /** @type {number} load style type */

        this.loadStyleNum = loadStyleNum;
        /** @type {boolean} whether to show titanium log in server console */
        this.tiDebug = tiDebug;
        /** @type {boolean} whether to show titanium log in server console */
        this.serverLog = serverLog;
        /** @type {boolean} whether to show titanium log in titanium console */
        this.localLog = localLog;
    }

    _createClass(Preferences, [{
        key: 'apply',
        value: function apply() {
            var _this = this;

            var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            Object.keys(this).forEach(function (key) {
                var newValue = params[key];
                if ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) === _typeof(_this[key])) _this[key] = newValue;
            });
        }
    }, {
        key: 'tiDebugNum',
        get: function get() {
            return Number(this.tiDebug);
        }
    }, {
        key: 'style',
        get: function get() {
            return this.constructor.expressions[this.loadStyleNum];
        }
    }]);

    return Preferences;
}();

exports.default = Preferences;
},{}],2:[function(require,module,exports){
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
},{"../global-state":7,"../styles/modal":10,"./fa":3}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FontAwesomeComponent = function (_React$Component) {
    _inherits(FontAwesomeComponent, _React$Component);

    function FontAwesomeComponent(props) {
        _classCallCheck(this, FontAwesomeComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FontAwesomeComponent).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(FontAwesomeComponent, [{
        key: "render",
        value: function render() {
            return React.createElement("i", _extends({ className: this.className }, this.props));
        }
    }, {
        key: "className",
        get: function get() {
            return "fa fa-" + this.props.icon;
        }
    }]);

    return FontAwesomeComponent;
}(React.Component);

exports.default = FontAwesomeComponent;
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _postPreferences2 = require('../post-preferences');

var _postPreferences3 = _interopRequireDefault(_postPreferences2);

var _fa = require('./fa');

var _fa2 = _interopRequireDefault(_fa);

var _globalState = require('../global-state');

var _globalState2 = _interopRequireDefault(_globalState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
                },

                'show debug log in Titanium': function showDebugLogInTitanium(v, k) {
                    return _this2.getSwitchUI(v, k, 'tiDebug');
                },
                'show ti log in server console': function showTiLogInServerConsole(v, k) {
                    return _this2.getSwitchUI(v, k, 'serverLog');
                },
                'show ti log in titanium console': function showTiLogInTitaniumConsole(v, k) {
                    return _this2.getSwitchUI(v, k, 'localLog');
                }
            };

            return modifiers[k] ? modifiers[k](v, k) : React.createElement(
                'td',
                null,
                v
            );
        }

        /**
         * binary switch in <td>
         * click => send server and flip the value
         * @param {boolean} bool the value
         * @param {string} propName table property name
         * @param {string} prefKey a property name of Preferences object
         */

    }, {
        key: 'getSwitchUI',
        value: function getSwitchUI(bool, propName, prefKey) {
            var onClick = function onClick(evt) {
                (0, _postPreferences3.default)(_defineProperty({}, prefKey, !bool)).then(function (json) {
                    return _globalState2.default.set('tableInfo', propName, !bool);
                });
            };

            return React.createElement(
                'td',
                { style: { cursor: 'pointer' }, onClick: onClick },
                React.createElement(_fa2.default, { icon: bool ? 'toggle-on' : 'toggle-off', style: { color: bool ? 'green' : 'gray', fontSize: 30 } })
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
},{"../global-state":7,"../post-preferences":9,"./fa":3}],5:[function(require,module,exports){
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
                    { style: { height: 25 } },
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
},{"../global-state":7,"./connection-hint-modal":2,"./info-table":4,"./selection-modal":6}],6:[function(require,module,exports){
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
},{"../../common/preferences":1,"../global-state":7,"../post-preferences":9,"../styles/modal":10}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * handles state of Root component
 */

var GlobalState = function () {
    _createClass(GlobalState, null, [{
        key: "initialize",
        value: function initialize(root) {
            GlobalState.instance = new GlobalState(root);
        }
    }, {
        key: "set",
        value: function set() {
            var _GlobalState$instance;

            (_GlobalState$instance = GlobalState.instance).set.apply(_GlobalState$instance, arguments);
        }
    }]);

    function GlobalState(root) {
        _classCallCheck(this, GlobalState);

        this.root = root;
        this.state = clone(this.root.state);
    }

    /**
     * set(k1, k2, k3, v) => state[k1][k2][k3] = v
     */


    _createClass(GlobalState, [{
        key: "set",
        value: function set() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var value = args.pop();
            var lastKey = args.pop();
            var obj = args.reduce(function (obj, k) {
                return obj[k];
            }, this.state);
            obj[lastKey] = value;
            this.root.setState(clone(this.state));
        }
    }]);

    return GlobalState;
}();

exports.default = GlobalState;


function clone(obj) {
    return JSON.parse(JSON.stringify(obj)); // todo: better implementation like Immutable.js
}
},{}],8:[function(require,module,exports){
"use strict";

// import React from 'react' // installed from external script for performance
// import ReactDOM from 'react-dom' // installed from external script for performance

var _root = require('./components/root');

var _root2 = _interopRequireDefault(_root);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.addEventListener('load', function (x) {
  return ReactDOM.render(React.createElement(_root2.default, null), document.getElementById('container'));
});
},{"./components/root":5}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = postPreferences;
function postPreferences() {
    var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];


    return fetch('/prefs', { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    }).then(function (res) {
        return res.json();
    });
}
},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    textAlign: 'center',
    zIndex: 1000,
    borderRadius: 3,
    background: 'rgba(50,50,50, 0.6)'
};
},{}]},{},[8]);
