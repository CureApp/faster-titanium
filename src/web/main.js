"use strict";

const wait = (msec => new Promise(y => setTimeout(y, msec)))

class Main {

    constructor() {
    }

    init() {
        window.addEventListener('load', ::this.showInfo)
    }


    showInfo() {
        fetch('/info')
            .then(res => res.json())
            .then(json => {
                const tableContent = Object.keys(json)
                    .map(k => "<tr><td>" + k + "</td><td>" + json[k] + '</td></tr>')
                    .join('')

                document.getElementById('infoTableBody').innerHTML = tableContent
            })
    }


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

    disableButton() {
        // TODO
    }
}

window.main = new Main()
main.init()
