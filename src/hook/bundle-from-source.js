const browserify = require('browserify')
const stream = require('stream')

/**
 * bundle into one file from js source (as entry)
 * @param {string} JavaScript source code
 * @param {string} basedir
 */
export default function bundleFromSource(source, basedir) {
    const b = browserify(streamify(source), {basedir: basedir})
    return new Promise((y, n) => {
        b.bundle((e, o) => e? n(e) : y(o.toString()))
    })
}

/**
 * string to stream
 * thanks to https://gist.github.com/garthk/9265037
 *
 * @return {string} text
 * @return {ReadableStream}
 */
function streamify(text) {
    const s = new stream.Readable()
    s.push(text)
    s.push(null)
    return s
}
