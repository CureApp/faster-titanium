"use strict";

import debug from 'debug'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import EventServer from './event-server'
import AlloyCompiler from './alloy-compiler'
import Preferences from '../common/preferences'
import { isAppJS } from '../common/util'

const ____ = debug('faster-titanium:MainProcess')
const ___x = debug('faster-titanium:MainProcess:error')


/**
 * main process
 */
export default class MainProcess {

    /**
     * @param {string} projDir
     * @param {Object} [options={}]
     * @param {number} fPort port number of the file server
     * @param {number} ePort port number of the event server
     * @param {string} host host name or IP Address
     * @param {string} platform platform name (ios|android|mobileweb|windows)
     */
    constructor(projDir, options = {}) {

        const { fPort, ePort, host, platform } = options

        /** @type {string} project dir */
        this.projDir = projDir
        /** @type {string} platform os name of the Titanium App */
        this.platform = platform
        /** @type {Preferences} */
        this.prefs = new Preferences()
        /** @type {FileServer} */
        this.fServer = new FileServer(this.projDir, this.platform, fPort, host, ::this.getInfo)
        /** @type {FileWatcher} */
        this.watcher = new FileWatcher(this.projDir)
        /** @type {EventServer} */
        this.eServer = new EventServer(ePort, host)
        /** @type {AlloyCompiler} */
        this.compiler = new AlloyCompiler(this.projDir, this.platform)

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
        this.fServer.on('got-reload-message', x => this.sendReload({force: true}))
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
        this.sendReload({timer: 1000})
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

        this.send({event: 'will-reload'})

        this.compileAlloy(path)
            .catch(___x)
            .then(x => this.sendReload({reserved: true}))
    }

    /**
     * send message to the client of event server
     * @param {Object} payload
     * @param {string} payload.event event name. oneof will-reload|reload|reflect
     */
    send(payload) {
        console.assert(payload && payload.event)
        this.eServer.send(payload)
    }

    /**
     * send reload message to all connected clients
     * @param {Object} [options={}]
     * @return {Promise}
     * @private
     */
    sendReload(options = {}) {
        const payload = Object.assign({}, {event: 'reload'}, options)
        this.send(payload)
    }


    /**
     * compile alloy when one of the files in alloy changes
     * @param {string} path
     * @private
     */
    compileAlloy(path) {

        this.watcher.unwatchResources()

        return this.compiler.compile(path)
            .then(x => this.watcher.watchResources())
    }


    /**
     * get information of FasterTitanium process
     * @return {Object}
     */
    getInfo() {
        return {
            'project root'   : this.projdir,
            'Process Uptime' : process.uptime() + ' [sec]',
            'Loading Style'  : this.prefs.style
            //'Reloaded Times' : this.stats.reloadedTimes
        }
    }
}
