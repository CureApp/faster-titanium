'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = optimizeAlloy;

var _fs = require('fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

require('alloy/Alloy/common/constants');

var _uglifyJs = require('alloy/node_modules/uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _index = require('alloy/platforms/index');

var _index2 = _interopRequireDefault(_index);

var _utils = require('alloy/Alloy/utils');

var _sourceMapper = require('alloy/Alloy/commands/compile/sourceMapper');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * following codes are extracted and modified from alloy/Alloy/commands/compile/index.js
 */

_path2.default.existsSync = _fs.existsSync; // for backward compatibility

// it somehow resolves variables like 'OS_IOS'

var ____ = (0, _debug2.default)('faster-titanium:optimizeAlloy');
var ___x = (0, _debug2.default)('faster-titanium:optimizeAlloy:error');

/**
 * optimize js file in Alloy project and save it to Resources
 *
 * @issue it now re-writes js files other than alloy.js
 * @todo refactoring much of it!!!
 * @param {string} projDir
 * @param {string} relPath relative path from projDir
 * @param {object} alloyConfig
 * @param {string} [alloyConfig.platform]
 * @param {string} [alloyConfig.deploytype] development
 */
function optimizeAlloy(projDir, relPath, alloyConfig) {

    var paths = (0, _utils.getAndValidateProjectPaths)(projDir);

    var titaniumFolder = _index2.default[alloyConfig.platform].titaniumFolder;


    var file = _path2.default.join(titaniumFolder, relPath.slice(4));

    var compileConfig = { alloyConfig: alloyConfig, dir: paths };

    var fullpath = _path2.default.join(compileConfig.dir.resources, file);

    ____('optimizing ' + titaniumFolder + '/' + relPath);

    var ast = _uglifyJs2.default.parse((0, _fs.readFileSync)(fullpath, 'utf8'), { filename: file });
    ast = ['builtins', 'optimizer', 'compress'].map(function (modName) {
        return require('alloy/Alloy/commands/compile/ast/' + modName);
    }).reduce(function (ast, mod) {
        ast.figure_out_scope();
        return mod.process(ast, compileConfig) || ast;
    }, ast);

    var stream = _uglifyJs2.default.OutputStream(_sourceMapper.OPTIONS_OUTPUT);
    ast.print(stream);
    (0, _fs.writeFileSync)(fullpath, stream.toString());
}