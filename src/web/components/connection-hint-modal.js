
import GlobalState from '../global-state'
import Fa from './fa'
import modalStyle from '../styles/modal'
const wait = (msec => new Promise(y => setTimeout(y, msec)))


const windowStyle = {
    position: 'relative',
    margin: '200px auto',
    background: 'rgba(255,255,255, 1)',
    width: 400,
    height: 200,
    borderRadius: 6,
    boxShadow: 'rgba(113, 135, 164, 0.65098) 0 0 6 3',
}

const descriptionStyle = {
    width: 350,
    margin: '10px auto',
    height: 60,
    fontSize: 14,
    color: 'rgba(140, 140, 140, 1)',
}

const titleStyle = {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 16,
    background: '#ededed',
    background: '-webkit-gradient(linear, left top, left bottom, from(#ededed), to(#ebebeb))',
    background: '-moz-linear-gradient(top,  #ededed,  #ebebeb)',
    borderRadius:6,
    color: 'rgba(80, 80, 80, 1)',
}


/**
 * modal for showing hint of connection with Titanium app
 */
export default class ConnectionHintModal extends React.Component {

    constructor(props) {
        super(props)
    }


    render() {
        return (
        <div style={modalStyle} id="connection-hint-modal" onClick={evt => evt.target.id === 'connection-hint-modal' && this.close()}>
            <div style={windowStyle}>
                <Fa onClick={::this.close} icon="close" style={{position: 'absolute', top: 15, right: 15, cursor: 'pointer'}} />
                <p style={titleStyle}>
                    <Fa icon="question-circle" style={{marginRight: 10}} />
                    Hint for connection
                </p>
                <div style={descriptionStyle}>{this.hint}</div>
            </div>
        </div>
        )
    }

    get hint() {
        return `
        If not connected, try restarting app.
        Restart is "restart", not "resume".
        On iOS simulator, press Command + Shift + H twice quickly and swipe up the app,
        then the running app will be killed and you can "restart".
        `
    }



    close() {
        GlobalState.set('connectionHintModal', false)
    }
}
