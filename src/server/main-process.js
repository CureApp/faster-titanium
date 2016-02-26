"use strict";

import debug from 'debug'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import NotificationServer from './notification-server'
import ContentResponder from './content-responder'
import AlloyCompiler from './alloy-compiler'
import Preferences from '../common/preferences'
import { isAppJS, modNameByPath } from '../common/util'

const wait = (msec => new Promise(y => setTimeout(y, msec)))
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
     * @param {number} nPort port number of the notification server
     * @param {string} host host name or IP Address
     * @param {string} platform platform name (ios|android|mobileweb|windows)
     */
    constructor(projDir, options = {}) {
        const { fPort, nPort, host, platform } = options

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
        /** @type {NotificationServer} */
        this.nServer = new NotificationServer(nPort)
        /** @type {number} #ongoing alloy compilation */
        this.alloyCompilations = 0

        this.registerListeners()

        process.on('exit', x => {
            console.log(`You can restart faster-titanium server with the following command.\n`)
            console.log(`faster-ti restart -f ${fPort} -n ${nPort} -p ${platform} ${projDir}`)
        })
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
    get nPort() {
        return this.nServer.port
    }

    /**
     * register event listeners.
     * called only once in constructor
     * @private
     */
    registerListeners() {

        this.fServer.on('error', ___x)
        this.nServer.on('error', ___x)
        this.watcher.on('error', ___x)

        this.watcher.on('change:Resources', ::this.onResourceFileChanged)
        this.watcher.on('change:alloy', ::this.onAlloyFileChanged)
    }


    /**
     * launch file server and notification server
     * @return {Promise}
     * @public
     */
    launchServers() {
        ____(`launching servers`)
        return Promise.all([
            this.fServer.listen(),
            this.nServer.listen()
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
            this.nServer.close(),
            this.watcher.close()
        ])
    }


    /**
     * called when files in Resources directory changed
     * @param {string} path
     * @private
     */
    onResourceFileChanged(path) {
        if (this.alloyCompilations > 0) return;

        ____(`changed: ${path}`)

        this.sendEvent({timer: 1000, names: [modNameByPath(path, this.projDir, this.platform)]})
    }

    /**
     * Called when files in app directory (Alloy project) changed
     * Compile alloy. During compilation, unwatch Resources directory.
     * @param {string} path
     * @private
     */
    onAlloyFileChanged(path) {

        ____(`changed:alloy ${path}`)

        this.send({event: 'alloy-compilation'})

        this.alloyCompilations++

        const changedFiles = [] // files in Resources changed by alloy compilation
        const poolChanged = path => changedFiles.push(modNameByPath(path, this.projDir, this.platform))

        this.watcher.on('change:Resources', poolChanged)


        /** @type {AlloyCompiler} */
        const compiler = new AlloyCompiler(this.projDir, this.platform)
        return compiler.compile(path)
            .catch(___x)
            .then(x => this.send({event: 'alloy-compilation-done'}))
            .then(x => wait(100)) // waiting for all change:Resources events are emitted
            .then(x => this.sendEvent({names: changedFiles}))
            .catch(___x)
            .then(x => this.watcher.removeListener('change:Resources', poolChanged))
            .then(x => this.alloyCompilations--)
    }

    /**
     * send message to the client of notification server
     * @param {Object} payload
     * @param {string} payload.event event name. oneof alloy-compilation|alloy-compilation-done|reload|reflect
     */
    send(payload) {
        console.assert(payload && payload.event)
        this.nServer.send(payload)
    }


    /**
     * send reload|reflect event to the titanium client
     * @param {Object} [options={}]
     * @return {Promise}
     * @private
     */
    sendEvent(options = {}) {
        let eventName;

        switch (this.prefs.style) {
            case 'manual':
                return
            case 'auto-reload':
                eventName = 'reload'
                break
            case 'auto-reflect':
                eventName = 'reflect'
                break
        }

        const payload = Object.assign({}, {event: eventName}, options)

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
                this.send({event: 'reload', force: true})
                return responder.respond()
            }],

            ['/faster-titanium-web-js/main.js', url => responder.webJS()],

            [/\/loading-style\/[0-9]$/, url => {
                const newValue = parseInt(url.slice(-1))
                const expression = Preferences.expressions[newValue]
                if (!expression) {
                    return responder.notFound(url)
                }
                this.prefs.loadStyleNum = newValue
                return responder.respondJSON({newValue, expression})
            }],

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
            'project root'                   : this.projdir,
            'notification server port'       : this.nPort,
            'process uptime'                 : process.uptime() + ' [sec]',
            'platform'                       : this.platform,
            'loading style'                  : this.prefs.style,
            //'Reloaded Times'               : this.stats.reloadedTimes
        }
    }
}
