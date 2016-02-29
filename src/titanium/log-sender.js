/**
 * send log to server.
 * overwrite Ti.API.* and console.*
 */
export default class LogSender {

    /**
     * @param {Socket} socket
     * @param {Object} [options]
     * @param {boolean} [options.localLog]
     * @param {boolean} [options.serverLog]
     */
    constructor(socket, options = {}) {
        this.socket = socket
        const {localLog = true, serverLog = true} = options
        /** @type {boolean} show log in local */
        this.localLog  = localLog
        /** @type {boolean} send log to server */
        this.serverLog = serverLog
        this.TiAPI = Ti.API
        this.console = console
    }

    /**
     * overwrite Ti.API.* and console.*
     * @return {LogSender} this
     */
    define() {
        try {
            const API = {};

            ['info', 'trace', 'warn', 'debug', 'critical', 'error'].forEach(severity => {
                const fn = this.TiAPI[severity]
                API[severity] = (...args) => {
                    if (this.serverLog) this.send(args, severity)
                    if (this.localLog)  fn.apply(this.TiAPI, args)
                }
            })
            Ti.API = API
            console = API
            console.log = console.info
        }
        catch (e) {}

        return this
    }

    send(args, severity) {
        try {
            this.socket.send({type: 'log', args, severity})
        }
        catch (e) {
            this.console.warn(`Couldn't send log to server. Socket is not writable.`)
        }
    }
}
