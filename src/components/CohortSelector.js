import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../../src/base.css';


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
            onChange(event.target.value);
        }
    };


    render() {
        return (
            <div>
                <div style={{marginTop:10,marginLeft:10,marginBottom:3,fontSize:"large",color:"gray",fontWeight:"bold"}}>Select Cohort {this.props.cohortLabel}</div>
                <select style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}
                        onChange={this.onChange}
                        value={this.state.selectedCohort}
                        className={BaseStyle.softflow}
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
    cohortLabel: PropTypes.string.isRequired,
    selectedCohort: PropTypes.string.isRequired,
    onChange: PropTypes.any.isRequired,
};
