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
        this.setState({data: nextProps.data});
    }

    render() {
        return <div>
            <h4>{this.props.title}</h4>
            <ul>
                {this.state.data.x &&
                <li>
                    ({this.state.data.x},{this.state.data.y})
                </li>
                }
                {this.state.data.pathway &&
                <li>
                    Genes ({this.state.data.pathway.gene.length}) <br/>
                    Pathway: {this.state.data.pathway.golabel} ({this.state.data.pathway.goid})
                </li>
                }
                {this.state.data.tissue &&
                <li>
                    Tissue: {this.state.data.tissue}
                </li>
                }
                {this.state.data.expression &&
                <li>
                    Expression: {this.state.data.expression}
                </li>
                }
            </ul>
        </div>
    }
}

HoverView.propTypes = {
    data: PropTypes.any.isRequired,
    title: PropTypes.any.isRequired,
};
