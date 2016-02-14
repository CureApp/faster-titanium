
export default class Module {

    constructor(moduleName) {
        /** @type {string} */
        this.moduleName = moduleName

        /** @type {Object} */
        this.exports = {}
    }
}
