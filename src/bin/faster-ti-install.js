import 'shelljs/global'
import {resolve} from 'path'
import chalk from 'chalk'
const log = (str, color) => console.log(color ? chalk[color](str) : str)

function run() {
    log('begin installing faster-titanium')
    const tiPath = which('titanium')
    if (!tiPath) {
        log('titanium command not found. Finish installation.', 'red')
        return
    }

    const hookPath = resolve(__dirname, '../../dist/hook/faster.js')
    const ticonf = JSON.parse(exec(`${tiPath} config -o json`, {silent: true}).output)

    if (ticonf['paths.hooks'] && ticonf['paths.hooks'].indexOf(hookPath) >= 0) {
        log('faster-titanium is already installed in titanium hook.', 'yellow')
        return
    }

    const result = exec(`${tiPath} -q config paths.hooks -a ${hookPath}`)

    if (result.code) {
        log('Install failed.', 'red')
        console.log(result)
    }
    else {
        log('Install succeeded!', 'green')
    }
}

if (require.main === module) run()
