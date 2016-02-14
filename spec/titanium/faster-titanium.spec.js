
import assert from 'power-assert'
import FasterTitanium from '../../src/titanium/faster-titanium'
import './ti-shim'


describe('FasterTitanium', ()=> {

    before(() => {
        FasterTitanium.run(global)
    })

    it('sets instance of FasterTitanium to FasterTitanium.instance', ()=> {

        assert(FasterTitanium.instance instanceof FasterTitanium)
    })
})
