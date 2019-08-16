import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox/lib/button';
import FaFilter from 'react-icons/lib/fa/filter';
import {SubCohortSelector} from "./SubCohortSelector";
import { getSubCohortsOnlyForCohort } from "../functions/CohortFunctions";
import {isEqual} from 'underscore';
import {Tooltip} from "react-toolbox/lib";
import {COHORT_DATA} from "./XenaGeneSetApp";
import update from "immutability-helper";
const TooltipButton = Tooltip(Button);



export class CohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort,
            // selectedSubCohorts: props.selectedSubCohorts ? props.selectedSubCohorts : getSubCohortsOnlyForCohort(props.selectedCohort.name),
            showSubCohortSelector: false,
            subCohortLabel: 'All Subtypes',
        };
    }

    onChange = (event) => {
        // populate selected sub cohorts for the cohorts
        let subCohortsForSelected = getSubCohortsOnlyForCohort(event.target.value);
        this.setState( {
                selectedCohort: {
                    name: event.target.value,
                    subCohorts : subCohortsForSelected,
                    selectedSubCohorts:subCohortsForSelected,
                },
        }
            );
        this.props.onChange(event.target.value);
    };

    handleSubCohortToggle = () => {
        this.setState({showSubCohortSelector: !this.state.showSubCohortSelector});
    };


    generateSubCohortDetails(){
        let selectedSubCohorts = this.state.selectedCohort.selectedSubCohorts;
        let subCohortsForSelected = getSubCohortsOnlyForCohort(this.state.selectedCohort.name);
        if(subCohortsForSelected === undefined) return '';
        return Object.values(selectedSubCohorts).map( s => {
            let splits = s.split(".");
            if(splits.length>0) {
                return splits[1];
            } else {
                return s;
            }
        }).join(", ");
    };

    generateSubCohortLabels(){
        let subCohortsForSelected = getSubCohortsOnlyForCohort(this.state.selectedCohort.name);
        // no sub cohorts exist
        if(!subCohortsForSelected) return '';
        let selectedSubCohorts = this.state.selectedCohort.selectedSubCohorts ? this.state.selectedCohort.selectedSubCohorts: subCohortsForSelected;

        const availableSubtypes = Object.keys(subCohortsForSelected).length;
        const selectedSubTypes = Object.values(selectedSubCohorts).filter( s => s ).length;
        if(selectedSubCohorts.length===0 || availableSubtypes===selectedSubTypes){
            return `All ${availableSubtypes} Subtypes`;
        }
        return `(${selectedSubTypes}/${availableSubtypes}) Subtypes`;
    };

    onChangeSubCohort = (newSelected) => {
        const changes = !isEqual(this.state.selectedSubCohorts,newSelected);
        this.setState({showSubCohortSelector:false});
        if(!changes){
            return ;
        }

        let selectionObject = update(this.state.selectedCohort,{
            selectedSubCohorts: { $set: newSelected },
        });

        this.setState(
        {
                selectedCohort: selectionObject,
            }
        );


        // let {selectedCohort} = this.state ;
        // let selectionObject = {
        //     selectedCohort,
        //     selectedSubCohorts:newSelected,
        // };
        this.props.onChangeSubCohort(selectionObject)
    };

    selectCohortSelection = () => {
        this.setState({showSubCohortSelector: true});
    };

    render() {

        let subCohortsForSelected = getSubCohortsOnlyForCohort(this.state.selectedCohort.name);
        let subCohortLabel = this.generateSubCohortLabels();
        let subCohortDetails = this.generateSubCohortDetails();
        return (
            <div>
                <SubCohortSelector active={this.state.showSubCohortSelector}
                                   handleToggle={this.handleSubCohortToggle}
                                   handleSubCohortChange={this.onChangeSubCohort}
                                   selectedCohort={this.state.selectedCohort}
                                   selectedSubCohorts={this.state.selectedCohort.selectedSubCohorts}
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
                }}>Select Cohort {this.props.cohortLabel}</div>
                <select style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}
                        onChange={this.onChange}
                        value={this.state.selectedCohort.name}
                        className={BaseStyle.softflow}
                >
                    {
                        COHORT_DATA.map(c => {
                            return (
                                <option value={c.name} key={c.name}>
                                    {c.name}
                                </option>
                            )
                        })
                    }
                </select>
                {subCohortsForSelected.length>0 &&
                   <TooltipButton tooltip={subCohortDetails} style={{marginLeft:20}} raised onClick={this.selectCohortSelection} label={subCohortLabel}>
                       <FaFilter/>
                   </TooltipButton>

                }
            </div>
        );
    }
}

CohortSelector.propTypes = {
    cohortLabel: PropTypes.string.isRequired,
    selectedCohort: PropTypes.any.isRequired,
    selectedSubCohorts: PropTypes.any,
    onChange: PropTypes.any.isRequired,
    onChangeSubCohort: PropTypes.any.isRequired,
};
