"use strict";

import { join }  from 'path'
import { existsSync as exists, readFileSync as read } from 'fs'

/**
 * Get contents of Titanium Resources
 */
export default class ResourceResponder {

    /**
     * @param {string} projDir
     * @param {string} url
     * @param {string} platform
     */
    constructor(projDir, url, platform) {
        this.projDir  = projDir
        this.url      = url
        this.platform = platform
    }

    /** @type {Object} */
    get header() {
        if (this.exists) {
            return { statusCode: 200, contentType: 'text/plain' } // TODO change contentType by file type
        }
        return { statusCode: 404, contentType: 'text/plain' }
    }


    /** @type {Buffer} */
    get content() {
        if (this.exists) {
            return read(this.path) // TODO cache results
        }
        return `404 Not Found. path = ${this.path}`
    }


     /** @type {string} */
    get path() {
        return this.platform
            ? join(this.projDir, 'Resources', this.platform, this.url)
            : join(this.projDir, 'Resources', this.url)
    }

     /** @type {boolean} */
    get exists() {
        return exists(this.path) // TODO cache results
    }
}
