import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
import subCohorts from '../data/Subtype_Selected';


export class CohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort,
            // selectedSubCohort: props.selectedSubCohort,
            // selectedSubSamples: props.selectedSubCohort
        };
    }

    onChange = (event) => {
        this.setState({selectedCohort: event.target.value});
        let {onChange} = this.props;
        if (onChange) {
            onChange(event.target.value);
        }
    };

    onChangeSubCohort = (event) => {
        this.setState({selectedSubCohort: event.target.value});
        this.props.onChangeSubCohort(event.target.value);
    };

    render() {

        let subCohortsForSelected = subCohorts[this.state.selectedCohort];
        console.log('seelected sub cohorts',subCohortsForSelected);
        console.log('seelected sub cohorts state',this.state.selectedSubCohort);
        let {cohorts,cohortLabel} = this.props ;
        return (
            <div>
                <div style={{
                    marginTop: 10,
                    marginLeft: 10,
                    marginBottom: 3,
                    fontSize: "large",
                    color: "gray",
                    fontWeight: "bold"
                }}>Select Cohort {cohortLabel}</div>
                <select style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}
                        onChange={this.onChange}
                        value={this.state.selectedCohort}
                        className={BaseStyle.softflow}
                >
                    {
                        cohorts.map(c => {
                            return (
                                <option value={c.name} key={c.name}>
                                    {c.name}
                                </option>
                            )
                        })
                    }
                </select>
                {subCohortsForSelected &&
                <select style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}
                        onChange={this.onChangeSubCohort}
                        value={this.state.selectedSubCohort}
                        className={BaseStyle.softflow}
                >
                    <option>All</option>
                    {
                        Object.entries(subCohortsForSelected).map(c => {
                                return (
                                    <option value={c[0]} key={c[0]}>
                                        {c[0]}
                                    </option>
                                )
                            }
                        )
                    }
                </select>
                }
            </div>
        );
    }
}

CohortSelector.propTypes = {
    cohorts: PropTypes.array.isRequired,
    subCohorts: PropTypes.array.isRequired,
    cohortLabel: PropTypes.string.isRequired,
    selectedCohort: PropTypes.string.isRequired,
    selectedSubCohort: PropTypes.string,
    onChange: PropTypes.any.isRequired,
    onChangeSubCohort: PropTypes.any.isRequired,
};
