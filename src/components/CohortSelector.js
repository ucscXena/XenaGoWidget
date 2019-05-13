import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
import subCohorts from '../data/Subtype_Selected';
import {Button} from 'react-toolbox/lib/button';
import FaFilter from 'react-icons/lib/fa/filter';
import {SubCohortSelector} from "./SubCohortSelector";


export class CohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort,
            selectedSubCohort: props.selectedSubCohort,
            showSubCohortSelector: false,
        };
    }

    onChange = (event) => {
        this.setState({selectedCohort: event.target.value});
        let {onChange} = this.props;
        if (onChange) {
            onChange(event.target.value);
        }
    };

    handleSubCohortToggle = (event) => {
        this.setState({showSubCohortSelector: !this.state.showSubCohortSelector});

    };

    onChangeSubCohort = (event) => {
        this.setState({selectedSubCohort: event.target.value});
    };

    selectCohortSelection = () => {
        this.setState({showSubCohortSelector: true});
    };

    render() {

        let subCohortsForSelected = subCohorts[this.state.selectedCohort];
        let {cohorts,cohortLabel} = this.props ;
        return (
            <div>
                <SubCohortSelector active={this.state.showSubCohortSelector}
                                   handleToggle={this.handleSubCohortToggle}
                                   handleSubCohortChange={this.onChangeSubCohort}
                                   selectedCohort={this.state.selectedCohort}
                                   selectedSubCohort={this.state.selectedSubCohort}
                                   cohortLabel={this.props.cohortLabel}
                />
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
                   <Button style={{marginLeft:20}} raised onClick={this.selectCohortSelection} label='All Subtypes'>
                       <FaFilter/>
                   </Button>

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
