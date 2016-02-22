import {join, resolve, dirname} from 'path'
import os from 'os'
import { writeFileSync as write,
         readFileSync as read,
         readdirSync as readDir,
         existsSync as exists,
         mkdirSync as mkdir } from 'fs'
import op from 'openport'
import MainProcess from '../server/main-process'
import { isAppJS } from '../common/util'
import browserify from 'browserify'

/**
 * attach cli hooks to titanium CLI
 * this function must be named "init"
 *
 * ti build --faster [--ft-port 4157]
 * @public
 */
export function init(logger, config, cli) {

    const scope = { logger, config, cli }

    if (scope::multiplyRegistered()) {
        logger.warn(`[FasterTitanium] hook registration duplicated. Suppressed one: ${__filename}`)
        return;
    }

    const hooks = [

        ['build.config', scope::attachFasterFlag],
        ['build.pre.compile', scope::launchServers], // attaches scope.ftProcess

        // only ios and android have copyResource hook.
        ['build.ios.copyResource',      { pre: scope::manipulateAppJS }],
        ['build.android.copyResource',  { pre: scope::manipulateAppJS }],

        ['build.post.compile', scope::startWatching],
        ['build.post.compile', scope::showServerInfo]
    ]

    hooks.forEach(args => cli.addHook.apply(cli, args))
}

/**
 * attach --faster flag
 * @private (export for test)
 */
export function attachFasterFlag(data) {

    const { flags, options } = data.result[1]

    flags.faster = { default: false, desc: 'enables faster rebuilding' }
    options['ft-port'] = { default: 4157, desc: 'port number for faster-titanium http server. If not available, use another open port.' }
}



/**
 * launch file/event servers to communicate with App
 */
export function launchServers(data, finished) {

    const { faster,
            platform,
            'ft-port': port = 4157,
            'project-dir': projectDir } = this.cli.argv
    if (!faster) return finished(null, data);

    return getPorts(port).then(ports => {

        const optsForServer = {
            platform,
            fPort: ports[0],
            ePort: ports[1],
            host : getAddress()
        }
        this.ftProcess = new MainProcess(projectDir, optsForServer)
        return this.ftProcess.launchServers()
    })
    .then(x => finished(null, data), finished)
}

/**
 * @return {Promise}
 * @private
 */
export function getPorts(defaultPort) {

    return new Promise((y, n) => {

        op.find({
            startingPort: defaultPort,
            count: 2
        }, (err, ports) => err ? n(err) : y(ports))
    })
}


/**
 * original app.js => app.js with faster-titanium
 * @private (export for test)
 */
export function manipulateAppJS(data, finished) {
    const { faster, 'project-dir': projectDir } = this.cli.argv
    if (!faster) return finished(null, data);

    const [src, dest] = data.args

    if (!isAppJS(projectDir, src)) return finished(null, data);

    const newSrc = dirname(dest) + '/faster-titanium.js' // new src path is in build dir, just because it's temporary.

    this.logger.info(`[FasterTitanium] manipulating app.js: attaching faster-titanium functions`)

    data.args[0] = newSrc

    const { fPort, ePort, host } = this.ftProcess


    generateNewAppJS(fPort, ePort, host).then(code => {
        write(newSrc, code)
        finished(null, data)
    })
    .catch(e => finished(e))
}


/**
 * Generate new app.js code.
 * New app.js consists of bundled lib of faster-titanium and one line initializer
 */
function generateNewAppJS(fPort, ePort, host) {

    const opts = JSON.stringify({ fPort, ePort, host })

    this.logger.info(`[FasterTitanium] call faster-titanium with options: ${opts} in app.js`)

    const initialCode = `Ti.FasterTitanium.run(this, ${opts})`
    const tiEntry = resolve(__dirname, '../titanium/faster-titanium') // dist/titanium/faster-titanium

    return new Promise((y, n) => {
        browserify(tiEntry).bundle((e, buf) => {
            if (e) return n(e)

            y([buf.toString(), initialCode].join('\n'))
        })
    })
}

/**
 * start watching files
 */
function startWatching() {
    this.ftProcess.watch()
}


/**
 * show server information
 */
function showServerInfo() {
    this.logger.info(`

        Access to FasterTitanium Web UI
        ${this.ftProcess.url}
    `)
}




/**
 * @returns {string} IP Adress (v4)
 * @private (export for test)
 */
export function getAddress() {

    const interfaces = os.networkInterfaces();

    for (let k in interfaces) {
        let itf = interfaces[k]
        for (let j in itf) {
            if (itf[j].family === 'IPv4' && !itf[j].internal) {
                return itf[j].address
            }
        }
    }
    return 'localhost'
}


/**
 * check duplication of hook registration
 */
export function multiplyRegistered() {
    const index = this.config.paths.hooks
        .filter(path => path.match(/faster-titanium\/dist\/hook\/faster\.js$/))
        .indexOf(__filename)

    return index > 0
}
