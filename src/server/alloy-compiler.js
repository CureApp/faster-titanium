
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
    constructor(projDir) {
        /** @type {string} */
        this.projDir = projDir
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
     * @type {string[]}
     * @todo put all platforms
     */
    get platforms() {
        return ['ios', 'android']
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

            this.platforms.forEach(os => {
                optimizeAlloy(this.projDir, relPath, {platform: os, deploytype: 'development'})
            })
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

        return Promise.all(
            this.platforms
                .map (os => `${alloyPath} compile --config platform=${os},file=${relPath}`)
                .map(___o)
                .map(command => P(y => exec(command, y)))
        )
    }

    /**
     * compile all files
     * @deprecated
     */
    compileAll() {
        return Promise.all(
            this.platforms
                .map (os => `${alloyPath} compile --config platform=${os}`)
                .map(___o)
                .map(command => P(y => exec(command, y)))
        )
    }
}
