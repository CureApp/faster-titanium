/**
 * Singleton class. Class itself has states.
 */
export default class Logger {

    // pseudo constructor of this singleton.
    static init() {
        this.socket = null
        this.queue = []

        this.debugMode = false
        this.localLog  = false
        this.serverLog = false

        this.TiAPI = Ti.API
        this.console = console

        this.overwriteConsole()
    }

    static get severities() {
        return ['log', 'info', 'trace', 'warn', 'debug', 'critical', 'error']
    }


    /**
     * overwrite Ti.API.* and console.*
     */
    static overwriteConsole() {
        try {
            const API = {};

            this.severities.forEach(severity => {
                const fn = this.TiAPI[severity]
                API[severity] = (...args) => {

                    this.log(args, severity)

                }
            })
            Ti.API = API
            console = API
        }
        catch (e) {}
    }

    static log(args, severity, options) {

        this.serverLog && this.sendToServer(args, severity, options)

        this.localLog  && this.showLocalLog(args, severity, options)
    }


    static showLocalLog(args, severity, options = {}) {
        if (options.debugname) {
            args.unshift(`[${options.debugname}]`)
        }
        this.TiAPI[severity](...args)
    }


    /**
     * @param {string} debugname
     */
    static debug(debugname) {

        return (arg, severity = 'info') =>
            this.debugMode && this.log([arg], severity, {debugname})
    }


    /**
     * @param {Socket} socket
     */
    static serverLogEnabled(socket) {
        this.socket = socket

        while (this.queue.length) {
            const { args, severity, options } = this.queue.shift()
            this.sendToServer(args, severity, options)
        }
    }


    static serverLogDisabled() {
        this.socket = null
    }


    /**
     * send log to server via socket
     */
    static sendToServer(args, severity, options = {}) {
        if (!this.socket) {
            options.time = new Date().toISOString()
            return this.queue.push({args, severity, options})
        }

        try {
            this.socket.send({type: 'log', args, severity, options})
        }
        catch (e) {
            this.console.warn(`Couldn't send log to server. Socket is not writable.`)
        }
    }
}
