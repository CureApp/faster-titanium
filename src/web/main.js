"use strict";

import Preferences from '../common/preferences'
const wait = (msec => new Promise(y => setTimeout(y, msec)))

const arrow = '&nbsp;<i class="fa fa-arrow-circle-right"></i>'

class Main {

    constructor() {
    }

    init() {
        window.addEventListener('load', ::this.showInfo)
    }


    /**
     * show server information
     */
    showInfo() {
        fetch('/info')
            .then(res => res.json())
            .then(json => {
                const tableContent = Object.keys(json)
                    .map(k => `<tr><td>${k}</td>${this.infoValueTD(k, json[k])}</tr>`)
                    .join('')

                document.getElementById('infoTableBody').innerHTML = tableContent
            })
    }


    /**
     * prepare <td> tag for info value
     * @param {string} k key of info json
     * @param {string} v value of info json
     */
    infoValueTD(k, v) {
        const modifiers = {
            'loading style': v => `<td onClick="main.toggleSelectionModal()" id="loading-style-value">${v}${arrow}`
        }
        return modifiers[k] ? modifiers[k](v) : `<td>${v}</td>`
    }


    /**
     * show/hide the loading style selection modal
     * @param {Event} evt event object. If not given, toggle will be executed. Otherwise, toggling will be done only when evt.target is #overlay.
     */
    toggleSelectionModal(evt) {
        const el = document.getElementById('overlay')
        if (!evt || evt.target === el) {
            el.style.visibility = (el.style.visibility == 'visible') ? 'hidden' : 'visible'
        }
    }

    /**
     * show information of the loading style on mouse
     * @param {string} index stringified number of Preferences
     */
    showStyleDescription(index) {
        const desc = Preferences.descriptions[index]
        document.getElementById('loading-style-description').innerText = desc
    }


    /**
     * reload the titanium app
     */
    reload() {
        this.disableButton()
        fetch('/reload').then(res => res.text())
        .then(text => {
            document.getElementById('notice').innerText = 'Now Reloading...'
            return wait(1500)
        })
        .then(() => {
            document.getElementById('notice').innerText = ''
        })
        .then(::this.showInfo)
    }

    /**
     * disable reload button in reloading
     * @todo implement
     */
    disableButton() {
        // TODO
    }

    /**
     * send custom loading style name to the server
     */
    changeLoadingStyle() {
        const td = document.getElementById('loading-style-value')
        const val = document.querySelector('#overlay select').value
        this.toggleSelectionModal()

        fetch(`/loading-style/${val}`)
        .then (res => res.json())
        .then (json => {
            return wait(300).then(x => {
                td.innerHTML = json.expression + arrow
                td.classList.add('changed')
                return wait(1000)
            })
        })
        .then (x => td.classList.remove('changed'))
    }
}

window.main = new Main()
main.init()
