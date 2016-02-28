import 'shelljs/global'
import {resolve} from 'path'
import chalk from 'chalk'
const log = (str, color) => console.log(color ? chalk[color](str) : str)

function run() {
    log('begin uninstalling faster-titanium')
    const tiPath = which('titanium')
    if (!tiPath) {
        log('titanium command not found. Finish installation.', 'red')
        return
    }

    const hookPath = resolve(__dirname, '../../dist/hook/faster.js')
    const result = exec(`${tiPath} -q config paths.hooks -r ${hookPath}`)

    if (result.code) {
        log('Uninstall failed.', 'red')
        console.log(result)
    }
    else {
        log('Uninstall succeeded.', 'green')
    }
}

if (require.main === module) run()
