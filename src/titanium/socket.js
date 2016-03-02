

export default class Socket {

    constructor(options = {}) {

        const { host, port } = options

        this.host = host
        this.port = port
        this.dataListener  = null
        this.errorListener = null
        this.proxy = this.createTCPSocket()
    }

    /** @type {string} */
    get url() {
        return `${this.host}:${this.port}`
    }


    /**
     * connect to TCP server
     */
    connect() {
        this.proxy.connect()
    }


    /**
     * reconnect to TCP server
     */
    reconnect() {
        this.end()
        delete this.proxy
        this.proxy = this.createTCPSocket()
        this.connect()
    }


    /**
     * create socket proxy for TCP connection
     */
    createTCPSocket() {
        return Ti.Network.Socket.createTCP({
            host: this.host,
            port: this.port,

            connected: (v) => {

                this.connectionListener && this.connectionListener()

                Ti.Stream.pump(v.socket, e => {
                    // end signal
                    if (!e.buffer) {
                        return this.closeListener && this.closeListener()
                    }
                    if (!this.dataListener) return

                    ('' + e.buffer)
                        .trim()
                        .split('\n') // split two or more JSONs (see src/server/event-server.js)
                        .map(str => {
                            try { return JSON.parse(str) }
                            catch (e) { console.error(e); return null }
                        })
                        .filter(v => v != null)
                        .forEach(payload => this.dataListener(payload))
                }, 1024, true)
            },

            error: (e) => this.errorListener && this.errorListener(e)
        })
    }

    /**
     * send payload to server
     * @param {Object} payload
     */
    send(payload) {
        const buf = Ti.createBuffer({value: JSON.stringify(payload) + '\n'})
        const bytes = this.proxy.write(buf)
    }


    /**
     * send string to server
     * @param {string} str
     */
    sendText(str) {
        const buf = Ti.createBuffer({value: str})
        const bytes = this.proxy.write(buf)
    }



    /**
     * set listener of data event
     * @param {function} fn
     */
    onData(fn) {
        if (typeof fn === 'function') this.dataListener = fn
    }

    /**
     * set listener of close event
     * @param {function} fn
     */
    onClose(fn) {
        if (typeof fn === 'function') this.closeListener = fn
    }

    /**
     * set listener of connection event
     * @param {function} fn
     */
    onConnection(fn) {
        if (typeof fn === 'function') this.connectionListener = fn
    }

    /**
     * set listener of error event
     * @param {function} fn
     */
    onError(fn) {
        if (typeof fn === 'function') this.errorListener = fn
    }

    /**
     * close socket
     */
    end() {
        try { this.proxy.close() } catch (e) {}
    }
}
