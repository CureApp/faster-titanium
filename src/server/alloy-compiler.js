
import {exec} from 'child_process'
import {relative, resolve} from 'path'
import debug from 'debug'
import AlloyCompilationState from '../common/alloy-compilation-state'
import optimizeAlloy from './optimize-alloy'
const alloyPath = resolve(__dirname, '../../node_modules/.bin/alloy')
const P = f => new Promise(f)
const ____ = debug('faster-titanium:AlloyCompiler')
const ___o = v => ____(v) || v
const wait = (msec => new Promise(y => setTimeout(y, msec)))


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
        this.acState = new AlloyCompilationState(false) // false: timeout = false
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
     * is alloy compiling
     * @type {boolean}
     */
    get compiling() {
        return this.acState.compiling
    }

    /**
     * @param {string} path
     * @param {string} token identifier for this compilation
     * @return {Promise<boolean>} compilation succeeded or not
     */
    compile(path, token) {

        let compilation;

        this.acState.started(token)

        switch (path) {
            case this.alloyJSPath:
                compilation = this.compileAlloyJS()
                break
            case this.configPath:
                compilation = this.compileConfig()
                break
            default:
                compilation = this.compileFiles(path)
                break
        }

        return compilation
            .then(x => true, e => console.error('Alloy compilation failed.', e) || false)
            .then(result => {
                return wait(500).then(x => { // set some time lag for file watcher
                    this.acState.finished(token)
                    return result
                })
            })
    }


    /**
     * @return {Promise}
     * @todo change deploytype by input
     * @private
     */
    compileAlloyJS() {

        return this.compileFiles(this.alloyJSPath).then(() => {

            const relPath = relative(this.projDir, this.alloyJSPath)

            return optimizeAlloy(this.projDir, relPath, {platform: this.platform, deploytype: 'development'})
        })
    }

    /**
     * @return {Promise}
     * @todo specific compilation
     * @private
     */
    compileConfig() {
        return this.compileAlloyJS()
    }

    /**
     * @param {string} path
     * @return {Promise}
     * @private
     */
    compileFiles(path) {
        const relPath = relative(this.projDir, path)
        try {
            require('alloy/Alloy/commands/compile/index')([], {config: `platform=${this.platform},file=${relPath}`})
            return Promise.resolve()
        }
        catch (e) {
            return Promise.reject(e)
        }
    }
}
