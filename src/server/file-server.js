"use strict";

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
     * @param {number} port
     * @param {string} token
     * @param {Array} routes
     */
    constructor(port, token, routes) {
        super()

        /** @type {number} */
        this.port = parseInt(port, 10)
        /** @type {string} */
        this.token = token
        /** @type {Array<Array>} */
        this.routes = routes
        /** @type {net.Socket[]} */
        this.sockets = []
        /** @type {http.Server} */
        this.server = http.createServer((req, res) => {
            this.parseBody(req, (err, body) =>
                err ? this.emit('error', err)
                    : this.onRequest(req, res, body))
        })

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
     * @param {string} method
     * @param {string|Object} body
     * @return {Promise(ResponseInfo)}
     * @private
     */
    handleURL(url, method, body) {
        let getResponseInfo = null

        this.routes.some(route => {
            const pattern = route[0]
            const fn      = route[route.length - 1]
            const expectedMethod = (typeof route[1] === 'string') ? route[1] : 'GET'

            if ((typeof pattern === 'string' && pattern === url && method === expectedMethod) ||
                (pattern instanceof RegExp && url.match(pattern))) {
                getResponseInfo = fn
                return true
            }
            return false
        })

        if (getResponseInfo === null) { // not found
            return new ContentResponder().notfound()
        }
        return getResponseInfo(url, body)
    }

    /**
     * @param {http.ServerRequest} req
     * @param {http.ServerResponse} res
     * @param {string|Object} body
     * @private
     */
    onRequest(req, res, body) {

        const url = urlParser(req.url).pathname
        ____(`url: ${url}, method: ${req.method}, body: ${JSON.stringify(body)}`)

        this.handleURL(url, req.method, body)

        .then(responseInfo => {
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

    /**
     * parse request body
     * @param {http.ServerRequest} req
     * @param {function(err: error, body: string|Object): void} fn
     */
    parseBody(req, cb) {

        if (req.method === 'GET') return cb(null, '')


        let body = ''
        req.setEncoding('utf8')
        req.on('error', e => cb(e))
        req.on('data', str => body += str)
        req.on('end', x => {
            if (req.headers['content-type'] === 'application/json') body = JSON.parse(body)
            cb(null, body)
        })
    }
}
