'use strict'

const AUTO_RELOAD  = 1
const AUTO_REFLECT = 2
const MANUAL       = 3

export default class Preferences {

    static get selections() {
        return {
            AUTO_RELOAD,
            AUTO_REFLECT,
            MANUAL
        }
    }

    static get expressions() {
        return {
            [AUTO_RELOAD]: 'auto-reload',
            [AUTO_REFLECT]: 'auto-reflect',
            [MANUAL]: 'manual'
        }
    }

    static get descriptions() {
        return {
            [AUTO_RELOAD]: 'Reload everytime a file changes.',
            [AUTO_REFLECT]: 'Clear loaded modules in Titanium everytime a file changes (this may clear internal variables).',
            [MANUAL]: 'Do nothing.'
        }
    }


    constructor(options = {}) {
        const {loadStyleNum = AUTO_RELOAD, tiDebug = false, serverLog = true, localLog = false} = options

        /** @type {number} load style type */
        this.loadStyleNum = options.loadStyle || AUTO_RELOAD
        /** @type {boolean} whether to show titanium log in server console */
        this.tiDebug = tiDebug
        /** @type {boolean} whether to show titanium log in server console */
        this.serverLog = serverLog
        /** @type {boolean} whether to show titanium log in titanium console */
        this.localLog = localLog
    }

    apply(params = {}) {
        Object.keys(this).forEach(key => {
            const newValue = params[key]
            if(typeof newValue === typeof this[key]) this[key] = newValue
        })
    }


    get tiDebugNum() {
        return Number(this.tiDebug)
    }


    get style() {
        return this.constructor.expressions[this.loadStyleNum]
    }
}
