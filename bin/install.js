require('shelljs/global')
// import {resolve} from 'path'
const resolve = require('path').resolve

// const log = ::console.log
const log = function(v) { console.log(v) }

function run() {
    log('begin installing faster-titanium')
    const tiPath = which('titanium')
    if (!tiPath) {
        log('titanium command not found. Finish installation.')
        return
    }

    const hookPath = resolve(__dirname, '../dist/hook/faster.js')
    //const ticonf = JSON.parse(exec(`${tiPath} config -o json`, {silent: true}).output)
    const ticonf = JSON.parse(exec(tiPath + ' config -o json', {silent: true}).output)

    if (ticonf['paths.hooks'] && ticonf['paths.hooks'].indexOf(hookPath) >= 0) {
        log('already installed')
        return
    }

    // const result = exec(`${tiPath} -q config paths.hooks -a ${hookPath}`)
    const result = exec(tiPath + ' -q config paths.hooks -a ' + hookPath)


    if (result.code) {
        log('installation failed')
        log(result)
    }
    else {
        log('installation succeeded')
    }
}

if (require.main === module) run()
