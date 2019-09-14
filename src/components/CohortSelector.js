import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox/lib/button';
import FaFilter from 'react-icons/lib/fa/filter';
import {SubCohortSelector} from './SubCohortSelector';
import {
  fetchCohortData, getSubCohortsForCohort,
  getSubCohortsOnlyForCohort,
} from '../functions/CohortFunctions';
import {isEqual} from 'underscore';
import {Tooltip} from 'react-toolbox/lib';
import update from 'immutability-helper';
import {FILTER_ENUM} from './FilterSelector';
import {ButtonGroup} from 'react-bootstrap';
const TooltipButton = Tooltip(Button);



export class CohortSelector extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      selectedCohort: props.selectedCohort,
      showSubCohortSelector: false,
      subCohortLabel: 'All Subtypes',
    };
  }

    handleChange = (event) => {
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
        let splits = s.split('.');
        if(splits.length>0) {
          return splits[1];
        } else {
          return s;
        }
      }).join(', ');
    }

    generateSubCohortLabels(){
      let subCohortsForSelected = getSubCohortsForCohort(this.state.selectedCohort.name);
      // no sub cohorts exist
      if(!subCohortsForSelected) return '';
      let selectedSubCohorts = this.state.selectedCohort.selectedSubCohorts ? this.state.selectedCohort.selectedSubCohorts: Object.keys(subCohortsForSelected);

      const availableSubtypes = Object.keys(subCohortsForSelected).length+1;
      const selectedSubTypes = Object.values(selectedSubCohorts).filter( s => s ).length;
      if(selectedSubCohorts.length===0 || availableSubtypes===selectedSubTypes){
        return `All ${availableSubtypes} Subtypes`;
      }
      return `(${selectedSubTypes}/${availableSubtypes}) Subtypes`;
    }

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

      this.props.onChangeSubCohort(selectionObject);
    };

    handleCohortSelection = () => {
      this.setState({showSubCohortSelector: true});
    };

    hasSubCohorts(){
      let {filterCounts} = this.props ;
      return filterCounts && Object.keys(filterCounts).length>0 && filterCounts[FILTER_ENUM.MUTATION].subCohortCounts && filterCounts[FILTER_ENUM.MUTATION].subCohortCounts.length > 1;
    }

    render() {

      let {filterCounts,filter, swapCohorts,copyCohorts,cohortIndex} = this.props ;
      // let subCohortsForSelected = getSubCohortsForCohort(this.state.selectedCohort.name);
      let subCohortLabel = this.generateSubCohortLabels();
      let subCohortDetails = this.generateSubCohortDetails();
      return (
        <div>
          {this.hasSubCohorts() &&
          <SubCohortSelector
            active={this.state.showSubCohortSelector}
            cohortLabel={subCohortLabel}
            filterCounts={filterCounts[filter]}
            handleSubCohortChange={this.onChangeSubCohort}
            onToggle={this.handleSubCohortToggle}
            selectedCohort={this.state.selectedCohort}
            selectedSubCohorts={this.state.selectedCohort.selectedSubCohorts}
          />
          }
          <div style={{
            marginTop: 10,
            marginLeft: 10,
            marginBottom: 3,
            // fontSize: 'large',
            color: 'gray',
            fontWeight: 'bold',
            display: 'inline',
          }}
          >Cohort {this.props.cohortLabel}
          &nbsp; &nbsp;
          </div>
          <ButtonGroup style={{display: 'inline'}}>
            <Button flat floating icon='swap_vert' mini onClick={() => swapCohorts()}/>
            <Button flat floating icon='file_copy' mini onClick={() => copyCohorts(cohortIndex)}/>
          </ButtonGroup>
          <select
            className={BaseStyle.softflow}
            onChange={this.handleChange}
            style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}
            value={this.state.selectedCohort.name}
          >
            {
              fetchCohortData().map(c => {
                return (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                );
              })
            }
          </select>
          {this.hasSubCohorts() &&
                   <TooltipButton label={subCohortLabel} onClick={this.handleCohortSelection} raised style={{marginLeft:20}} tooltip={subCohortDetails}>
                     <FaFilter/>
                   </TooltipButton>

          }
        </div>
      );
    }
}

CohortSelector.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  cohortLabel: PropTypes.string.isRequired,
  copyCohorts: PropTypes.any.isRequired,
  filter: PropTypes.string.isRequired,
  filterCounts: PropTypes.object.isRequired,
  onChange: PropTypes.any.isRequired,
  onChangeSubCohort: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,
  selectedSubCohorts: PropTypes.any,
  swapCohorts: PropTypes.any.isRequired,
};
