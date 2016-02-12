
import Module from './module'
import Http from './http'
const ____ = (v) => console.log('[Faster-Titanium:RequireAgent]', v)

export default class RequireAgent {

    /**
     * @param {string} host
     * @param {number} port
     * @param {string} platform
     */
    constructor(host, port, platform) {
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
        const source = this.getServerSource(moduleName)
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
     * @returns {object}
     */
    getServerSource(moduleName) {

        const url = `http://${this.host}:${this.port}/${moduleName}.js`
        ____(`access to ${url}`)

        return Http.get(url, {
            timeout: this.timeout,
            header: { 'x-platform': this.platform }
        })
    }
}