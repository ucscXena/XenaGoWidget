import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';

export class CohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort
        };
    }

    onChange = (event) => {
        this.setState({selectedCohort: event.target.value});
        let {onChange} = this.props;
        if (onChange) {
            console.log('on change method: ' + event.target.value)
            onChange(event.target.value);
        }
    };


    render() {
        const {cohorts} = this.props;
        return <select value={this.state.selectedCohort} onChange={this.onChange}>
            {
                cohorts.map(function (c) {
                    return <option key={c.name}
                                   value={c.name}>{c.name}</option>;
                })
            }
        </select>
    }
}

CohortSelector.propTypes = {
    cohorts: PropTypes.array.isRequired,
    selectedCohort: PropTypes.string.isRequired,
    onChange: PropTypes.any.isRequired,
};
