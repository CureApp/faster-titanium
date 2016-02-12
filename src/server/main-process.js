"use strict";

import {exec} from 'child_process'
import {relative, resolve} from 'path'
import debug from 'debug'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import EventServer from './event-server'
const P = f => new Promise(f)
const ____ = debug('faster-titanium:MainProcess')
const ___x = debug('faster-titanium:MainProcess:error')
const ___o = v => ____(v) || v


/**
 * main process
 */
export default class MainProcess {

    /**
     * @param {string} projDir
     * @param {Object} [options={}]
     */
    constructor(projDir, options = {}) {

        const { fPort, ePort, host } = options

        this.alloyCompiling = false

        this.fServer = new FileServer(projDir, fPort, host)
        this.watcher = new FileWatcher(projDir)
        this.eServer = new EventServer(ePort, host)

        this.fServer.on('error', ___x)
        this.eServer.on('error', ___x)
        this.watcher.on('error', ___x)

        this.watcher.on('change', path => ::this.broadcastReload)
        this.watcher.on('change:alloy', ::this.compileAlloy)
        this.fServer.on('got-kill-message', ::this.end)
        this.fServer.on('got-reload-message', ::this.broadcastReload)
    }


    /**
     * send reload message to all connected clients
     * @param {string} path
     */
    broadcastReload(path) {
        if (this.alloyCompiling) return; // suppress broadcasting while compiling alloy.

        ____(`changed: ${path}`)
        this.eServer.broadcast({event: 'reload', path: path})
    }


    /**
     * compile alloy when one of the files in alloy changes
     * @param {string} path
     * @todo support for non-ios|android OS
     */
    compileAlloy(path) {

        this.alloyCompiling = true

        ____(`changed:alloy ${path}`)
        const alloy = resolve(__dirname, '../../node_modules/.bin/alloy')

        const relPath = relative(this.watcher.projDir, path)

        Promise.all(['ios', 'android']
            .map (os => `${alloy} compile --config platform=${os},file=${relPath}`)
            .map(___o)
            .map(command => P(y => exec(command, y)))
        )
        .then(x => {
            this.alloyCompiling = false
            this.broadcastReload(path)
        })
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
     * terminate this process
     */
    end() {
        ____(`terminating servers`)
        Promise.all([
            this.fServer.close(),
            this.eServer.close()
        ]).then( results => {
            ____(`terminating process`)
            process.exit(0)
        }).catch(___x)
    }
}
