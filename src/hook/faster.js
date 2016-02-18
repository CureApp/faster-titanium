import {join, resolve, dirname} from 'path'
import os from 'os'
import { writeFileSync as write, readFileSync as read } from 'fs'
import MainProcess from '../server/main-process'

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

        'build.ios.copyResource'    : { pre: scope::modifyEntryName },
        'build.android.copyResource': { pre: scope::modifyEntryName },

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
 * app.js => second-entry-after-faster-titanium.js
 * @private (export for test)
 */
export function modifyEntryName(data) {
    const { 'project-dir': projectDir, faster } = this.cli.argv
    if (!faster) return;

    const [src, dist] = data.args
    const isAppJS = ['', 'android', 'ipad', 'iphone', 'ios']
        .map(name => join(projectDir, 'Resources', name, 'app.js'))
        .some(path => src === path)

    if (!isAppJS) return;

    const newname = 'second-entry-after-faster-titanium.js'

    this.logger.info(`[FasterTitanium] Renaming original ${src} to ${newname}`)

    data.args[1] = join(dirname(dist), newname) // modify distination

    this::createAppJS(dist)
}


/**
 * faster-titanium => app.js
 * @private (export for test)
 */
export function createAppJS(dist) {

    const { 'faster-port1': fPort, 'faster-port2': ePort } = this.cli.argv

    const optsForFasterTi = {
        fPort: parseInt(fPort, 10),
        ePort: parseInt(ePort, 10),
        host : this.host
    }
    const codeToRun = `Ti.FasterTitanium.run(this, ${JSON.stringify(optsForFasterTi)})`

    const appJSPath = resolve(__dirname, '../../dist/app.js')
    const appJSCode = [ read(appJSPath, 'utf8'), codeToRun ].join('\n')

    this.logger.info(`[FasterTitanium] Creating new app.js with host: ${this.host}, fPort: ${fPort}, ePort: ${ePort}`)

    write(dist, appJSCode)
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

