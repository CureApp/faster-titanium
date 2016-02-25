"use strict";

import debug from 'debug'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import EventServer from './event-server'
import ContentResponder from './content-responder'
import AlloyCompiler from './alloy-compiler'
import Preferences from '../common/preferences'
import { isAppJS } from '../common/util'

const ____ = debug('faster-titanium:MainProcess')
const ___x = (e) =>
    debug('faster-titanium:MainProcess:error')(e) || debug('faster-titanium:MainProcess:error')(e.stack)

process.on('uncaughtException', (err) => {
    console.log(`Caught exception: ${err}`)
})


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
        /** @type {string} hostname or IP Address */
        this.host = host
        /** @type {string} platform os name of the Titanium App */
        this.platform = platform
        /** @type {Preferences} */
        this.prefs = new Preferences()
        /** @type {FileServer} */
        this.fServer = new FileServer(fPort, this.routes)
        /** @type {FileWatcher} */
        this.watcher = new FileWatcher(this.projDir)
        /** @type {EventServer} */
        this.eServer = new EventServer(ePort)

        this.registerListeners()
    }

    /** @type {string} */
    get url() {
        return `http://${this.host}:${this.fPort}/`
    }

    /** @type {number} */
    get fPort() {
        return this.fServer.port
    }

    /** @type {number} */
    get ePort() {
        return this.eServer.port
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
    }


    /**
     * launch fileserver and eventserver
     * @return {Promise}
     * @public
     */
    launchServers() {
        ____(`launching servers`)
        return Promise.all([
            this.fServer.listen(),
            this.eServer.listen()
        ]).catch(___x)
    }


    /**
     * starting file watching
     * @public
     */
    watch() {
        ____(`starting file watcher`)
        this.watcher.watch()
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

        this.sendReload({timer: 1000})
    }

    /**
     * Called when files in app directory (Alloy project) changed
     * Compile alloy. During compilation, unwatch Resources directory.
     * @param {string} path
     * @private
     */
    onAlloyFileChanged(path) {

        ____(`changed:alloy ${path}`)

        this.send({event: 'will-reload'})

        this.watcher.unwatchResources()

        /** @type {AlloyCompiler} */
        const compiler = new AlloyCompiler(this.projDir, this.platform)
        return compiler.compile(path)
            .catch(___x)
            .then(x => this.watcher.watchResources())
            .then(x => this.sendReload({reserved: true}))
            .catch(___x)
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

    get routes() {
        const responder = new ContentResponder()
        return [
            ['/', url =>
                responder.webUI()],

            ['/info', url =>
                responder.respondJSON(this.info)],

            ['/kill', url => {
                process.nextTick(::this.end)
                return responder.respond()
            }],

            ['/reload', url => {
                this.sendReload({force: true})
                return responder.respond()
            }],

            [/^\/faster-titanium-web-js\//, url =>
                responder.webJS(url.slice('/faster-titanium-web-js/'.length))],

            [/^\//, url => // any URL
                responder.resource(url, this.projDir, this.platform)],
        ]
    }


    /**
     * information of FasterTitanium process
     * @type {Object}
     */
    get info() {
        return {
            'project root'     : this.projdir,
            'event server port': this.ePort,
            'process uptime'   : process.uptime() + ' [sec]',
            'platform'         : this.platform,
            'loading style'    : this.prefs.style
            //'Reloaded Times' : this.stats.reloadedTimes
        }
    }
}
