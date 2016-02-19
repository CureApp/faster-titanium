'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAppJS = isAppJS;

var _path = require('path');

/**
 * @param {string} projectDir absolute path to the titanium project directory
 * @param {string} path absolute path to the path in Resources
 * @return {boolean} is app.js
 */
function isAppJS(projectDir, path) {

  projectDir = (0, _path.resolve)(projectDir);
  path = (0, _path.resolve)(path);

  return ['', 'android', 'ipad', 'iphone', 'ios'].map(function (name) {
    return (0, _path.join)(projectDir, 'Resources', name, 'app.js');
  }).some(function (appPath) {
    return path === appPath;
  });
}