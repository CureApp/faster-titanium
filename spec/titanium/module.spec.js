
import assert from 'power-assert'
import Module from '../../src/titanium/module'
import './ti-shim'


describe('Module', ()=> {

    it('__dirname is undefined when moduleName is "app"', ()=> {

        assert(new Module('app').__dirname === undefined)
    })


    it('__filename is undefined when moduleName is "app"', ()=> {

        assert(new Module('app').__filename === undefined)
    })


    it('__dirname is "." when moduleName is "alloy"', ()=> {

        assert(new Module('alloy').__dirname === '.')
    })


    it('__dirname is "alloy" when moduleName is "alloy/underscore"', ()=> {

        assert(new Module('alloy/underscore').__dirname === 'alloy')
    })


    it('__dirname is "alloy/controllers" when moduleName is "alloy/controllers/index"', ()=> {

        assert(new Module('alloy/controllers/index').__dirname === 'alloy/controllers')
    })


    it('__filename is "alloy" when moduleName is "alloy"', ()=> {

        assert(new Module('alloy').__filename === 'alloy')
    })


    it('__filename is "underscore" when moduleName is "alloy/underscore"', ()=> {

        assert(new Module('alloy/underscore').__filename === 'underscore')
    })


    it('__filename is "index" when moduleName is "alloy/controllers/index"', ()=> {

        assert(new Module('alloy/controllers/index').__filename === 'index')
    })



})
