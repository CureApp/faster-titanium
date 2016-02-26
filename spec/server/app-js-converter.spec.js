
import assert from 'power-assert'
import AppJsConverter from '../../src/server/app-js-converter'


describe('AppJsConverter', ()=> {

    it('converts simple variable declaration into this[""] expression', ()=> {

        const origCode = `var a = 1;`

        const newCode = new AppJsConverter(origCode).convert()

        const expected = `this['a'] = 1;`

        assert(newCode === expected)
    })


    it('converts variable declarations into this[""] expression', ()=> {

        const origCode = `var a = 1, b = "shinout";`

        const newCode = new AppJsConverter(origCode).convert()

        const expected = `this['a'] = 1; this['b'] = "shinout";`

        assert(newCode === expected)
    })


    it('converts variable declaration with no initialization into this[""] = undefined', ()=> {

        const origCode = `var a;`

        const newCode = new AppJsConverter(origCode).convert()

        const expected = `this['a'] = undefined;`

        assert(newCode === expected)
    })


    it('attaches semicolon after this[""] expression', ()=> {

        const origCode = `var a`

        const newCode = new AppJsConverter(origCode).convert()

        const expected = `this['a'] = undefined;`

        assert(newCode === expected)
    })


    it('does not convert variable declarations in non-top scope', ()=> {

        const origCode = `function abc() { var a = 123 }`

        const newCode = new AppJsConverter(origCode).convert()

        assert(newCode === origCode)
    })


    it('converts variable declarations with LF', ()=> {

        const origCode = `var a = 123,
            b,
            Alloy = require('alloy'),
            _ = Alloy._;`

        const newCode = new AppJsConverter(origCode).convert()

        const expected = `this['a'] = 123; this['b'] = undefined; this['Alloy'] = require('alloy'); this['_'] = Alloy._;`

        assert(newCode === expected)
    })


    it('converts variable declarations with LF', ()=> {

        const origCode = `var a=1;var b=require('b'), c;`

        const newCode = new AppJsConverter(origCode).convert()

        const expected = `this['a'] = 1;this['b'] = require('b'); this['c'] = undefined;`

        assert(newCode === expected)
    })


    it('converts variable declaration containing multi-byte characters', ()=> {

        const origCode = `var ft = "速すぎるTitanium";\n var ft2 = 'faster-titanium'`

        const newCode = new AppJsConverter(origCode).convert()

        const expected = `this['ft'] = "速すぎるTitanium";\n this['ft2'] = 'faster-titanium';`

        assert(newCode === expected)
    })


})

