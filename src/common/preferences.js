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
        this.loadStyleNum = options.loadStyle || AUTO_RELOAD
        this.tiDebug = !!options.tiDebug
    }


    get tiDebugNum() {
        return Number(this.tiDebug)
    }


    get style() {
        return this.constructor.expressions[this.loadStyleNum]
    }
}
