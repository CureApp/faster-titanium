require('shelljs/global')
import {resolve} from 'path'

const log = ::console.log

function run() {
    log('begin installing faster-titanium')
    const tiPath = which('titanium')
    if (!tiPath) {
        log('titanium command not found. Finish installation.')
        return
    }

    const hookPath = resolve(__dirname, '../../dist/hook/faster.js')
    const result = exec(`${tiPath} -q config paths.hooks -r ${hookPath}`)


    if (result.code) {
        log('uninstallation failed')
        log(result)
    }
    else {
        log('uninstallation succeeded')
    }
}

if (require.main === module) run()
