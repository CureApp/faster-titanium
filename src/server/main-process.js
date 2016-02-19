"use strict";

import debug from 'debug'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import EventServer from './event-server'
import AlloyCompiler from './alloy-compiler'
import { isAppJS } from '../util'

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

        /** @type {string} project dir */
        this.projDir = projDir
        /** @type {number} @private */
        this.reservedBroadcasts = 0
        /** @type {FileServer} */
        this.fServer = new FileServer(this.projDir, fPort, host)
        /** @type {FileWatcher} */
        this.watcher = new FileWatcher(this.projDir)
        /** @type {EventServer} */
        this.eServer = new EventServer(ePort, host)
        /** @type {AlloyCompiler} */
        this.compiler = new AlloyCompiler(this.projDir)

        this.registerListeners()
    }


    /**
     * register event listeners.
     * called only once in constructor
     * @private
     */
    registerListeners() {

        this.fServer.on('error', ___x)
        this.eServer.on('error', ___x)
        this.watcher.on('error', ___x)

        this.watcher.on('change', ::this.onResourceFileChanged)
        this.watcher.on('change:alloy', ::this.onAlloyFileChanged)
        this.fServer.on('got-kill-message', ::this.end)
        this.fServer.on('got-reload-message', ::this.broadcastReload)
    }


    /**
     * start fileserver and eventserver
     * @return {Promise}
     * @public
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
     * @public
     */
    end() {
        ____(`terminating servers`)
        Promise.all([
            this.fServer.close(),
            this.eServer.close(),
            this.watcher.close()
        ])
    }


    /**
     * called when files in Resources directory changed
     * @param {string} path
     * @private
     */
    onResourceFileChanged(path) {
        ____(`changed: ${path}`)

        if (isAppJS(this.projDir, path)) {
            this.fServer.clearAppJSCache()
        }
        this.broadcastReload()
    }

    /**
     * called when files in app directory (Alloy project) changed
     * @param {string} path
     * @private
     */
    onAlloyFileChanged(path) {
        if (path === this.projDir + '/app/alloy.js') {
            this.fServer.clearAppJSCache()
        }

        ____(`changed:alloy ${path}`)

        this.willBroadcast(this.compileAlloy(path).catch(___x))
    }

    /**
     * broadcast
     */
    willBroadcast(promise) {
        this.reservedBroadcasts++
        return promise.then(x => {
            this.reservedBroadcasts--
            return this.broadcastReload(0)
        })
    }


    /**
     * send reload message to all connected clients
     * @return {Promise}
     * @private
     */
    broadcastReload(duration = 1000) {

        this.reservedBroadcasts++

        return wait(duration).then(x => {
            this.reservedBroadcasts--
            ____("this.reservedBroadcasts", this.reservedBroadcasts)

            if (this.reservedBroadcasts > 0) { return; }

            this.eServer.broadcast({event: 'reload'})
        })
    }


    /**
     * compile alloy when one of the files in alloy changes
     * @param {string} path
     * @todo support for non-ios|android OS
     * @private
     */
    compileAlloy(path) {

        this.watcher.unwatchResources()

        return this.compiler.compile(path)
            .then(x => this.watcher.watchResources())
    }
}
