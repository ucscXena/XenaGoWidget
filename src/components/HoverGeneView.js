import React, {Component} from 'react'
import PropTypes from 'prop-types';

export default class HoverGeneView extends Component {

    constructor(props) {
        super(props);
        // console.log('consturtor hvoerveiew');
        // console.log(props)
        // data: props.data;
        this.state = {
            data: props.data
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({data: nextProps.data});
    }

    render() {
        if(this.state.data.tissue){
            return (
                <div>
                    <h4>{this.props.title}</h4>
                    {this.state.data.tissue !== 'Header' &&
                    <ul>
                        {/*{this.state.data.x &&*/}
                        {/*<li>*/}
                        {/*({this.state.data.x},{this.state.data.y})*/}
                        {/*</li>*/}
                        {/*}*/}
                        {this.state.data.pathway &&
                        <li>
                            {/*Pathway: {this.state.data.pathway.golabel} ({this.state.data.pathway.goid}) <br/>*/}
                            Gene: ({this.state.data.pathway.gene[0]})
                        </li>
                        }
                        {this.state.data.tissue &&
                        <li>
                            Tissue: {this.state.data.tissue}
                        </li>
                        }
                        {this.state.data.expression != null &&
                        <li>
                            Expression: {this.state.data.expression}
                        </li>
                        }
                    </ul>
                    }
                    {this.state.data.tissue === 'Header' && this.state.data.pathway &&
                    <div>
                        Gene: {this.state.data.pathway.gene[0]} <br/>
                        Expression: {this.state.data.expression}
                    </div>
                    }
                </div>
            );
        }
        else{
            return <div></div>
        }
    }
}

HoverGeneView.propTypes = {
    data: PropTypes.any.isRequired,
    title: PropTypes.any.isRequired,
};
