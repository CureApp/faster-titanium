
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

        /** @type {function(moduleName: string):Object} */
        this.origRequire = origRequire

        /** @type {Map<string, Module>} */
        this.modules = {}

        /** @type {number} */
        this.timeout = 10000

        /** @type {number} */
        this.host = host

        /** @type {number} */
        this.host = host

        /** @type {number} */
        this.port = parseInt(port, 10)

        /** @type {string} iphone|android */
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
     * require module after resolving relative path, stripping extension
     * @param {string} rawModuleName
     * @param {Module} moduleFrom module where this method is called
     * @returns {object}
     */
    requireRaw(rawModuleName, moduleFrom) {

        let moduleName = rawModuleName

        // resolve relative path
        if (moduleName.match(/^\./)) {
            moduleName = relativePath(moduleFrom.moduleName, moduleName)
        }

        if (moduleName.match(/\.js$/)) {
            moduleName = moduleName.slice(0, -3)
        }
        return this.require(moduleName)
    }


    /**
     * @param {string} moduleName
     * @param {string} source
     */
    createModule(moduleName, source) {
        const mod = new Module(moduleName)

        const fn = Function('exports, require, module', source)
        fn(mod.exports, (v => this.requireRaw(v, mod)), mod)

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

        if (moduleName === 'app') moduleName = 'original-app'

        const file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, moduleName + '.js')

        return file.read().text;
    }


    /**
     * clear all module caches
     */
    clearCache() {
        for (key in this.modules) {
            delete this.modules[key]
        }
    }
}


/**
 * @param {string} from
 * @param {string} to
 * @private (export for test)
 */
export function relativePath(from, to) {

    const fromNodes = from.split('/')
    fromNodes.pop()

    const toNodes = to.split('/')

    for (let i in toNodes) {
        let toNode = toNodes[i]
        switch (toNode) {
            case '..':
                if (fromNodes.length === 0) {
                    throw new Error(`cannot resolve relative path. from: ${from}, to: ${to}`)
                }
                fromNodes.pop()
                break
            case '.':
                break
            default:
                fromNodes.push(toNode)
                break
        }
    }
    return fromNodes.join('/')
}
