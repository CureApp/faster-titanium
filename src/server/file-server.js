"use strict";

import { resolve } from 'path'
import debug from 'debug'
import fs from 'fs'
import http from 'http'
import { parse as urlParser } from 'url'
import ResourceResponder from './resource-responder'
import {EventEmitter} from 'events'

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
     * @param {string} [host=127.0.0.1]
     */
    constructor(projDir, port = 4157, host = '127.0.0.1') {
        super()

        /** @type {string} */
        this.projDir = projDir

        /** @type {number} */
        this.port = parseInt(port, 10)

        /** @type {string} */
        this.host = host

        /** @type {net.Socket[]} */
        this.sockets = []

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
            ____(`start listening ${this.host}:${this.port}`)
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

            if (url === '/')       return this.responseServerInfo(res)
            if (url === '/kill')   return this.emitKilled(res)
            if (url === '/reload') return this.emitReload(res)

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
        const platform  = req.headers['x-platform'] || 'iphone'

        if (url === '/app.js') {
            const fasterTiPath = resolve(__dirname, '../../dist/app.js')
            return this.respond(res, 200, 'text/plain', fs.readFileSync(fasterTiPath))
        }

        if (url === '/second-entry-after-faster-titanium.js') {
            url = '/app.js'
        }
        let responder = new ResourceResponder(this.projDir, url, platform)
        if (!responder.exists) {
            responder = new ResourceResponder(this.projDir, url)
        }
        const { statusCode, contentType } = responder.header

        this.respond(res, statusCode, contentType, responder.content)
    }


    /**
     * responses server info
     * @param {http.ServerResponse} res
     */
    responseServerInfo(res) {

        const data = {
            projDir: this.projDir,
            uptime: process.uptime()
        }

        this.respond(res, 200, 'application/json', JSON.stringify(data))
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
