
import debug from 'debug'
import net from 'net'
import FileWatcher from './file-watcher'
import {EventEmitter} from 'events'
const P = f => new Promise(f)
const ____ = debug('faster-titanium:EventServer')
const ___x = debug('faster-titanium:EventServer:error')

/**
 * Server connecting continuously with Titanium
 */
export default class EventServer extends EventEmitter {

    /**
     * @param {string} [port=4156]
     */
    constructor(port = 4156, host = '127.0.0.1') {
        super()
        this.port = port
        this.host = host
        this.sockets = []
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
            ____(`start listening ${this.host}:${this.port}`)
        })
    }

    /**
     * close server
     * @public
     * @return {Promise}
     */
    close() {
        ____(`terminating...`)
        this.sockets.forEach(socket => socket.destroy())
        return P(y => this.server.close(y)).then(x =>{
            ____(`terminated`)
        })
    }

    /**
     * add a client socket
     * @param {net.Socket} socket
     */
    addClient(socket) {
        ____(`New connection. Add client.`)
        socket.setEncoding('utf8')
        this.sockets.push(socket)
    }


    /**
     * send payload to all available sockets
     * @param {object} [payload={}]
     */
    broadcast(payload = {}) {
        ____(`broadcasting payload: ${JSON.stringify(payload)}`)
        this.updateSockets().forEach(socket => {
            socket.write(JSON.stringify(payload))
        })
    }


    /**
     * filter closed sockets
     * @private
     */
    updateSockets() {
        return this.sockets = this.sockets.filter(socket => socket.writable)
    }
}
