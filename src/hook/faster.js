import 'shelljs/global'
import semver from 'semver'
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
import chalk from 'chalk'

/**
 * attach cli hooks to titanium CLI
 * this function must be named "init"
 *
 * ti build --faster [--ft-port 4157] [--ft-debug]
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
        ['build.pre.compile', scope::filter(isAlloyCompatible)],
        ['build.pre.compile', scope::filter(showLogo)],
        ['build.pre.compile', scope::filter(launchServers)], // attaches scope.ftProcess
        // only ios and android have copyResource hook.
        ['build.ios.copyResource',      { pre: scope::filter(manipulateAppJS) }],
        ['build.android.copyResource',  { pre: scope::filter(manipulateAppJS) }],

        ['build.post.compile', scope::filter(startWatching)],
        ['build.post.compile', scope::filter(showServerInfo)]
    ]

    hooks.forEach(args => cli.addHook.apply(cli, args))
}

/**
 * check --faster flag, then execute given fn with error handling.
 * "this" is "scope" defined in "init" function.
 */
export function filter(fn) {

    return (data, finished) => {
        if (!this.cli.argv.faster) return finished(null, data)

        try {
            const result = this::fn(data)
            if (result && result.then) {// ducktyping Promise
                result
                    .then(x => finished(null, data), finished)
            }
            else {
                finished(null, data)
            }
        }
        catch (e) {
            finished(e)
        }
    }
}

/**
 * attach --faster flag
 * @private (export for test)
 */
export function attachFasterFlag(data) {

    const { flags, options } = data.result[1]

    flags.faster = { default: false, desc: 'enables faster rebuilding' }
    flags['ft-debug']= { default: false, desc: 'faster titanium debug mode' }
    options['ft-port'] = { default: 4157, desc: 'port number for faster-titanium http server. If not available, use another open port.' }
}


/**
 * attach --faster flag
 * @private (export for test)
 */
export function showLogo() {
    console.log(chalk.red(read(__dirname + '/../../doc/txt-logo', 'utf8')))
    const {version, author} = require(__dirname + '/../../package.json')
    console.log(`\tFasterTitanium ${version} by ${author} Accelerate Titanium development.\n`)
}


/**
 * launch file/event servers to communicate with App
 * @return {Promise}
 */
export function launchServers(data) {

    const { platform,
            'ft-port': port = 4157,
            'ft-debug': tiDebug = false,
            'project-dir': projectDir } = this.cli.argv

    return getPorts(port).then(ports => {

        const optsForServer = {
            platform,
            fPort: ports[0],
            nPort: ports[1],
            host : getAddress(),
            tiDebug
        }
        this.ftProcess = new MainProcess(projectDir, optsForServer)
        return this.ftProcess.launchServers()
    })
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
export function manipulateAppJS(data) {
    const { 'project-dir': projectDir } = this.cli.argv

    const [src, dest] = data.args

    if (!isAppJS(projectDir, src)) return;

    const newSrc = dirname(dest) + '/faster-titanium.js' // new src path is in build dir, just because it's temporary.

    this.logger.info(`[FasterTitanium] manipulating app.js: attaching faster-titanium functions`)

    data.args[0] = newSrc

    const { fPort, nPort, host } = this.ftProcess

    const code = generateNewAppJS(fPort, nPort, host)

    write(newSrc, code)
}


/**
 * Generate new app.js code.
 * New app.js consists of bundled lib of faster-titanium and one line initializer
 * @private
 */
export function generateNewAppJS(fPort, nPort, host) {

    const opts = JSON.stringify({ fPort, nPort, host })

    const initialCode = `Ti.FasterTitanium.run(this, ${opts})`
    const tiEntry = resolve(__dirname, '../../dist/titanium/faster-titanium.bundle.js')

    return [read(tiEntry, 'utf8'), initialCode].join('\n')
}

/**
 * start watching files
 */
export function startWatching() {
    this.ftProcess.watch()
}


/**
 * show server information
 */
export function showServerInfo() {
    this.logger.info(`

        URL for FasterTitanium Web UI
        ${chalk.green(this.ftProcess.url)}
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


/**
 * Check if global alloy compatible with faster-titanium
 * Kill this process if not compatible.
 * Global alloy is used to compile at first build in faster-titanium.
 * Subsequent builds are done by alloy in faster-titanium's node_modules.
 * If two alloy versions mismatch, the app can be broken.
 *
 */
export function isAlloyCompatible() {

    const alloyPath = which('alloy')

    const alloyVer = alloyPath && exec(`${alloyPath} -v`, {silent: true}).stdout.trim()
    if (!alloyVer) return; // no alloy: OK

    const isGlobalAlloy = !!alloyPath.match('^/usr')

    const versionRange = '>=1.7'

    const isCompatible = semver.valid(alloyVer) && semver.satisfies(alloyVer, versionRange)

    if (!isCompatible) {
        this.logger.error(`
            Invalid alloy version "${alloyVer}".
            (alloy path = ${alloyPath})

            To get "--faster" option enabled, global alloy version must satisfy with "${versionRange}".

                npm install ${isGlobalAlloy ? '-g ' : ''}alloy
        `)
        process.exit(1)
    }
}
