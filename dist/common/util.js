'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isAppJS = isAppJS;
exports.getPlatformDirname = getPlatformDirname;

var _path = require('path');

require('alloy/Alloy/common/constants');

var _index = require('alloy/platforms/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: prepare original object

var folderNames = Object.keys(_index2.default).map(function (p) {
    return _index2.default[p].titaniumFolder;
});
/**
 * @param {string} projectDir absolute path to the titanium project directory
 * @param {string} path absolute path to the path in Resources
 * @return {boolean} is app.js
 */
// it must be imported before alloy/platforms/index
function isAppJS(projectDir, path) {

    projectDir = (0, _path.resolve)(projectDir);
    path = (0, _path.resolve)(path);

    return folderNames.map(function (name) {
        return (0, _path.join)(projectDir, 'Resources', name, 'app.js');
    }).some(function (appPath) {
        return path === appPath;
    });
}

function getPlatformDirname(platform) {
    var platformInfo = _index2.default[platform];
    if (!platformInfo) {
        throw new Error('no platform found: ' + platform);
    }
    return platformInfo.titaniumFolder;
}