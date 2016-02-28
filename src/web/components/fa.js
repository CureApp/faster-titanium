
export default class FontAwesomeComponent extends React.Component {

    constructor(props) {
        super(props)
        this.state = {}
    }

    get className() {
        return `fa fa-${this.props.icon}`

    }

    render() {
        return (
            <i className={this.className} {...this.props}></i>
        )
    }
}
