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

    const hooks = {

        'build.config': scope::attachFasterFlag,

        'build.pre.compile': scope::launchServer, // attaches scope.ftProcess

        // only ios and android have copyResource hook.
        'build.ios.copyResource'    : { pre: scope::renameAppJS },
        'build.android.copyResource': { pre: scope::renameAppJS },
        'build.post.compile': scope::showServerInfo
    }

    Object.keys(hooks)
        .forEach(hookName => cli.addHook(hookName, hooks[hookName]))
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
export function launchServer(data, finished) {

    const { faster,
            platform,
            'ft-port': port = 4157,
            'project-dir': projectDir } = this.cli.argv
    if (!faster) return;

    return getPorts(port).then(ports => {

        const optsForServer = {
            platform,
            fPort: ports[0],
            ePort: ports[1],
            host : getAddress()
        }
        this.ftProcess = new MainProcess(projectDir, optsForServer)
        return this.ftProcess.start()
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
 * 1. rename app.js => original-app.js
 * 2. write new app.js
 * 3. require faster-titanium and run in app.js
 * @private (export for test)
 */
export function renameAppJS(data) {
    const { faster, 'project-dir': projectDir } = this.cli.argv
    if (!faster) return;

    const [src, dest] = data.args

    if (!isAppJS(projectDir, src)) return;

    const destDir = dirname(dest)

    this.logger.info(`[FasterTitanium] rename app.js into original-app.js`)
    data.args[1] = destDir + '/original-app.js'

    this::writeNewAppJS(dest)
    this::addFasterTitanium(destDir)
}

/**
 * write new app.js
 */
function writeNewAppJS(dest) {

    const opts = JSON.stringify({
        fPort: this.ftProcess.fPort,
        ePort: this.ftProcess.ePort,
        host : this.ftProcess.host
    })

    this.logger.info(`[FasterTitanium] call faster-titanium with options: ${opts} in app.js`)

    const newAppJS = `require('faster-titanium/index').run(this, ${opts})`
    write(dest, newAppJS)
}


/**
 * copy dist/titanium/* => (dest-dir)/faster-titanium/*
 * @private (export for test)
 */
export function addFasterTitanium(destDir) {
    const srcDir = resolve(__dirname, '../../', 'dist/titanium')
    destDir += '/faster-titanium'
    if (!exists(destDir)) { mkdir(destDir) }
    this.logger.warn(destDir)

    readDir(srcDir).forEach(file => {
        this.logger.info(`[FasterTitanium] add faster-titanium/${file}`)
        write(join(destDir, file), read(join(srcDir, file)))
    })
}

/**
 * show server information
 */
function showServerInfo() {
    console.log(`

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
