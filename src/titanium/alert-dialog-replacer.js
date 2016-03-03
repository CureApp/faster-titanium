import Logger from './logger'
const ____ = Logger.debug('AlertDialogReplacer')

/**
 * Overwrite Ti.UI.createAlertDialog and hide them before restarting the app.
 */
export default class AlertDialogReplacer {

    /**
     * virtual constructor for this singleton class
     */
    static init() {
        this.dialogs = []
        this.replace()
    }

    /**
     * Hide alert dialogs
     * @param {function} cb callback called after hiding dialogs
     * @param {number} timer interval to call callback
     */
    static hide(cb, timer) {
        if (this.dialogs.length > 0) { timer = Math.max(500, timer) }

        ____(`Hiding ${this.dialogs.length} dialogs before restarting app.`, 'debug')
        this.dialogs.forEach(d => d.hide())

        ____(`Restart procedure will be occurred after ${timer}ms.`, 'debug')
        setTimeout(cb, timer)
    }

    /**
     * Replace Ti.UI.createAlertDialog
     * Store created dialogs
     */
    static replace() {

        const orig = Ti.createAlertDialog

        Ti.UI.createAlertDialog = (...args) => {
            const dialog = orig.apply(Ti.UI, args)
            ____(`Dialog is created.`, 'debug')
            this.dialogs.push(dialog)
            return dialog
        }
    }


    /**
     * global alert function, replaced in RequireAgent
     * @param {string}
     */
    static alert(message) {
        Ti.UI.createAlertDialog({message}).show()
    }
}
