

/**
 * Memorize alloy compilation state (start/finish)
 */
export default class AlloyCompilationState {

    constructor(timeout = 5000) {
        if (timeout === false) {
            timeout = 1000 * 3600 * 24 // 1day (= never called)
        }
        this.tokens = {}
        this.timeout = timeout
    }

    /**
     * memorize start of alloy compilation
     * @param {string} token identifier
     */
    started(token) {

        const timer = setTimeout(x => {

            delete this.tokens[token]

        }, this.timeout)

        this.tokens[token] = timer
    }


    /**
     * clear alloy compilation memory
     * @param {string} token identifier
     */
    finished(token) {
        if (this.tokens[token]) {
            clearTimeout(this.tokens[token])
            delete this.tokens[token]
        }
    }

    /**
     * is alloy compiling
     * @type {boolean}
     */
    get compiling() {
        return Object.keys(this.tokens).length > 0
    }
}
