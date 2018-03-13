import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';

export class CohortSelector extends PureComponent {

    constructor(props){
        super(props)
    }

    render(){
        const {cohorts} = this.props;
        return <select>
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
};
