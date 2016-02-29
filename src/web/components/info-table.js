import postPreferences from '../post-preferences'
import Fa from './fa'
import GlobalState from '../global-state'



export default class InfoTable extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loadingStyleHighLight: false
        }
    }

    render() {
        return (
            <table cellSpacing='0'>
            <thead>
              <tr><th>Property Name</th>
              <th>Value
              <Fa icon="refresh" style={{paddingLeft: 10, fontSize:15}} onClick={this.props.fetchInfo}/>
              </th></tr>
            </thead>
            <tbody>{this.trs}</tbody>
            </table>
        )
    }

    get trs() {
        const {info} = this.props
        return Object.keys(info)
            .map(k => <tr key={k}><td>{k}</td>{this.infoValueTD(k, info[k])}</tr>)
    }



    get loadingStyleCSS() {
        const style = {
            cursor: 'pointer',
            transition: 'background-color .3s',
        }

        if (this.state.loadingStyleHighLight) {
            style.background = '#99c2f4'
        }
        return style
    }


    /**
     * prepare <td> tag for info value
     * @param {string} k key of info json
     * @param {string} v value of info json
     */
    infoValueTD(k, v) {

        const modifiers = {

            'loading style': v =>

                <td style={this.loadingStyleCSS}
                    onClick={::this.showSelectionModal}
                    onMouseOver={x => this.setState({loadingStyleHighLight: true})}
                    onMouseOut={x => this.setState({loadingStyleHighLight: false})}>
                    {v}
                    <Fa icon="arrow-circle-right" style={{color: '#39f', paddingLeft: 10}} />
                </td>,


            'connection with client': v =>
                <td style={{cursor: 'pointer'}} onClick={::this.showConnectionHintModal}>
                    <Fa icon={v ?'check':'close'} style={{color: v?'green':'red', fontSize: 30}}/>
                    <Fa icon="question-circle" style={{color: '#39f', fontSize: 13, paddingLeft: 6, verticalAlign: '20%'}}/>
                </td>,

            'show debug log in Titanium': (v, k) => this.getSwitchUI(v, k, 'tiDebug'),
            'show ti log in server console': (v, k) => this.getSwitchUI(v, k, 'serverLog'),
            'show ti log in titanium console': (v, k) => this.getSwitchUI(v, k, 'localLog'),
        }

        return modifiers[k] ? modifiers[k](v, k) : <td>{v}</td>
    }


    /**
     * binary switch in <td>
     * click => send server and flip the value
     * @param {boolean} bool the value
     * @param {string} propName table property name
     * @param {string} prefKey a property name of Preferences object
     */
    getSwitchUI(bool, propName, prefKey) {
        const onClick = (evt) => {
            postPreferences({[prefKey]: !bool})
            .then(json => GlobalState.set('tableInfo', propName, !bool))
        }

        return (
        <td style={{cursor: 'pointer'}} onClick={onClick}>
            <Fa icon={bool ?'toggle-on':'toggle-off'} style={{color: bool?'green':'gray', fontSize: 30}}/>
        </td>
        )
    }


    showConnectionHintModal() {
        GlobalState.set('connectionHintModal', true)
    }

    showSelectionModal() {
        GlobalState.set('selectionModal', true)
    }
}
