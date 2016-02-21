/*
 * following codes are extracted and modified from alloy/Alloy/commands/compile/index.js
 */

import { existsSync, readFileSync as read, writeFileSync as write } from 'fs'
import path from 'path'
path.existsSync = existsSync // for backward compatibility

import uglifyjs from 'alloy/node_modules/uglify-js'
import {getPlatformDirname} from '../common/util'
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
    ast = [ 'builtins', 'optimizer', 'compress' ]

        .map(modName => require('alloy/Alloy/commands/compile/ast/' + modName))

        .reduce((ast, mod) => {
            ast.figure_out_scope()
            return mod.process(ast, compileConfig) || ast
        }, ast)

    let stream = uglifyjs.OutputStream(outputOptions)
    ast.print(stream)
    write(fullpath, stream.toString())
}
