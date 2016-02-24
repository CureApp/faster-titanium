"use strict";

import { resolve } from 'path'
import debug from 'debug'
import { readFileSync as read } from 'fs'
import http from 'http'
import { parse as urlParser } from 'url'
import {EventEmitter} from 'events'

import ResourceResponder from './resource-responder'
import AppJsConverter from './app-js-converter'
import {getPlatformDirname} from '../common/util'

const P = f => new Promise(f)
const ____ = debug('faster-titanium:FileServer')
const ___x = debug('faster-titanium:FileServer:error')

/**
 * Serve resource files
 */
export default class FileServer extends EventEmitter {

    /**
     * @param {string} projDir project root directory (absolute path)
     * @param {number} [port=4157]
     */
    constructor(projDir, platform, port = 4157, getInfo) {
        super()

        /** @type {string} */
        this.projDir = projDir
        /** @type {string} */
        this.platformDirname = getPlatformDirname(platform)
        /** @type {number} */
        this.port = parseInt(port, 10)
        /** @type {net.Socket[]} */
        this.sockets = []
        /** @type {string} code of app.js */
        this.appJSCode = null
        /** @type {function}:object function returning server info */
        this.getInfo = getInfo
        /** @type {http.Server} */
        this.server = http.createServer(::this.onRequest)

        this.server.on('error', err => ___x(err) || this.emit('error', err))
        this.server.on('connection', socket => this.sockets.push(socket))
    }


    /**
     * listen
     * @public
     * @return {Promise}
     */
    listen() {
        return P(y => this.server.listen(this.port, y)).then(x => {
            ____(`start listening ${this.port}`)
        })
    }


    /**
     * close server
     * @public
     * @return {Promise}
     */
    close() {
        ____(`terminating...`)
        this.sockets.forEach(socket => socket.destroy())
        return P(y => this.server.close(y)).then(x => {
            ____(`terminated`)
        })
    }

    /**
     * @param {http.ServerRequest} req
     * @param {http.ServerResponse} res
     * @private
     */
    onRequest(req, res) {
        try {
            const url = urlParser(req.url).pathname
            ____(`url: ${url}`)

            if (url === '/')       return this.webUI(res)
            if (url === '/info')   return this.responseServerInfo(res)
            if (url === '/kill')   return this.emitKilled(res)
            if (url === '/reload') return this.emitReload(res)
            if (url.match(/^\/faster-titanium-web-js\//)) return this.responseWebJS(url, res)

            return this.responseResource(req, res)

        } catch (err) {
            ___x(err)
            this.respond(res, 500, 'application/json', JSON.stringify([err.message, err.stack]))
        }
    }


    /**
     * responses server error
     * @param {http.ServerRequest} req
     * @param {http.ServerResponse} res
     */
    responseResource(req, res) {
        let url = urlParser(req.url).pathname

        let responder = new ResourceResponder(this.projDir, url, this.platformDirname)
        if (!responder.exists) {
            responder = new ResourceResponder(this.projDir, url)
        }
        const { statusCode, contentType } = responder.header
        let content = responder.content

        /**
         * In the app.js, top variables are exported as global variables.
         * Thus, AppJsConverter converts the code as such.
         * Caches the result.
         */
        if (url === '/app.js') {
            if (this.appJSCode) {
                content = this.appJSCode
            }
            else {
                content = new AppJsConverter(content).convert()
                this.appJSCode = content
                ____(`cache app.js`)
            }
        }

        this.respond(res, statusCode, contentType, content)
    }

    /**
     * clear cache of app.js
     */
    clearAppJSCache() {
        ____(`clear cache of app.js`)
        this.appJSCode = null
    }


    /**
     * return HTML web UI
     * @param {http.ServerResponse} res
     */
    webUI(res) {

        const html = read(__dirname + '/../../web/index.html')

        this.respond(res, 200, 'text/html', html)
    }

    /**
     * responses server info
     * @param {http.ServerResponse} res
     */
    responseServerInfo(res) {

        const data = this.getInfo()

        this.respond(res, 200, 'application/json', JSON.stringify(data))
    }

    responseWebJS(url, res) {
        const jsName = url.slice('/faster-titanium-web-js/'.length)
        const jsPath = resolve(__dirname, '../../dist/web', jsName)
        this.respond(res, 200, 'text/javascript', read(jsPath))
    }


    /**
     * responses content
     * @param {http.ServerResponse} res
     * @param {number} statusCode
     * @param {string} contentType
     * @param {string} content
     * @private
     */
    respond(res, statusCode, contentType, content) {
        ____({statusCode: statusCode, contentType: contentType, length: content.length})
        res.writeHead(statusCode, {'Content-Type': contentType})
        res.write(content)
        res.end()
    }


    /**
     * terminates server
     * @param {http.ServerResponse} res
     * @emits {got-kill-message}
     */
    emitKilled(res) {
        this.respond(res, 200, 'text/plain', 'Server will be terminated');
        this.emit('got-kill-message')
    }


    /**
     * @emits {got-reload-message}
     * @param {http.ServerResponse} res
     */
    emitReload(res) {
        this.respond(res, 200, 'text/plain', 'Apps will be reloaded');
        this.emit('got-reload-message')
    }

}
