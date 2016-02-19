
import { join, resolve, } from 'path'

/**
 * @param {string} projectDir absolute path to the titanium project directory
 * @param {string} path absolute path to the path in Resources
 * @return {boolean} is app.js
 */
export function isAppJS(projectDir, path) {

    projectDir = resolve(projectDir)
    path = resolve(path)

    return ['', 'android', 'ipad', 'iphone', 'ios']
        .map(name => join(projectDir, 'Resources', name, 'app.js'))
        .some(appPath => path === appPath)
}
