import React, {Component} from 'react'
import PropTypes from 'prop-types';

export class CohortSelector extends Component{

    constructor(props){
        super(props)
    }

    onChange = (event) => {
        let {onChange} = this.props;
        if (onChange) {
            onChange(event.target.value);
        }
    };

    render(){
        const {cohorts} = this.props;
        return <select onChange={this.onChange}>
            {
                cohorts.map(function(c){
                    return <option key={c}
                                   value={c}>{c}</option>;
                })
            }
        </select>
    }
}
CohortSelector.propTypes = {
    cohorts: PropTypes.array.isRequired,
    onChange: PropTypes.any.isRequired,
};
