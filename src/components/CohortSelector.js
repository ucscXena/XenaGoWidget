import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox/lib/button';
import FaFilter from 'react-icons/lib/fa/filter';
import {SubCohortSelector} from './SubCohortSelector';
import {
  fetchCohortData, getLabelForIndex, getSubCohortsForCohort,
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
      this.props.onChange(event.target.value);
    };

    handleSubCohortToggle = () => {
      this.setState({showSubCohortSelector: !this.state.showSubCohortSelector});
    };


    generateSubCohortDetails(){
      let selectedSubCohorts = this.props.selectedCohort.selectedSubCohorts;
      let subCohortsForSelected = getSubCohortsOnlyForCohort(this.props.selectedCohort.name);
      if(subCohortsForSelected === undefined) return '';
      return Object.values(selectedSubCohorts).map( s => {
        let splits = s.split('.');
        if(splits.length>1) {
          return splits[1];
        }
        else {
          return splits[0];
        }
      }).join(', ');
    }

    generateSubCohortLabels(){
      let subCohortsForSelected = getSubCohortsForCohort(this.props.selectedCohort.name);
      // no sub cohorts exist
      if(!subCohortsForSelected) return '';
      let selectedSubCohorts = this.props.selectedCohort.selectedSubCohorts ? this.props.selectedCohort.selectedSubCohorts: Object.keys(subCohortsForSelected);

      const availableSubtypes = Object.keys(subCohortsForSelected).length+1;
      const selectedSubTypes = Object.values(selectedSubCohorts).filter( s => s ).length;
      if(selectedSubCohorts.length===0 || availableSubtypes===selectedSubTypes){
        return `All ${availableSubtypes} Subtypes`;
      }
      return `(${selectedSubTypes}/${availableSubtypes}) Subtypes`;
    }

    onChangeSubCohort = (newSelected) => {
      const changes = !isEqual(this.props.selectedSubCohorts,newSelected);
      this.setState({showSubCohortSelector:false});
      if(!changes){
        return ;
      }

      let selectionObject = update(this.state.selectedCohort,{
        selectedSubCohorts: { $set: newSelected },
      });
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

      let {filterCounts,filter, swapCohorts,copyCohorts,cohortIndex,onVersusAll} = this.props ;
      // let subCohortsForSelected = getSubCohortsForCohort(this.state.selectedCohort.name);
      let subCohortLabel = this.generateSubCohortLabels();
      let subCohortDetails = this.generateSubCohortDetails();
      return (
        <div>
          {this.hasSubCohorts() &&
          <SubCohortSelector
            active={this.state.showSubCohortSelector}
            cohortIndex={cohortIndex}
            filterCounts={filterCounts[filter]}
            handleSubCohortChange={this.onChangeSubCohort}
            onSelectVsAll={onVersusAll}
            onToggle={this.handleSubCohortToggle}
            selectedCohort={this.props.selectedCohort}
            selectedSubCohorts={this.props.selectedCohort.selectedSubCohorts}
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
          >Cohort {getLabelForIndex(cohortIndex)}
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
            value={this.props.selectedCohort.name}
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
  copyCohorts: PropTypes.any.isRequired,
  filter: PropTypes.string.isRequired,
  filterCounts: PropTypes.object.isRequired,
  onChange: PropTypes.any.isRequired,
  onChangeSubCohort: PropTypes.any.isRequired,
  onVersusAll: PropTypes.func.isRequired,
  selectedCohort: PropTypes.any.isRequired,
  selectedSubCohorts: PropTypes.any,
  swapCohorts: PropTypes.any.isRequired,
};
