"use strict";

import debug from 'debug'
import chalk from 'chalk'
import randomstring from 'randomstring'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import NotificationServer from './notification-server'
import ContentResponder from './content-responder'
import AlloyCompiler from './alloy-compiler'
import Preferences from '../common/preferences'
import TiLog from './ti-log'
import { isAppJS, modNameByPath } from '../common/util'

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
     * @param {number} [options.fPort] port number of the file server
     * @param {number} [options.nPort] port number of the notification server
     * @param {string} [options.host] host name or IP Address
     * @param {string} [options.platform] platform name (ios|android|mobileweb|windows)
     * @param {string} [options.token] identifier for this process
     */
    constructor(projDir, options = {}) {
        const { fPort, nPort, host, platform, tiDebug, token } = options

        /** @type {string} identifier for this process */
        this.token = token || randomstring.generate(10)
        /** @type {string} project dir */
        this.projDir = projDir
        /** @type {string} hostname or IP Address */
        this.host = host
        /** @type {string} platform os name of the Titanium App */
        this.platform = platform
        /** @type {Preferences} */
        this.prefs = new Preferences({tiDebug})
        /** @type {FileServer} */
        this.fServer = new FileServer(fPort, this.token, this.routes)
        /** @type {FileWatcher} */
        this.watcher = new FileWatcher(this.projDir)
        /** @type {NotificationServer} */
        this.nServer = new NotificationServer(nPort, this.token)
        /** @type {AlloyCompiler} */
        this.alloyCompiler = new AlloyCompiler(this.projDir, this.platform)
        this.registerListeners()

        process.on('exit', x => {
            console.log(chalk.yellow(`You can restart faster-titanium server with the following command.\n`))
            console.log(chalk.yellow(this.restartCommand))
        })
    }

    /** @type {string} */
    get restartCommand() {
        return `faster-ti restart -f ${this.fPort} -n ${this.nPort} -p ${this.platform} -t ${this.token} ${this.projDir}`
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

        this.nServer.on('log', ::this.tilog)
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
     * show titanium log in console
     * @param {Object} payload
     * @param {Array} payload.args
     * @param {string} payload.severity trace|debug|info|warn|error|critical
     */
    tilog(payload) {
        const { args, severity } = payload
        TiLog[severity](args)
    }


    /**
     * called when files in Resources directory changed
     * @param {string} path
     * @private
     */
    onResourceFileChanged(path) {
        if (this.alloyCompiler.compiling) return;

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

        const token = randomstring.generate(10) // identifier for this compilation

        this.send({event: 'alloy-compilation', token})

        const changedFiles = [] // files in Resources changed by alloy compilation
        const poolChanged = path => changedFiles.push(modNameByPath(path, this.projDir, this.platform))

        this.watcher.on('change:Resources', poolChanged)

        /** @type {AlloyCompiler} */
        return this.alloyCompiler.compile(path, token)
        .then(result => {
            this.send({event: 'alloy-compilation-done', token, success: result})
            this.watcher.removeListener('change:Resources', poolChanged)
            if (result) {
                this.sendEvent({names: changedFiles})
            }
        })
    }

    /**
     * send message to the client of notification server
     * @param {Object} payload
     * @param {string} payload.event event name. oneof alloy-compilation|alloy-compilation-done|reload|reflect|debug-mode
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


    /**
     * @type {Array}
     * @todo separate this to another file
     */
    get routes() {
        const responder = new ContentResponder()
        return [
            ['/', url =>
                responder.webUI()],

            ['/info', url =>
                responder.respondJSON(this.info)],

            ['/prefs', 'POST', (url, body) => {
                this.prefs.apply(body)
                this.send({event: 'preferences', prefs: this.prefs})
                return responder.respondJSON(this.prefs)
            }],

            ['/prefs', 'GET', (url) => responder.respondJSON(this.prefs) ],


            ['/kill', url => {
                process.nextTick(::this.end)
                return responder.respond()
            }],

            ['/reload', url => {
                this.send({event: 'reload', force: true})
                return responder.respond()
            }],

            ['/faster-titanium-web-js/main.js', url => responder.webJS()],

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
            'access token'                    : this.token,
            'project root'                    : this.projDir,
            'notification server port'        : this.nPort,
            'process uptime'                  : parseInt(process.uptime()) + ' [sec]',
            'platform'                        : this.platform,
            'connection with client'          : this.nServer.connected,
            'loading style'                   : this.prefs.style,
            'show debug log in Titanium'      : this.prefs.tiDebug,
            'show ti log in server console'   : this.prefs.serverLog,
            'show ti log in titanium console' : this.prefs.localLog,
            //'Reloaded Times'               : this.stats.reloadedTimes
        }
    }
}
