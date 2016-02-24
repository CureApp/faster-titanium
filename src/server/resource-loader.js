"use strict";

import { join }  from 'path'
import { existsSync as exists, readFileSync as read } from 'fs'
import debug from 'debug'
import {getPlatformDirname} from '../common/util'

const ____ = debug('faster-titanium:ResourceLoader')
const ___x = debug('faster-titanium:ResourceLoader:error')

/**
 * Get contents of Titanium Resources
 */
export default class ResourceLoader {

    /**
     * @param {string} url
     * @param {string} projDir
     * @param {string} platform
     */
    constructor(url, projDir, platform) {
        /** @type {string} */
        this.projDir = projDir
        /** @type {string} */
        this.platformDirname = getPlatformDirname(platform)
        /** @type {string} */
        this.url = url
    }


    /** @type {Buffer} */
    get content() {
        return this.load(this.platformPath) || this.load(this.commonPath) || null
    }

    load(path) {
        if (exists(path)) {
            ____(`path: ${path}`)
            return read(path) // TODO cache results
        }
        return null
    }

    get platformPath() {
        return join(this.projDir, 'Resources', this.platformDirname, this.url)
    }

    get commonPath() {
        return join(this.projDir, 'Resources', this.url)
    }

     /** @type {boolean} */
    get exists() {
        return exists(this.path) // TODO cache results
    }
}
