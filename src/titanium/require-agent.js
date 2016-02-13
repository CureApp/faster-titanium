
import Module from './module'
import Http from './http'
const ____ = (v, type = 'log') => console[type]('[FasterTitanium:RequireAgent]', v)

export default class RequireAgent {

    /**
     * @param {function} original (titanium) require function
     * @param {string} host
     * @param {number} port
     * @param {string} platform
     */
    constructor(origRequire, host, port, platform) {
        this.origRequire = origRequire
        this.modules = {}
        this.timeout = 10000

        this.host = host
        this.port = parseInt(port, 10)
        this.platform = platform
    }

    /**
     * @param {string} moduleName
     * @returns {object}
     */
    require(moduleName) {

        ____(`requiring ${moduleName}`)
        if (this.modules[moduleName]) {
            return this.modules[moduleName].exports
        }

        let source
        try {
            source = this.getServerSource(moduleName)
        }
        catch (e) {
            console.warn(`Couldn't fetch module ${moduleName} from HTTP server. Use local file.`)
            try {
                source = this.getLocalSource(moduleName)
            }
            catch (e) {
                console.warn(`Couldn't fetch module ${moduleName} from file system. Use original require.`)
                return this.origRequire(moduleName)
            }
        }
        const mod = this.createModule(moduleName, source)
        this.modules[moduleName] = mod
        return mod.exports
    }

    /**
     * @param {string} rawModuleName
     * @returns {object}
     */
    requireRaw(rawModuleName) {
        const moduleName = rawModuleName
        return this.require(moduleName)
    }


    /**
     * @param {string} moduleName
     * @param {string} source
     */
    createModule(moduleName, source) {
        const mod = new Module()

        const fn = Function('exports, require, module', source);
        fn(mod.exports, (v => this.requireRaw(v)), mod)

        return mod
    }


    /**
     * @param {string} moduleName
     * @returns {string} js code
     */
    getServerSource(moduleName) {

        const url = `http://${this.host}:${this.port}/${moduleName}.js`
        ____(`\tremote access: ${url}`)

        return Http.get(url, {
            timeout: this.timeout,
            header: { 'x-platform': this.platform }
        })
    }

    /**
     * @param {string} moduleName
     * @returns {string} js code
     */
    getLocalSource(moduleName) {

        ____(`\tfile access: ${moduleName}`)

        if (moduleName === 'app') moduleName = 'second-entry-after-faster-titanium'

        const file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, moduleName + '.js')

        return file.read().text;
    }

}
