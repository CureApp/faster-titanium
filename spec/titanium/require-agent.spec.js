
import assert from 'power-assert'
import RequireAgent from '../../src/titanium/require-agent'
import {relativePath} from '../../src/titanium/require-agent'

describe('RequireAgent', ()=> {

    describe('createModule', ()=> {

        it('creates module from source', ()=> {

            const reqAgent = new RequireAgent(require, 'localhost', 3000)

            const source = `
                module.exports = function(a) { return a + ' faster titanium' }
            `

            const mod = reqAgent.createModule('sample1', source)

            assert(typeof mod.exports === 'function')
            assert(mod.exports('shinout is developing') === 'shinout is developing faster titanium')
        })


        it('creates module from source with __dirname and __filename variables', ()=> {

            const reqAgent = new RequireAgent(require, 'localhost', 3000)

            const source = `
                module.exports = __dirname + ' ' + __filename
            `

            const mod = reqAgent.createModule('foo/bar', source)

            assert(typeof mod.exports === 'string')
            assert(mod.exports === 'foo bar')
        })


        it('creates module from source with no exports', ()=> {

            const reqAgent = new RequireAgent(require, 'localhost', 3000)

            const source = `
                var a = 'faster titanium'
            `

            const mod = reqAgent.createModule('sample1', source)

            assert(typeof mod.exports === 'object')
            assert(Object.keys(mod.exports).length === 0)
        })



        it('cannot create module from source with syntax error', ()=> {

            const reqAgent = new RequireAgent(require, 'localhost', 3000)

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

            const reqAgent = new RequireAgent(require, 'localhost', 3000)


            reqAgent.getServerSource = (name) => `module.exports = "${name}"` // mocking

            const result = reqAgent.require('shinout-module')

            assert(result === 'shinout-module')
            assert(reqAgent.modules['shinout-module'])
        })


        it('require from cache when cached.', ()=> {

            const reqAgent = new RequireAgent(require, 'localhost', 3000)

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
    describe('relativePath', ()=> {

        it('resolves relative path with ./', ()=> {
            const absPath = relativePath('alloy/controller/index', './constants')
            assert(absPath === 'alloy/controller/constants')
        })

        it('resolves relative path with a ../', ()=> {
            const absPath = relativePath('alloy/controller/index', '../constants')
            assert(absPath === 'alloy/constants')
        })


        it('resolves relative path which ends with /', ()=> {
            const absPath = relativePath('alloy/controller/index', '../constants/')
            assert(absPath === 'alloy/constants/')
        })

        it('resolves relative path with ./s and ../s', ()=> {
            const absPath = relativePath('alloy/controller/index', '../././constants')
            assert(absPath === 'alloy/constants')
        })

        it('resolves relative path with many ../s', ()=> {
            const absPath = relativePath('alloy/controller/index', '../../constants')
            assert(absPath === 'constants')
        })

        it('cannot resolve relative path when fromPath contains too many ../s', ()=> {
            try {
                const absPath = relativePath('alloy/controller/index', '../../../constants')
                throw new Error('')
            }
            catch (e) {
                assert(e.message === `cannot resolve relative path. from: alloy/controller/index, to: ../../../constants`)
            }
        })


    })
})
