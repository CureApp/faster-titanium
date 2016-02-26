
import debug from 'debug'
import net from 'net'
import FileWatcher from './file-watcher'
import {EventEmitter} from 'events'
const P = f => new Promise(f)
const ____ = debug('faster-titanium:NotificationServer')
const ___x = debug('faster-titanium:NotificationServer:error')

/**
 * Server connecting continuously with Titanium App.
 * Restrict connection: only one device can connect to the server.
 */
export default class NotificationServer extends EventEmitter {

    /**
     * @param {string} [port]
     */
    constructor(port) {
        super()
        this.port = port
        this.client = null
        this.server = net.createServer(::this.addClient)
        this.server.on('error', err => ___x(err) || this.emit('error', err))
    }

    /**
     * listen
     * @public
     * @return {Promise}
     */
    listen() {
        return P(y => this.server.listen(this.port, y)).then(x =>{
            ____(`start listening ${this.port}`)
        })
    }

    /**
     * close server
     * @public
     * @return {Promise}
     */
    close() {
        ____(`terminating...`)
        this.client && this.client.destroy()

        return P(y => this.server.close(y)).then(x => {
            ____(`terminated`)
        })
    }

    /**
     * add a client socket
     * @param {net.Socket} socket
     */
    addClient(socket) {
        if (this.client) {
            ____(`New connection, Overwrite existing connection.`)
            if (this.client.writable) { this.client.end() }
        }
        else {
            ____(`New connection. Set client.`)
        }

        socket.setEncoding('utf8')
        this.client = socket
    }


    /**
     * send payload to the client
     * @param {object} [payload={}]
     */
    send(payload = {}) {
        if (!this.client) {
            return ____(`sending message suppressed: No client.`)
        }
        if (!this.client.writable) {
            this.client = null
            return ____(`sending message suppressed: Socket is not writable.`)
        }

        ____(`sending payload: ${JSON.stringify(payload)}\n`)
        // as payloads are sometimes joined with previous one, the client should split them with "\n" separator
        // (see src/titanium/socket.js)
        this.client.write(JSON.stringify(payload) + '\n')
    }
}
