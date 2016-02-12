

export default class Socket {

    constructor(options = {}) {

        const { host, port } = options

        this.dataListener = null

        this.proxy = Ti.Network.Socket.createTCP({
            host: host,
            port: port,

            connected: (v) => {

                Ti.Stream.pump(v.socket, e => {
                    this.dataListener && this.dataListener('' + e.buffer)
                }, 1024, true)
            },

            error: (e) => {
                console.log(e)
            }
        })

        this.proxy.connect()
    }


    onData(fn) {
        if (typeof fn === 'function') {
            this.dataListener = fn
        }
    }

    end() {
        this.proxy.close()
    }
}
