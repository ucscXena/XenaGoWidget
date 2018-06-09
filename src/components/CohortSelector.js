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
        console.log(event.target.value)
        this.setState({selectedCohort: event.target.value});
        let {onChange} = this.props;
        if (onChange) {
            onChange(event);
        }
    };


    render() {
        return (
            <div>
                <h3>Cohort</h3>
                <select style={{marginLeft: 10}}
                        onChange={this.onChange}
                        value={this.state.selectedCohort}
                >
                    {
                        this.props.cohorts.map(c => {
                            return (
                                <option value={c.name} key={c.name}>
                                    {c.name}
                                </option>
                            )
                        })
                    }
                </select>
            </div>
        );
    }
}

CohortSelector.propTypes = {
    cohorts: PropTypes.array.isRequired,
    selectedCohort: PropTypes.string.isRequired,
    onChange: PropTypes.any.isRequired,
};
