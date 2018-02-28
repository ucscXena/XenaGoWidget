import React, {Component} from 'react'
import PropTypes from 'prop-types';

export default class HoverView extends Component {

    constructor(props) {
        super(props);
        console.log('consturtor hvoerveiew');
        console.log(props)
        // data: props.data;
        this.state = {
            data: props.data
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ data: nextProps.data });
    }

    render() {
        return <div>
            <h4>Hover Box</h4>
            <ul>
                <li>
                    X: {this.state.data.x}
                </li>
                <li>
                    Y: {this.state.data.y}
                </li>
                <li>
                    Test Value: {this.state.data.aaa}
                </li>
            </ul>
        </div>
    }
    }

    HoverView.propTypes = {
        data: PropTypes.any.isRequired,
    };
