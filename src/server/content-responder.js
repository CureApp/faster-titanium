
import { resolve } from 'path'
import { readFile } from 'fs'
import browserify from 'browserify'
import ResponseInfo from './response-info'
import ResourceLoader from './resource-loader'
import AppJsConverter from './app-js-converter'


/**
 * return Promise of ResponseInfo by URL
 */
export default class ContentResponder {


    /**
     * create ResponseInfo
     * @param {string|Buffer} content
     * @param {string} [contentType=text/plain]
     * @param {number} [statusCode=200]
     * @return {Promise<ResponseInfo>}
     */
    respond(content, contentType, statusCode) {
        return Promise.resolve(new ResponseInfo(content, contentType, statusCode))
    }

    /**
     * create ResponseInfo of JSON
     * @param {Object} obj
     * @param {string} [contentType=application/json]
     * @param {number} [statusCode=200]
     * @return {Promise<ResponseInfo>}
     */
    respondJSON(obj, contentType = 'application/json', statusCode) {
        return this.respond(JSON.stringify(obj), contentType, statusCode)
    }


    /**
     * create ResponseInfo of file
     * @param {string} path
     * @param {string} [contentType=text/plain]
     * @param {number} [statusCode=200]
     * @return {Promise<ResponseInfo>}
     */
    respondFile(path, contentType, statusCode) {
        return new Promise((y, n) => {
            readFile(path, 'utf8', (e, o) => e ? n(e) : y(o))
        })
        .then(content => this.respond(content, contentType, statusCode))
    }

    /**
     * create ResponseInfo of NOT FOUND
     * @param {string} url
     * @return {Promise<ResponseInfo>}
     */
    notFound(url) {
        return this.respond(`404 not found: ${url}`, 'text/plain', 404)
    }


    /**
     * load web/index.html
     * @return {Promise<ResponseInfo>}
     */
    webUI() {
        return this.respondFile(__dirname + '/../../web/index.html', 'text/html')
    }

    /**
     * load dist/web/main.js after bundling by browserify
     * @return {Promise<ResponseInfo>}
     * @todo cache the result
     */
    webJS() {
        const mainJSPath = resolve(__dirname, '../../dist/web/main.js')
        return this.bundle(mainJSPath).then(buf => this.respond(buf, 'text/javascript'))

    }

    bundle(file, options) {
        return new Promise((y, n) => {
            browserify(file, options).bundle((e, o) => e ? n(e) : y(o))
        })
    }

    /**
     * load a file in Resources directory
     * @param {string} url
     * @param {string} projDir
     * @param {string} platform
     * @return {Promise<ResponseInfo>}
     */
    resource(url, projDir, platform) {

        // @type Buffer
        let content = new ResourceLoader(url, projDir, platform).content
        if (content === null) {
            return this.notFound(url)
        }

        /**
         * In app.js, top variables are exported as global variables.
         * Thus, AppJsConverter converts the code as such.
         * TODO Caches the result.
         */
        if (url === '/app.js') {
            content = new AppJsConverter(content.toString()).convert()
        }

        return this.respond(content)
    }
}
