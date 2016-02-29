/**
 * send log to server.
 * overwrite Ti.API.* and console.*
 */
export default class LogSender {

    /**
     * @param {Socket} socket
     * @param {Object} [options]
     * @param {boolean} [options.local]
     * @param {boolean} [options.server]
     */
    constructor(socket, options = {}) {
        this.socket = socket
        const {local = true, server = true} = options
        /** @type {boolean} show log in local */
        this.local  = local
        /** @type {boolean} send log to server */
        this.server = server
        this.TiAPI = Ti.API
        this.console = console
    }

    /**
     * overwrite Ti.API.* and console.*
     * @return {LogSender} this
     */
    define() {
        const API = {};

        ['info', 'trace', 'warn', 'debug', 'critical', 'error'].forEach(severity => {
            const fn = this.TiAPI[severity]
            API[severity] = (...args) => {
                if (this.server) this.send(args, severity)
                if (this.local)  fn.apply(this.TiAPI, args)
            }
        })
        Ti.API = API
        console = API
        console.log = console.info

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
