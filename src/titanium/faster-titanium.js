"use strict";
import Socket from './socket'
import RequireAgent from './require-agent'

const ____ = (v) => console.log('[Faster-Titanium]', v)


export default class FasterTitanium {

    static run(options = {}) {
        return new FasterTitanium(options)
    }


    constructor(options = {}) {

        const { fPort = 4157, ePort = 4156, host = 'localhost' } = options

        this.reqAgent = new RequireAgent(host, fPort, this.getPlatform())

        const socket = new Socket({host: host, port: parseInt(ePort, 10)})

        socket.onData (payload => {
            socket.end()
            this.reload()
        })

        this.reqAgent.require('second-entry-after-faster-titanium')
    }

    /**
     * @returns {string}
     */
    getPlatform() {
        return Ti.Platform.osname
    }


    /**
     * reload this app
     */
    reload() {
        try {
            ____('reloading app');
            Ti.App._restart();
        }
        catch(e) {
            ____('reloading App via legacy method');
            this.reqAgent.require('app');
        }
    }
}

if (typeof Ti !== 'undefined') Ti.FasterTitanium = FasterTitanium
