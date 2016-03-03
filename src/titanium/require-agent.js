
import Module from './module'
import Http from './http'
import AlertDialogReplacer from './alert-dialog-replacer'

import Logger from './logger'
const ____ = Logger.debug('FasterTitanium:RequireAgent')

export default class RequireAgent {



    /**
     * @param {function} original (titanium) require function
     * @param {string} host
     * @param {number} port
     */
    constructor(origRequire, host, port) {

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
    }

    /**
     * @param {string} moduleName
     * @returns {object}
     */
    require(moduleName) {

        ____(`requiring ${moduleName}`, 'trace')
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

        // global variables in the source
        const variables = {
            exports    : mod.exports,
            require    : v => this.requireRaw(v, mod),
            module     : mod,
            __dirname  : mod.__dirname,
            __filename : mod.__filename,
            alert      : AlertDialogReplacer.alert
        }

        var varNames  = Object.keys(variables).join(',')
        var varValues = Object.keys(variables).map(k => variables[k])

        Function(varNames, source).apply(null, varValues)

        return mod
    }


    /**
     * @param {string} moduleName
     * @returns {string} js code
     */
    getServerSource(moduleName) {

        const url = `http://${this.host}:${this.port}/${moduleName}.js`
        ____(`\tremote access: ${url}`, 'trace')

        return Http.get(url, {
            timeout: this.timeout
        })
    }

    /**
     * @param {string} moduleName
     * @returns {string} js code
     */
    getLocalSource(moduleName) {

        ____(`\tfile access: ${moduleName}`, 'trace')

        if (moduleName === 'app') moduleName = 'original-app'

        const file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, moduleName + '.js')

        return file.read().text;
    }


    /**
     * clear cache by name
     */
    clearCache(name) {
        delete this.modules[name]
    }


    /**
     * clear all module caches
     */
    clearAllCaches() {
        for (key in this.modules) {
            this.clearCache(key)
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
