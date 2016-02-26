import program from 'commander'
import {statSync as stat} from 'fs'
import {resolve} from 'path'
import MainProcess from '../server/main-process'

program
    .arguments('[proj-dir]')
    .option('-f, --fport <port number>', 'port number of the http server', parseInt)
    .option('-n, --nport <port number>', 'port number of the notification server', parseInt)
    .option('-p, --platform <platform name>', 'ios|android')
    .parse(process.argv)


function run() {

    const projDir = program.args[0]

    const { fport, nport, platform } = program

    if (fport == null || nport == null || platform == null || projDir == null) {
        return program.help()
    }
    const opts = {
        fPort: fport,
        nPort: nport,
        host:  'localhost',
        platform
    }

    const absProjDir = absolutePath(projDir)

    if (!isDirectory(absProjDir)) {
        console.error(`${absProjDir} is not a valid directory.`)
        program.help()
        return
    }

    const ftProcess = new MainProcess(absProjDir, opts)

    ftProcess.launchServers()
    ftProcess.watch()
    console.log(`FasterTitanium launched with url : ${ftProcess.url}`)
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
