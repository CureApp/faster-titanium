
import assert from 'power-assert'
import FasterTitanium from '../../src/titanium/faster-titanium'
import './ti-shim'


describe('FasterTitanium', ()=> {

    it('is available without error', ()=> {

        FasterTitanium.run()
    })
})
