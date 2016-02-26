"use strict";

import debug from 'debug'
import { join }  from 'path'
import { existsSync as exists, readFileSync as read } from 'fs'
import chokidar from 'chokidar'
import {EventEmitter} from 'events'
const ____ = debug('faster-titanium:FileWatcher')
const ___x = debug('faster-titanium:FileWatcher:error')

/**
 * Watch files
 */
export default class FileWatcher extends EventEmitter {

    /**
     * @param {string} projDir
     */
    constructor(projDir) {
        super()

        /** @type {string} path to the project dir */
        this.projDir = projDir
        /** @type {number} unix time(msec) of last emission of change event */
        this.lastEmission = 0
        /** @type {string} value (path) of last emission */
        this.lastEmitted = null
        /** @type {Object} chokidar object */
        this.watcher = chokidar.watch([], { ignoreInitial: true })

        this.watcher.on('change', ::this.onChange)
        this.watcher.on('error', path => ___x(path) || this.emit('error', path))
    }

    /**
     * start watching
     */
    watch() {
        ____(`start watching directories: ${this.dirs.join(', ')}`)
        this.watcher.add(this.dirs)
    }


    /**
     * whether the last change event was emitted during the past 1000msec
     * @type {boolean}
     * */
    get justEmitted() {
        return new Date().getTime() - this.lastEmission < 1000
    }


    /**
     * stop watching
     */
    close() {
        this.watcher.close()
        ____(`watch stopped`)
    }

    /**
     * Called when a file is changed.
     * Sometimes watcher calls this twice to the same file, so memorizes past emission
     * @param {string} path
     */
    onChange(path) {
        if (this.lastEmitted === path && this.justEmitted) {
            ____(`preventing emission twice.`)
            return;
        }

        this.lastEmitted = path
        this.lastEmission = new Date().getTime()

        if (this.isAlloyPath(path)) {
            this.emit('change:alloy', path)
        }
        else {
            this.emit('change:Resources', path)
        }
    }


    isAlloyPath(path) {
        return path.indexOf(join(this.projDir, 'app/')) === 0
    }

    /** @type {string[]} */
    get dirs() {
        return [
            'Resources',
            'app',
            'i18n'
        ]
        .map( name => join(this.projDir, name) )
        .filter (exists)
    }
}
