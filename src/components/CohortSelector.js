import React, {Component} from 'react'
import PropTypes from 'prop-types';

export class CohortSelector extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort
        };

    }

    onChange = (event) => {
        let {onChange} = this.props;
        console.log('changing: '+onChange);
        if (onChange) {
            console.log('on change method: '+event.target.value)
            onChange(event.target.value);
        }
    };

    // onChange() {
    //     console.log('asdfadsf')
    // }

    render() {
        const {cohorts} = this.props;
        return <select value={this.state.selectedCohort} onChange={this.onChange}>
            {
                cohorts.map(function (c) {
                    return <option key={c}
                                   value={c}>{c}</option>;
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
