"use strict";
import Socket from './socket'
import RequireAgent from './require-agent'

const ____ = (v, type = 'log') => console[type]('[FasterTitanium]', v)


export default class FasterTitanium {

    /**
     * create instance of FasterTitanium and initialize app
     * @param {Object} g global object of Titanium environment
     * @param {Object} options
     * @param {number} [options.fPort=4157] port number of file server
     * @param {number} [options.ePort=4156] port number of event server
     * @param {string} [options.host='localhost'] host hostname of the servers
     */
    static run(g, options = {}) {
        const ft = new FasterTitanium(g, options)
        FasterTitanium.instance = ft
        ft.init()
    }


    /**
     * @param {Object} g global object of Titanium environment
     * @param {Object} options
     * @param {number} [options.fPort=4157] port number of file server
     * @param {number} [options.ePort=4156] port number of event server
     * @param {string} [options.host='localhost'] host hostname of the servers
     */
    constructor(g, options = {}) {

        const { fPort = 4157, ePort = 4156, host = 'localhost' } = options

        /** @type {Object} global object of Titanium environment */
        this.global = g

        /** @type {RequireAgent} */
        this.reqAgent = new RequireAgent(this.global.require, host, fPort, this.getPlatform())

        /** @type {string} file server URL */
        this.url = `http://${host}:${fPort}`

        /** @type {Socket} file server URL */
        this.socket = new Socket({host: host, port: parseInt(ePort, 10)})
        this.socket.onData(::this.reload)
        this.socket.onClose(x => alert('[FasterTitanium] TCP server is terminated.'))
        this.socket.onError(::this.socketError)
    }

    /**
     * connect to event server and begin app
     */
    init() {
        this.socket.connect()
        this.reqAgent.require('second-entry-after-faster-titanium')
    }


    /**
     * @returns {string}
     */
    getPlatform() {
        return Ti.Platform.osname
    }


    /**
     * @param {Object} err error from TCP socket
     */
    socketError(err) {
        switch (err.code) {
            case 50: // Network Unreachable
                ____('Network unreachable. Try reconnecting in 10secs', 'warn')
                this.connectLater(10)
                break
            case 57: // Socket is not connected
                ____('Connectiton failed. Try reconnecting in 1sec', 'warn')
                this.connectLater(1)
                break
            case 61: // Connection refused
                ____(`Connectiton refused. Check if server is alive: ${this.url}`, 'warn')
                this.connectLater(10)
                break
            default:
                console.warn(err)
                ____('TCP Socket Error. Try reconnecting in 10secs', 'warn')
                this.connectLater(10)
                break
        }
    }


    /**
     * connect to TCP server later
     */
    connectLater(sec = 10) {
        setTimeout(::this.socket.reconnect, sec * 1000)
    }

    /**
     * reload this app
     */
    reload() {

        this.socket.end()

        try {
            ____('reloading app');
            Ti.App._restart();
        }
        catch(e) {
            ____('reloading App via legacy method');
            this.reqAgent.require('app');
        }
    }
}

if (typeof Ti !== 'undefined') Ti.FasterTitanium = FasterTitanium
