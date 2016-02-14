
import assert from 'power-assert'
import Socket from '../../src/titanium/socket'
import './ti-shim'


describe('Socket', ()=> {

    it('connectionListener is called when connected', ()=> {

        const socket = new Socket({host: 'localhost', port: 4156})
        const { connected } = socket.proxy // mock

        let counter = 0
        socket.connectionListener = (v) => counter++

        connected({socket: {}})

        assert(counter === 1)
    })


    it('dataListener is attached by onData method', ()=> {

        const socket = new Socket({host: 'localhost', port: 4156})
        socket.onData((v) => v)
        assert(typeof socket.dataListener === 'function')

    })

})
