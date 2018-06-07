import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";

export class CohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort
        };
    }

    onChange = (event) => {
        this.setState({selectedCohort: event});
        let {onChange} = this.props;
        if (onChange) {
            onChange(event);
        }
    };


    render() {
        return (
            <Dropdown style={{marginLeft:10}} label={'Select Cohort'} value={this.state.selectedCohort} onChange={this.onChange}
                      source={this.props.cohorts.map(c => ( {label:c.name,value:c.name} ))} />
        );
    }
}

CohortSelector.propTypes = {
    cohorts: PropTypes.array.isRequired,
    selectedCohort: PropTypes.string.isRequired,
    onChange: PropTypes.any.isRequired,
};
