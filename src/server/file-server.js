"use strict";

import { resolve } from 'path'
import debug from 'debug'
import { readFileSync as read } from 'fs'
import http from 'http'
import { parse as urlParser } from 'url'
import {EventEmitter} from 'events'

import ContentResponder from './content-responder'

const P = f => new Promise(f)
const ____ = debug('faster-titanium:FileServer')
const ___x = debug('faster-titanium:FileServer:error')

/**
 * Serve resource files
 */
export default class FileServer extends EventEmitter {

    /**
     * @param {number} [port=4157]
     */
    constructor(port = 4157, routes) {
        super()

        /** @type {number} */
        this.port = parseInt(port, 10)
        /** @type {Array<Array>} */
        this.routes = routes
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
     * get instance of ResponseInfo with url matching passed routes
     * @param {string} url
     * @return {Promise(ResponseInfo)}
     * @private
     */
    handleURL(url) {
        let getResponseInfo = null

        this.routes.some(route => {
            const [pattern, fn] = route
            if ((typeof pattern === 'string' && pattern === url) ||
                (pattern instanceof RegExp && url.match(pattern))) {
                getResponseInfo = fn
                return true
            }
            return false
        })

        if (getResponseInfo === null) { // not found
            return new ContentResponder().notfound()
        }
        return getResponseInfo(url)
    }

    /**
     * @param {http.ServerRequest} req
     * @param {http.ServerResponse} res
     * @private
     */
    onRequest(req, res) {

        const url = urlParser(req.url).pathname
        ____(`url: ${url}`)

        this.handleURL(url).then(responseInfo => {

            const { statusCode, contentType, content } = responseInfo
            ____({statusCode, contentType, length: content.length})

            res.writeHead(statusCode, {'Content-Type': contentType})
            res.write(content)
            res.end()
        })
        .catch(e => {
            res.writeHead(500, {'Content-Type': 'application/json'})
            res.write(JSON.stringify([err.message, err.stack]))
            res.end()
        })
    }
}
