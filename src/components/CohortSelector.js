import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox/lib/button';
import FaFilter from 'react-icons/lib/fa/filter';
import {SubCohortSelector} from "./SubCohortSelector";
import { getSubCohortsOnlyForCohort } from "../functions/CohortFunctions";
import {isEqual} from 'underscore';


export class CohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort,
            selectedSubCohorts: props.selectedSubCohorts ? props.selectedSubCohorts : getSubCohortsOnlyForCohort(props.selectedCohort),
            showSubCohortSelector: false,
            subCohortLabel: 'All Subtypes',
        };
    }

    onChange = (event) => {
        // populate selected sub cohorts for the cohorts
        let subCohortsForSelected = getSubCohortsOnlyForCohort(event.target.value);
        this.setState( {
                selectedCohort: event.target.value,
                selectedSubCohorts:subCohortsForSelected,
        }
            );
        this.props.onChange(event.target.value);
    };

    handleSubCohortToggle = () => {
        this.setState({showSubCohortSelector: !this.state.showSubCohortSelector});
    };



    generateSubCohortLabels(){
        let selectedSubCohorts = this.state.selectedSubCohorts;
        let subCohortsForSelected = getSubCohortsOnlyForCohort(this.state.selectedCohort);
        if(!subCohortsForSelected) return '';
        const availableSubtypes = Object.keys(subCohortsForSelected).length;
        const selectedSubTypes = Object.values(selectedSubCohorts).filter( s => s ).length;
        if(selectedSubCohorts.length===0 || availableSubtypes===selectedSubTypes){
            return `All ${availableSubtypes} Subtypes`;
        }
        return `(${selectedSubTypes}/${availableSubtypes}) Subtypes`;
    };

    onChangeSubCohort = (newSelected) => {
        const changes = !isEqual(this.state.selectedSubCohorts,newSelected);
        console.log(this.state.selectedSubCohorts,newSelected,changes);

        this.setState({showSubCohortSelector:false});
        if(!changes){
            return ;
        }

        this.setState(
        {
                selectedSubCohorts: newSelected,
            }
        );


        let selectionObject = {
            selected:this.state.selectedCohort,
            selectedSubCohorts:newSelected,
        };
        this.props.onChangeSubCohort(selectionObject)
    };

    selectCohortSelection = () => {
        this.setState({showSubCohortSelector: true});
    };

    render() {

        let {cohorts,cohortLabel} = this.props ;
        let subCohortsForSelected = getSubCohortsOnlyForCohort(this.state.selectedCohort);
        let subCohortLabel = this.generateSubCohortLabels();

        return (
            <div>
                <SubCohortSelector active={this.state.showSubCohortSelector}
                                   handleToggle={this.handleSubCohortToggle}
                                   handleSubCohortChange={this.onChangeSubCohort}
                                   selectedCohort={this.state.selectedCohort}
                                   selectedSubCohorts={this.state.selectedSubCohorts}
                                   subCohortsForSelected={subCohortsForSelected}
                                   cohortLabel={subCohortLabel}
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
                {subCohortsForSelected.length>0 &&
                   <Button style={{marginLeft:20}} raised onClick={this.selectCohortSelection} label={subCohortLabel}>
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
    selectedSubCohorts: PropTypes.any,
    onChange: PropTypes.any.isRequired,
    onChangeSubCohort: PropTypes.any.isRequired,
};
