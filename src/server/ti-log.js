
/**
 * Logger titanium logs into server console
 */
export default class TiLog {

    static log(args, options) {
        this.__base('INFO', '', '', args, options)
    }

    static info(args, options) {
        this.__base('INFO', '', '', args, options)
    }

    static warn(args, options) {
        this.__base('WARN', '\u001b[33m', '\u001b[0m', args, options)
    }

    static debug(args, options) {
        this.__base('DEBUG', '\x1b[38;5;240m', '\x1b[0m', args, options)
    }

    static trace(args, options) {
        this.__base('TRACE', '\x1b[38;5;233m', '\x1b[0m', args, options)
    }

    static error(args, options) {
        this.__base('ERROR', '\u001b[31m', '\u001b[0m', args, options)
    }

    static critical(args, options) {
        this.__base('CRITICAL', '\u001b[31m', '\u001b[0m', args, options)
    }


    static __base(name, startANSI, endANSI, args, options = {}) {
        const {time, debugname} = options
        const title = debugname ? debugname + ':' + name : name

        const consoleArgs = [startANSI + `[Ti:${title}]`, ...args]

        if (time) {
            const timediff = new Date().getTime(time) - new Date().getTime()
            if (timediff < 0) consoleArgs.push(`\u001b[36m${timediff}ms\u001b[0m`) // cyan
        }
        if (endANSI) consoleArgs.push(endANSI)

        console.log.apply(console, consoleArgs)
    }
}
