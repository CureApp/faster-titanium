
import {exec} from 'child_process'
import {relative, resolve} from 'path'
import debug from 'debug'
import optimizeAlloy from './optimize-alloy'
const alloyPath = resolve(__dirname, '../../node_modules/.bin/alloy')
const P = f => new Promise(f)
const ____ = debug('faster-titanium:AlloyCompiler')
const ___o = v => ____(v) || v


/**
 * compiling alloy files
 */
export default class AlloyCompiler {

    /**
     * @param {string} projDir
     */
    constructor(projDir, platform) {
        /** @type {string} */
        this.projDir = projDir
        this.platform = platform
    }

    /** @type {string} */
    get alloyDir() {
        return this.projDir + '/app'
    }

    /** @type {string} */
    get alloyJSPath() {
        return this.alloyDir + '/alloy.js'
    }

    /** @type {string} */
    get configPath() {
        return this.alloyDir + '/config.json'
    }

    /**
     * @param {string} path
     * @return {Promise}
     */
    compile(path) {

        if (path === this.alloyJSPath) return this.compileAlloyJS()

        if (path === this.configPath) return this.compileConfig()

        return this.compileFiles(path)
    }


    /**
     * @return {Promise}
     * @todo change deploytype by input
     */
    compileAlloyJS() {

        return this.compileFiles(this.alloyJSPath).then(() => {

            const relPath = relative(this.projDir, this.alloyJSPath)

            optimizeAlloy(this.projDir, relPath, {platform: this.platform, deploytype: 'development'})
        })
    }

    /**
     * @return {Promise}
     * @todo specific compilation
     */
    compileConfig() {
        return this.compileAlloyJS()
    }

    /**
     * @param {string} path
     * @return {Promise}
     */
    compileFiles(path) {
        const relPath = relative(this.projDir, path)
        const command = `${alloyPath} compile --config platform=${this.platform},file=${relPath}`
        ___o(command)
        return P(y => exec(command, y))
    }

    /**
     * compile all files
     * @deprecated
     */
    compileAll() {
        const command = `${alloyPath} compile --config platform=${this.platform}`
        ___o(command)
        return P(y => exec(command, y))
    }
}
