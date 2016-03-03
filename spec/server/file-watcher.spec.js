
import assert from 'power-assert'
import FileWatcher from '../../src/server/file-watcher'


describe('FileWatcher', ()=> {

    let watcher;

    beforeEach(() => {
        watcher = new FileWatcher(__dirname)
    })

    afterEach(() => {
        watcher.close()
    })

    it('watching is false when "watch" has not been called yet', ()=> {

        assert(watcher.watching === false)
    })

    it('watching is false when "watch" has just been called', ()=> {

        watcher.watch()
        assert(watcher.watching === false)
    })

    it('watching is true when "watch" has been called 1000msec ago', ()=> {

        watcher.watch()
        assert(watcher.watching === false)

        return new Promise(y => {
            setTimeout(x => {
                assert(watcher.watching === true)
                y()
            }, 1000)
        })
    })


})

