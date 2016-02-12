
const noop = () => {}

global.Ti = {

    Platform: {
        osname: 'iphone'
    },

    Stream: {
        pump: (v, fn) => fn({buffer: 'buffer-mock'})
    },

    Network: {
        createHTTPClient: v => {
            return {
                open: noop,
                setRequestHeader: noop,
                send: noop,
                readyState: 4,
                status: 200,
                responseText: 'module.exports = "abc"'
            }
        },

        Socket: {
            createTCP: (options) => {
                options.connect = noop
                return options
            }
        }
    },

    App: {
        _restart: val => val
    }
}
