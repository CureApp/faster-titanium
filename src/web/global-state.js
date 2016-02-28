

/**
 * handles state of Root component
 */
export default class GlobalState {

    static initialize(root) {
        GlobalState.instance = new GlobalState(root)
    }

    static set(...args) {
        GlobalState.instance.set(...args)
    }

    constructor(root) {
        this.root = root
        this.state = clone(this.root.state)
    }


    /**
     * set(k1, k2, k3, v) => state[k1][k2][k3] = v
     */
    set(...args) {
        const value = args.pop()
        const lastKey = args.pop()
        let obj = args.reduce((obj, k) => obj[k], this.state)
        obj[lastKey] = value
        this.root.setState(clone(this.state))
    }
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj)) // todo: better implementation like Immutable.js
}
