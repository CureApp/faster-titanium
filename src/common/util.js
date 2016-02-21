
import { join, resolve, } from 'path'
import 'alloy/Alloy/common/constants' // it must be imported before alloy/platforms/index
import platforms from 'alloy/platforms/index' // TODO: prepare original object

const folderNames = Object.keys(platforms).map(p => platforms[p].titaniumFolder)
/**
 * @param {string} projectDir absolute path to the titanium project directory
 * @param {string} path absolute path to the path in Resources
 * @return {boolean} is app.js
 */
export function isAppJS(projectDir, path) {

    projectDir = resolve(projectDir)
    path = resolve(path)

    return folderNames
        .map(name => join(projectDir, 'Resources', name, 'app.js'))
        .some(appPath => path === appPath)
}

export function getPlatformDirname(platform) {
    const platformInfo = platforms[platform]
    if (!platformInfo) {
        throw new Error(`no platform found: ${platform}`)
    }
    return platformInfo.titaniumFolder
}
