/*
 * following codes are extracted and modified from alloy/Alloy/commands/compile/index.js
 */

import { existsSync, readFileSync as read, writeFileSync as write } from 'fs'
import path from 'path'
path.existsSync = existsSync // for backward compatibility

import uglifyjs from 'uglify-js'
import {getPlatformDirname} from '../common/util'
import CONST from 'alloy/Alloy/common/constants'
import { getAndValidateProjectPaths as getPaths } from 'alloy/Alloy/utils'
import { OPTIONS_OUTPUT as outputOptions } from 'alloy/Alloy/commands/compile/sourceMapper'

import debug from 'debug'
const ____ = debug('faster-titanium:optimizeAlloy')
const ___x = debug('faster-titanium:optimizeAlloy:error')


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
export default function optimizeAlloy(projDir, relPath, alloyConfig) {

    const paths = getPaths(projDir)

    const platformDirname = getPlatformDirname(alloyConfig.platform)

    const file = path.join(platformDirname, relPath.slice(4))

    const compileConfig = { alloyConfig, dir: paths }

    const fullpath = path.join(compileConfig.dir.resources, file)

    ____(`optimizing ${platformDirname}/${relPath}`)

    let ast = uglifyjs.parse(read(fullpath, 'utf8'), { filename: file })
    ast = [ 'builtins', 'optimizer' ]

        .map(modName => require('alloy/Alloy/commands/compile/ast/' + modName))

        .reduce((ast, mod) => {
            ast.figure_out_scope()
            return mod.process(ast, compileConfig) || ast
        }, ast)

    ast = compress(ast, alloyConfig)

    let stream = uglifyjs.OutputStream(outputOptions)
    ast.print(stream)
    write(fullpath, stream.toString())
}

// modify alloy/Alloy/commands/compile/ast/compress.js
function compress(ast, alloyConfig) {

    const { target, deploytype, platform } = alloyConfig

    // create list of platform and deploy type defines
    const defines = {}

    CONST.DEPLOY_TYPES.forEach(d => {
        defines[d.key] = deploytype === d.value
    })
    CONST.DIST_TYPES.forEach(d => {
        defines[d.key] = d.value.indexOf(target) >= 0
    })
    CONST.PLATFORMS.forEach(p => {
        defines['OS_' + p.toUpperCase()] = platform === p
    })

    const compressor = uglifyjs.Compressor({
        sequences     : false,  // join consecutive statemets with the “comma operator”
        properties    : false,   // optimize property access: a["foo"] → a.foo
        dead_code     : true,   // discard unreachable code
        drop_debugger : false,   // discard “debugger” statements
        unsafe        : false,   // some unsafe optimizations (see below)
        conditionals  : true,   // optimize if-s and conditional expressions
        comparisons   : true,   // optimize comparisons
        evaluate      : true,   // evaluate constant expressions
        booleans      : false,   // optimize boolean expressions
        loops         : false,   // optimize loops
        unused        : true,   // drop unused variables/functions
        hoist_funs    : true,   // hoist function declarations
        hoist_vars    : false,  // hoist variable declarations
        if_return     : false,   // optimize if-s followed by return/continue
        join_vars     : false,   // join var declarations
        cascade       : false,   // try to cascade `right` into `left` in sequences
        side_effects  : false,   // drop side-effect-free statements
        warnings      : false,   // warn about potentially dangerous optimizations/code
        global_defs   : defines      // global definitions
    })

    return ast.transform(compressor)
}
