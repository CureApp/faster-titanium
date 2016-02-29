
import Preferences from '../../common/preferences'
import GlobalState from '../global-state'
import postPreferences from '../post-preferences'
import modalStyle from '../styles/modal'
const wait = (msec => new Promise(y => setTimeout(y, msec)))


const windowStyle = {
    margin: '200px auto',
    background: 'rgba(255,255,255, 1)',
    width: 400,
    height: 300,
    borderRadius: 6,
    boxShadow: 'rgba(113, 135, 164, 0.65098) 0 0 6 3',
}


const descriptionStyle = {
    width: 250,
    margin: '10px auto',
    height: 60,
    fontSize: 12,
    color: 'rgba(140, 140, 140, 1)',
}

const selectStyle = {
    width: 250,
    fontSize: 20,
    color: 'rgba(100, 100, 100, 1)',
    border: '1 solid #ddd',
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
 * modal for selection of loading style
 */
export default class SelectionModal extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selected: 0,
            desc: ''
        }
    }


    render() {
        return (
        <div style={modalStyle} id="selection-modal" onClick={evt => evt.target.id === 'selection-modal' && this.close()}>
            <div style={windowStyle}>
                <p style={titleStyle}>Choose the loading style.</p>
                <div style={descriptionStyle}>{this.state.desc}</div>
                <select style={selectStyle} size="3" onChange={evt => this.setState({selected: evt.target.value})}>
                    <option onMouseOver={::this.showStyleDescription} value="1">auto-reload</option>
                    <option onMouseOver={::this.showStyleDescription} value="2">auto-reflect</option>
                    <option onMouseOver={::this.showStyleDescription} value="3">manual</option>
                </select>
                <div className="nice-button" id="change-loading-style-btn"><a onClick={::this.changeLoadingStyle}>Change</a></div>
            </div>
        </div>
        )
    }



    /**
     * send custom loading style name to the server
     */
    changeLoadingStyle() {
        const loadStyleNum = parseInt(this.state.selected)

        postPreferences({loadStyleNum})
        .then (json => {
            this.close()
            GlobalState.set('tableInfo', 'loading style', Preferences.expressions[loadStyleNum])
            GlobalState.set('notification', 'loading style changed.')
        })
        .then (x => wait(2000))
        .then (x => GlobalState.set('notification', ''))
    }


    showStyleDescription(evt) {

        const index = evt.target.value
        const desc = Preferences.descriptions[index]
        this.setState({desc})
    }


    close() {
        GlobalState.set('selectionModal', false)
    }
}
