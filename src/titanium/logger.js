
const firstLoaded = new Date().getTime()

const queue = []

export default function logger(name) {

    return function(str, type = 'log') {

        if (!logger.debugMode) return;

        const time = new Date().getTime()

        // first 1000msec, log won't be shown at console,
        if (time - firstLoaded < 1000) {
            queue.push([name, str, type])
            setTimeout(logQueue, 1000)
        }
        else {
            if (queue.length) logQueue()
            log(name, str, type)
        }

    }
}

function log(name, str, type) {
    const consolelog = console[type] || console.log
    consolelog(`[${name}]`, str)

}

function logQueue() {
    while (queue.length) {
        const args = queue.shift()
        log.apply(null, args)
    }
}
