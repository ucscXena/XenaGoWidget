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
            <h4>{this.props.title}</h4>
            <ul>
                <li>
                    ({this.state.data.x},{this.state.data.y})
                </li>
                <li>
                    Pathway: {this.state.data.pathway}
                </li>
                <li>
                    Tissue: {this.state.data.tissue}
                </li>
                <li>
                    Expression: {this.state.data.expression}
                </li>
            </ul>
        </div>
    }
    }

    HoverView.propTypes = {
        data: PropTypes.any.isRequired,
        title: PropTypes.any.isRequired,
    };
