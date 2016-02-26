"use strict";
import Socket from './socket'
import RequireAgent from './require-agent'

const ____ = (v, type = 'log') => console[type]('[FasterTitanium]', v)


export default class FasterTitanium {

    /**
     * create instance of FasterTitanium and start app
     * @param {Object} g global object of Titanium environment
     * @param {Object} options
     * @param {number} options.fPort port number of file server
     * @param {number} options.nPort port number of notification server
     * @param {string} [options.host='localhost'] host hostname of the servers
     */
    static run(g, options) {
        const ft = new FasterTitanium(g, options)
        FasterTitanium.instance = ft
        ft.startApp()
    }


    /**
     * @param {Object} g global object of Titanium environment
     * @param {Object} options
     * @param {number} options.fPort port number of file server
     * @param {number} options.nPort port number of notification server
     * @param {string} [options.host='localhost'] host hostname of the servers
     */
    constructor(g, options = {}) {

        const { fPort, nPort, host = 'localhost' } = options

        /** @type {Object} global object of Titanium environment */
        this.global = g
        /** @type {RequireAgent} */
        this.reqAgent = new RequireAgent(this.global.require, host, fPort)
        /** @type {string} file server URL */
        this.url = `http://${host}:${fPort}`
        /** @type {number} the number of reload events excepted to occur @private */
        this.expectedReloads = 0
        /** @type {Socket} file server URL */
        this.socket = new Socket({host: host, port: parseInt(nPort, 10)})
        this.socket.onConnection(x => ____(`Connection established to ${host}:${nPort}`))

        this.registerListeners()
    }

    /**
     * register event listeners.
     * called only once in constructor
     * @private
     */
    registerListeners() {
        this.socket.onData(::this.onPayload)
        this.socket.onClose(x => {
            alert('[FasterTitanium] TCP server is terminated.')
            this.connectLater(10)
        })
        this.socket.onError(::this.socketError)
    }


    /**
     * connect to notification server and begin app with the given code
     */
    startApp() {
        this.socket.connect()
        this.reqAgent.require('app')
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
     * event listener called when the notification server sends payload
     * @param {string} payload (can be parsed as JSON)
     */
    onPayload(payload) {
        ____(`payload: ${JSON.stringify(payload)}`, 'trace')

        switch (payload.event) {
            case 'alloy-compilation':
                this.expectedReloads++
                break
            case 'alloy-compilation-done':
                this.expectedReloads--
                break
            case 'reload':
                this.reload(payload)
                break
            case 'reflect':
                this.reflect(payload)
                break
            default:
                break
        }
    }

    reflect(options = {}) {
        if (!options.names) return;

        options.names.forEach(name => {
            ____(`clearing cache ${name}`)
            this.reqAgent.clearCache(name)
        })
    }


    /**
     * reload this app
     * @param {Object} [options={}]
     * @param {number} [options.timer=0]
     * @param {boolean} [options.force=false]
     */
    reload(options = {}) {

        const { timer = 0, force = false } = options

        this.expectedReloads++

        setTimeout(x => {
            this.expectedReloads--

            if (this.expectedReloads > 0 && !force) {
                return ____(`Reload suppressed because unresolved alloy compilations exists. Use web reload button to force reloading: ${this.url}`)
            }

            this.socket.end()

            try {
                ____('reloading app')
                Ti.App._restart()
            }
            catch(e) {
                ____('reload')
                this.reqAgent.clearAllCaches()
                this.reqAgent.require('app')
            }
        }, timer)
    }
}

if (typeof Ti !== 'undefined') Ti.FasterTitanium = FasterTitanium
