'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = optimizeAlloy;

var _fs = require('fs');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _uglifyJs = require('uglify-js');

var _uglifyJs2 = _interopRequireDefault(_uglifyJs);

var _util = require('../common/util');

var _constants = require('alloy/Alloy/common/constants');

var _constants2 = _interopRequireDefault(_constants);

var _utils = require('alloy/Alloy/utils');

var _sourceMapper = require('alloy/Alloy/commands/compile/sourceMapper');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * following codes are extracted and modified from alloy/Alloy/commands/compile/index.js
 */

_path2.default.existsSync = _fs.existsSync; // for backward compatibility

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

    var platformDirname = (0, _util.getPlatformDirname)(alloyConfig.platform);

    var file = _path2.default.join(platformDirname, relPath.slice(4));

    var compileConfig = { alloyConfig: alloyConfig, dir: paths };

    var fullpath = _path2.default.join(compileConfig.dir.resources, file);

    ____('optimizing ' + platformDirname + '/' + relPath);

    var ast = _uglifyJs2.default.parse((0, _fs.readFileSync)(fullpath, 'utf8'), { filename: file });
    ast = ['builtins', 'optimizer'].map(function (modName) {
        return require('alloy/Alloy/commands/compile/ast/' + modName);
    }).reduce(function (ast, mod) {
        ast.figure_out_scope();
        return mod.process(ast, compileConfig) || ast;
    }, ast);

    ast = compress(ast, alloyConfig);

    var stream = _uglifyJs2.default.OutputStream(_sourceMapper.OPTIONS_OUTPUT);
    ast.print(stream);
    (0, _fs.writeFileSync)(fullpath, stream.toString());
}

// modify alloy/Alloy/commands/compile/ast/compress.js
function compress(ast, alloyConfig) {
    var target = alloyConfig.target;
    var deploytype = alloyConfig.deploytype;
    var platform = alloyConfig.platform;

    // create list of platform and deploy type defines

    var defines = {};

    _constants2.default.DEPLOY_TYPES.forEach(function (d) {
        defines[d.key] = deploytype === d.value;
    });
    _constants2.default.DIST_TYPES.forEach(function (d) {
        defines[d.key] = d.value.indexOf(target) >= 0;
    });
    _constants2.default.PLATFORMS.forEach(function (p) {
        defines['OS_' + p.toUpperCase()] = platform === p;
    });

    var compressor = _uglifyJs2.default.Compressor({
        sequences: false, // join consecutive statemets with the “comma operator”
        properties: false, // optimize property access: a["foo"] → a.foo
        dead_code: true, // discard unreachable code
        drop_debugger: false, // discard “debugger” statements
        unsafe: false, // some unsafe optimizations (see below)
        conditionals: true, // optimize if-s and conditional expressions
        comparisons: true, // optimize comparisons
        evaluate: true, // evaluate constant expressions
        booleans: false, // optimize boolean expressions
        loops: false, // optimize loops
        unused: true, // drop unused variables/functions
        hoist_funs: true, // hoist function declarations
        hoist_vars: false, // hoist variable declarations
        if_return: false, // optimize if-s followed by return/continue
        join_vars: false, // join var declarations
        cascade: false, // try to cascade `right` into `left` in sequences
        side_effects: false, // drop side-effect-free statements
        warnings: false, // warn about potentially dangerous optimizations/code
        global_defs: defines // global definitions
    });

    return ast.transform(compressor);
}