"use strict";
import Preferences from '../common/preferences'
import Socket from './socket'
import RequireAgent from './require-agent'
import AlloyCompilationState from '../common/alloy-compilation-state'
import Http from './http'

import Logger from './logger'
const ____ = Logger.debug('FasterTitanium')


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
     * @param {string} [options.host='localhost'] access token for server
     */
    constructor(g, options = {}) {

        const { fPort, nPort, host = 'localhost', token } = options

        /** @type {string} access token for server */
        this.token = token
        /** @type {boolean} whether to connect to notification server */
        this.connected = false
        /** @type {Object} global object of Titanium environment */
        this.global = g
        /** @type {RequireAgent} */
        this.reqAgent = new RequireAgent(this.global.require, host, fPort)
        /** @type {string} file server URL */
        this.url = `http://${host}:${fPort}`
        /** @type {number} the number of reload events excepted to occur @private */
        this.expectedReloads = 0
        /** @type {AlloyCompilationState} */
        this.acState = new AlloyCompilationState()
        /** @type {number} counter, only used in reload()*/
        this.willReload = 0
        /** @type {Socket} file server URL */
        this.socket = new Socket({host: host, port: parseInt(nPort, 10)})
        this.socket.onConnection(x => this.socket.sendText(this.token))

        this.fetchPreferences(host, fPort)
        this.registerListeners()
    }


    /**
     * get Preferences from file server
     * @param {string} host
     * @param {number} fPort
     */
    fetchPreferences(host, fPort) {
        const url = `http://${host}:${fPort}/prefs`
        try {
            const response = Http.get(url, { timeout: 2000 })
            const prefs = new Preferences(JSON.parse(response))
            this.applyPreferences(prefs)
        }
        catch (e) {
            console.error(e)
        }
    }

    /**
     * register event listeners.
     * called only once in constructor
     * @private
     */
    registerListeners() {
        this.socket.onData(::this.onPayload)
        this.socket.onClose(x => {
            ____('Connection closed.')
            if (this.connected) {
                this.showDialog('TCP server is terminated. \n(This dialog will be closed in 3sec.)', 3000)
            }
            Logger.serverLogDisabled()
            this.connected = false
            this.connectLater(10)
        })
        this.socket.onError(::this.socketError)
    }


    /**
     * apply the given preferences
     * @param {Preferences} prefs
     */
    applyPreferences(prefs) {
        Logger.debugMode = prefs.tiDebug
        Logger.localLog = prefs.localLog
        Logger.serverLog = prefs.serverLog
        ____(`New preferences: ${JSON.stringify(prefs)}`, 'trace')
    }


    /**
     * Show dialog with given message
     * The dialog will close in {msec} milliseconds.
     * @param {string} message
     * @param {number} msec
     */
    showDialog(message, msec = 3000) {
        const dialog = Ti.UI.createAlertDialog({
            title: 'FasterTitanium',
            message
        })

        dialog.show()
        setTimeout(x => dialog.hide(), msec)
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
            case 'connected':
                this.connected = true
                Logger.serverLogEnabled(this.socket)
                ____(`Connection established to ${this.socket.url}`)
                break
            case 'alloy-compilation':
                this.acState.started(payload.token)
                break
            case 'alloy-compilation-done':
                this.acState.finished(payload.token)
                break
            case 'reload':
                this.reload(payload)
                break
            case 'reflect':
                this.reflect(payload)
                break
            case 'preferences':
                this.applyPreferences(new Preferences(payload.prefs))
                break
            default:
                break
        }
    }

    /**
     * clear existing caches of the changed modules
     */
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

        this.willReload++

        setTimeout(x => {
            this.willReload--

            if ((this.acState.compiling || this.willReload > 0) && !force) {
                return ____(`Reload suppressed because ongoing alloy compilations exist. Use web reload button to force reloading: ${this.url}`)
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
