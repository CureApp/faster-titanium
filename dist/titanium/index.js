'use strict';

var _fasterTitanium = require('./faster-titanium');

var _fasterTitanium2 = _interopRequireDefault(_fasterTitanium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof Ti !== 'undefined') Ti.FasterTitanium = _fasterTitanium2.default;
module.exports = _fasterTitanium2.default;