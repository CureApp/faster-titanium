"use strict";

// import React from 'react' // installed from external script for performance
// import ReactDOM from 'react-dom' // installed from external script for performance

var _root = require('./components/root');

var _root2 = _interopRequireDefault(_root);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.addEventListener('load', function (x) {
  return ReactDOM.render(React.createElement(_root2.default, null), document.getElementById('container'));
});