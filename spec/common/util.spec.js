
import assert from 'power-assert'
import {modNameByPath} from '../../src/common/util'


describe('modNameByPath', ()=> {

    it('converts path to module name', ()=> {

        const origCode = `var a = 1;`
        const projDir = '/path/to/proj-dir'
        const platform = 'ios'

        const path = '/path/to/proj-dir/Resources/iphone/abc/def.js'

        const modName = modNameByPath(path, projDir, platform)

        assert(modName === 'abc/def')

    })

})
