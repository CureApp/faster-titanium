"use strict";

import debug from 'debug'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import EventServer from './event-server'
import AlloyCompiler from './alloy-compiler'
const ____ = debug('faster-titanium:MainProcess')
const ___x = debug('faster-titanium:MainProcess:error')

const wait = t => new Promise(y => setTimeout(y, t))


/**
 * main process
 */
export default class MainProcess {

    /**
     * @param {string} projDir
     * @param {Object} [options={}]
     * @param {number} [options.minIntervalSec=3] minimum interval seconds to broadcast
     */
    constructor(projDir, options = {}) {

        const { fPort, ePort, host, minIntervalSec } = options

        this.lastBroadcast = 0

        this.minIntervalSec = parseInt(minIntervalSec, 10) || 3
        this.fServer = new FileServer(projDir, fPort, host)
        this.watcher = new FileWatcher(projDir)
        this.eServer = new EventServer(ePort, host)
        this.compiler = new AlloyCompiler(projDir)

        this.fServer.on('error', ___x)
        this.eServer.on('error', ___x)
        this.watcher.on('error', ___x)

        this.watcher.on('change', (path) => ____(`changed: ${path}`) || this.broadcastReload())
        this.watcher.on('change:alloy', ::this.compileAlloy)
        this.fServer.on('got-kill-message', ::this.end)
        this.fServer.on('got-reload-message', ::this.broadcastReload)
    }

    /** @type {number} */
    get timeToBroadcast() {
        const time = new Date().getTime()
        return Math.max(0, this.lastBroadcast + this.minIntervalSec * 1000 - time)
    }

    /**
     * send reload message to all connected clients
     */
    broadcastReload() {
        if (this.timeToBroadcast > 0) {
            return ____(`Broadcasting suppressed. Available in ${this.timeToBroadcast} msec.`)
        }

        this.eServer.broadcast({event: 'reload'})
        this.lastBroadcast = new Date().getTime()
    }


    /**
     * compile alloy when one of the files in alloy changes
     * @param {string} path
     * @todo support for non-ios|android OS
     */
    compileAlloy(path) {

        ____(`changed:alloy ${path}`)

        this.watcher.unwatchResources()

        this.compiler.compile(path)

        .then(x => wait(this.timeToBroadcast))
        .then(x => {
            this.broadcastReload(path)
            this.watcher.watchResources()
        })
        .catch(___x)
    }


    /**
     * start fileserver and eventserver
     * @return {Promise}
     */
    start() {
        ____(`starting servers`)
        return Promise.all([
            this.fServer.listen(),
            this.eServer.listen()
        ]).catch(___x)
    }

    /**
     * close servers and stop watching
     */
    end() {
        ____(`terminating servers`)
        Promise.all([
            this.fServer.close(),
            this.eServer.close(),
            this.watcher.close()
        ])
    }
}
