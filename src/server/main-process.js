"use strict";

import debug from 'debug'
import FileServer from './file-server'
import FileWatcher from './file-watcher'
import EventServer from './event-server'
const ____ = debug('faster-titanium:MainProcess')
const ___x = debug('faster-titanium:MainProcess:error')


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

        this.fServer = new FileServer(projDir, fPort, host)
        this.watcher = new FileWatcher(projDir)
        this.eServer = new EventServer(ePort, host)

        this.fServer.on('error', ___x)
        this.eServer.on('error', ___x)
        this.watcher.on('error', ___x)

        this.watcher.on('change', path => {
            ____(`changed: ${path}`)
            this.eServer.broadcast({event: 'reload', path: path})
        })

         this.watcher.on('change:alloy', path => {
            ____(`changed:alloy: ${path}`)
        })

        this.fServer.on('got-kill-message', ::this.end)
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
