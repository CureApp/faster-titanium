import 'shelljs/global'
import {resolve} from 'path'
import chalk from 'chalk'
const log = (str, color) => console.log(color ? chalk[color](str) : str)

function run() {
    log('checking if faster-titanium is installed in titanium hook...')
    const tiPath = which('titanium')
    if (!tiPath) {
        log('titanium command not found. Finish checking.')
        return
    }

    const hookPath = resolve(__dirname, '../../dist/hook/faster.js')
    const ticonf = JSON.parse(exec(`${tiPath} config -o json`, {silent: true}).output)

    if (ticonf['paths.hooks'] && ticonf['paths.hooks'].indexOf(hookPath) >= 0) {
        log('faster-titanium is already installed in titanium hook.', 'green')
        return
    }
    log('Not installed yet. Install with the following command.\n', 'yellow')
    log('faster-ti install')
}

if (require.main === module) run()
