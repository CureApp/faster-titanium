
/**
 * Logger titanium logs into server console
 */
export default class TiLog {

    static info(args) {
        console.log('[INFO]', ...args)
    }

    static warn(args) {
        console.log('\u001b[33m', '[WARN]', ...args, '\u001b[0m')
    }

    static debug(args) {
        console.log('\x1b[38;5;240m', '[DEBUG]', ...args, '\x1b[0m')
    }

    static trace(args) {
        console.log('\x1b[38;5;233m', '[TRACE]', ...args, '\x1b[0m')
    }

    static error(args) {
        console.log('\u001b[31m', '[ERROR]', ...args, '\u001b[0m')
    }

    static critical(args) {
        console.log('\u001b[31m', '[CRITICAL]', ...args, '\u001b[0m')
    }
}
