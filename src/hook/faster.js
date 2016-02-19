import {join, resolve, dirname} from 'path'
import os from 'os'
import { writeFileSync as write,
         readFileSync as read,
         readdirSync as readDir,
         existsSync as exists,
         mkdirSync as mkdir } from 'fs'
import MainProcess from '../server/main-process'
import { isAppJS } from '../util'

/**
 * attach cli hooks to titanium CLI
 * this function must be named "init"
 *
 * ti build --faster [--faster-port1 4157] [--faster-port2 4156]
 * @public
 */
export function init(logger, config, cli) {

    const scope = { logger, config, cli, host: getAddress() }

    const hooks = {

        'build.android.config': scope::attachFasterFlag,
        'build.ios.config'    : scope::attachFasterFlag,

        'build.ios.copyResource'    : { pre: scope::renameAppJS },
        'build.android.copyResource': { pre: scope::renameAppJS },

        'build.post.compile': scope::launchServer
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
    options['faster-port1'] = { default: 4157, desc: 'port number of http server for faster-titanium' }
    options['faster-port2'] = { default: 4156, desc: 'port number of tcp server for faster-titanim' }
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

    const { 'faster-port1': fPort, 'faster-port2': ePort } = this.cli.argv
    const opts = JSON.stringify({
        fPort: parseInt(fPort, 10),
        ePort: parseInt(ePort, 10),
        host : this.host
    })

    this.logger.info(`[FasterTitanium] call faster-titanium with host: ${this.host}, fPort: ${fPort}, ePort: ${ePort} in app.js`)

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
 * launch file/event servers to communicate with App
 */
export function launchServer(data) {

    const { faster,
            'project-dir': projectDir,
            'faster-port1': fPort,
            'faster-port2': ePort } = this.cli.argv
    if (!faster) return;


    const optsForServer = {
        fPort: parseInt(fPort, 10),
        ePort: parseInt(ePort, 10),
        host : this.host
    }

    new MainProcess(projectDir, optsForServer).start()
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

