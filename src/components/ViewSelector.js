import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from 'react-toolbox';
import {getViewsForCohort} from '../functions/CohortFunctions';
import {intersection} from '../functions/MathFunctions';

function lowerCaseCompare(a, b) {
  // put gene expression at the bottom
  if(a==='Gene Expression') return 1 ;
  if(b==='Gene Expression') return 1 ;
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

export class ViewSelector extends PureComponent {

    handleSetSelected = (targetValue) => {
      this.props.onChange(targetValue);
    };

    render() {
      const {pathwayData, view} = this.props;
      const filterCounts = pathwayData.filterCounts;
      if(pathwayData.expression.length === 0){
        return <div>Loading...</div>;
      }
      let labels = Object.keys(filterCounts).sort(lowerCaseCompare);
      const views = intersection(getViewsForCohort(pathwayData.selectedCohort.name),labels);
      const labelValues = views.map(label => {
        if(filterCounts[label].current!==filterCounts[label].available){
          return ({label: label + ' (' + filterCounts[label].current + '/' + filterCounts[label].available+ ')', value: label});
        }
        return ({label: label + ' (' + filterCounts[label].current +')', value: label});
      });
      return (
        <div style={{marginLeft: 10,marginTop:0,height:65}}>
          <Dropdown
            onChange={this.handleSetSelected} source={labelValues} style={{marginTop:0}} value={view}
          />
        </div>
      );
    }
}

ViewSelector.propTypes = {
  geneList: PropTypes.any.isRequired,
  onChange: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
};
