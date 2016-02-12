
import assert from 'power-assert'
import RequireAgent from '../../src/titanium/require-agent'

describe('RequireAgent', ()=> {

    describe('createModule', ()=> {

        it('creates module from source', ()=> {

            const reqAgent = new RequireAgent('dummy', 3000, 'iphone')

            const source = `
                module.exports = function(a) { return a + ' faster titanium' }
            `

            const mod = reqAgent.createModule('sample1', source)

            assert(typeof mod.exports === 'function')
            assert(mod.exports('shinout is developing') === 'shinout is developing faster titanium')
        })


        it('creates module from source with no exports', ()=> {

            const reqAgent = new RequireAgent('dummy', 3000, 'iphone')

            const source = `
                var a = 'faster titanium'
            `

            const mod = reqAgent.createModule('sample1', source)

            assert(typeof mod.exports === 'object')
            assert(Object.keys(mod.exports).length === 0)
        })



        it('cannot create module from source with syntax error', ()=> {

            const reqAgent = new RequireAgent('dummy', 3000, 'iphone')

            const source = `
                var a = 'faster titanium
            `

            try {
                const mod = reqAgent.createModule('sample1', source)
                throw new Error('shouldnt be occurred')
            }
            catch (e) {
                assert(e.message.match(/Unexpected token ILLEGAL/))
            }
        })
    })



    describe('require', ()=> {

        it('require from server when not cached.', ()=> {

            const reqAgent = new RequireAgent('dummy', 3000, 'iphone')

            reqAgent.getServerSource = (name) => `module.exports = "${name}"` // mocking

            const result = reqAgent.require('shinout-module')

            assert(result === 'shinout-module')
            assert(reqAgent.modules['shinout-module'])
        })


        it('require from cache when cached.', ()=> {

            const reqAgent = new RequireAgent('dummy', 3000, 'iphone')

            let counter = 0

            reqAgent.getServerSource = (name) => {
                counter++
                return `module.exports = "${name}"` // mocking
            }

            reqAgent.require('shinout-module')
            assert(counter === 1)

            const cachedResult = reqAgent.require('shinout-module')
            assert(counter === 1)
            assert(cachedResult === 'shinout-module')
        })


    })
})
