'use strict';

import { parse } from 'acorn'

/**
 * parse original app.js and export variables to global
 */
export default class AppJsConverter {

    /**
     * @param {string} code JS code
     */
    constructor(code) {
        /** @type {string} code */
        this.code = code

        /** @type {string[]} codeArr */
        this.codeArr = String(this.code).split('');
    }


    /**
     * convert varable declaration in top scope to this['varname'] expression
     *
     * before: var a, b = 12;
     * after : this['a'] = undefined; this['b'] = 12;
     *
     * @return {string} new code
     *
     */
    convert() {
        parse(this.code, { ranges: true, ecmaVersion: 5 }).body
            .filter(node => node.type === 'VariableDeclaration')

            .map(vDeclaration => {

                const newCode = vDeclaration.declarations.map(declarator => {

                    const expression = (declarator.init)
                        ? this.code.slice(...declarator.init.range)
                        : 'undefined'

                    return `this['${declarator.id.name}'] = ${expression};`

                }).join(' ')

                return { newCode, range: vDeclaration.range }
            })
            .forEach(info => { this.replace(info.newCode, info.range) })

        return this.codeArr.join('')
    }


    /**
     * @param {string} newCode
     * @param {number[]} range
     * @private
     */
    replace(newCode, range) {

        let offset = range[0]

        this.codeArr[offset] = newCode

        for (let i = offset + 1; i < range[1]; i++) {
            this.codeArr[i] = ''
        }
    }
}
