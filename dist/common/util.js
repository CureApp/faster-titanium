'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isAppJS = isAppJS;
exports.getPlatformDirname = getPlatformDirname;
exports.modNameByPath = modNameByPath;

var _path = require('path');

require('alloy/Alloy/common/constants');

var _index = require('alloy/platforms/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: prepare original object

var folderNames = Object.keys(_index2.default).map(function (p) {
    return _index2.default[p].titaniumFolder;
}); // it must be imported before alloy/platforms/index

folderNames.push(''); // for Resources/app.js
/**
 * @param {string} projectDir absolute path to the titanium project directory
 * @param {string} path absolute path to the path in Resources
 * @return {boolean} is app.js
 */
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

function modNameByPath(path, projectDir, platform) {
    var relative = path.split(projectDir + '/Resources/')[1];

    if (!relative) {
        throw new Error('invalid path for module name: ' + path);
    }

    if (relative.match(/\.js$/)) {
        relative = relative.slice(0, -3);
    }

    var platformDir = getPlatformDirname(platform);

    if (relative.indexOf(platformDir + '/') === 0) {
        return relative.split(platformDir + '/')[1];
    }
    return relative;
}