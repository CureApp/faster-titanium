
import {exec} from 'child_process'
import {relative, resolve} from 'path'
import debug from 'debug'
import AlloyCompilationState from '../common/alloy-compilation-state'
import optimizeAlloy from './optimize-alloy'
const alloyPath = resolve(__dirname, '../../node_modules/.bin/alloy')
const P = f => new Promise(f)
const ____ = debug('faster-titanium:AlloyCompiler')
const ___x = debug('faster-titanium:AlloyCompiler:error')
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
     * @return {Promise<string>}
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
            .catch(___x)
            .then(x => wait(200)) // set some time lag for file watcher
            .then(x => this.acState.finished(token))
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
        const command = `${alloyPath} compile --config platform=${this.platform},file=${relPath}`
        ___o(command)
        return P(y => exec(command, {cwd: this.projDir}, y))
    }

    /**
     * compile all files
     * @deprecated
     * @private
     */
    compileAll() {
        const command = `${alloyPath} compile --config platform=${this.platform}`
        ___o(command)
        return P(y => exec(command, {cwd: this.projDir}, y))
    }
}
