import program from 'commander'
import {statSync as stat, readFileSync as read} from 'fs'
import {resolve} from 'path'
import MainProcess from '../server/main-process'
import chalk from 'chalk'
const log = (str, color) => console.log(color ? chalk[color](str) : str)

program
    .arguments('[proj-dir]')
    .option('-f, --fport <port number>', 'port number of the http server', parseInt)
    .option('-n, --nport <port number>', 'port number of the notification server', parseInt)
    .option('-p, --platform <platform name>', 'ios|android')
    .option('-t, --token <token>', 'access token')
    .parse(process.argv)


function run() {

    const projDir = program.args[0]
    if (!projDir) return program.help()

    const hasOptions = ['fport', 'nport', 'platform', 'token'].every(opt => {
        const hasValue = program[opt] != null
        return hasValue || log(`"${opt}" option wasn't passed.`, 'yellow')
    })
    if (!hasOptions) return program.help()

    const opts = {
        fPort: program.fport,
        nPort: program.nport,
        host:  'localhost',
        platform: program.platform,
        token: program.token
    }

    const absProjDir = absolutePath(projDir)

    if (!isDirectory(absProjDir)) {
        log(`${absProjDir} is not a valid directory.`, 'red')
        program.help()
        return
    }

    showLogo()

    const ftProcess = new MainProcess(absProjDir, opts)

    ftProcess.launchServers()
    ftProcess.run()
    log(`FasterTitanium successfully launched.`, 'green')
    log(`\thttp server url: ${ftProcess.url}`, 'green')
    log(`\tproject dir: ${ftProcess.projDir}`, 'green')
    log(`\tplatform: ${ftProcess.platform}`, 'green')
    log(`\tnotification server port: ${ftProcess.nPort}`, 'green')
    log(`\taccess token: ${ftProcess.token}`, 'green')
}

export function showLogo() {
    log(read(__dirname + '/../../doc/txt-logo', 'utf8'), 'green')
    const {version, author} = require(__dirname + '/../../package.json')
    log(`\tFasterTitanium ${version} by ${author} Accelerate Titanium development.\n`, 'green')
}


/**
 * @param {string}
 * @return {string}
 */
function absolutePath(relPath) {
    if (relPath.charAt(0) === '/') return resolve(relPath)
    return resolve(process.cwd(), relPath)
}


/**
 * @param {string}
 * @return {boolean}
 */
function isDirectory(dir) {
    try {
        return stat(dir).isDirectory
    }
    catch (e) {
        return false
    }
}

if (require.main === module) run()
