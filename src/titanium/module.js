
/**
 * shimming node.js module
 */
export default class Module {

    constructor(moduleName) {
        /** @type {string} */
        this.moduleName = moduleName

        /** @type {Object} */
        this.exports = {}
    }


    /** @type {string} */
    get __dirname() {
        if (this.moduleName === 'app') { return undefined } // app.js doesn't have __dirname

        if (this.moduleName.match('/')) {
            return this.moduleName.replace(/\/[^\/]+$/, '')
        }
        else {
            return '.'
        }
    }

    /** @type {string} */
    get __filename() {
        if (this.moduleName === 'app') { return undefined } // app.js doesn't have __filename

        return this.moduleName.split('/').pop()
    }
}
