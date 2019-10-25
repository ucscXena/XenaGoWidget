import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick} from 'ucsc-xena-client/dist/underscore_ext';
import {Dropdown} from 'react-toolbox';
import mutationVector from '../data/mutationVector';
import {MIN_FILTER} from './XenaGeneSetApp';
import {FILTER_ENUM} from '../functions/FilterFunctions';

function lowerCaseCompare(a, b) {
  // put gene expression at the bottom
  if(a==='Gene Expression') return 1 ;
  if(b==='Gene Expression') return 1 ;
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

export class FilterSelector extends PureComponent {

    handleSetSelected = (targetValue) => {
      this.props.onChange(targetValue);
    };

    getFilters(){
      let filteredMutationVector = pick(mutationVector, v => v >= MIN_FILTER);
      filteredMutationVector[FILTER_ENUM.COPY_NUMBER] = 1;
      return filteredMutationVector;
    }

    render() {
      const {pathwayData, selected} = this.props;
      const filterCounts = pathwayData.filterCounts;
      if(pathwayData.expression.length === 0){
        return <div>Loading...</div>;
      }
      let labels = Object.keys(filterCounts).sort(lowerCaseCompare);
      const labelValues = labels.map(label => {
        if(filterCounts[label].current!==filterCounts[label].available){
          return ({label: label + ' (' + filterCounts[label].current + '/' + filterCounts[label].available+ ')', value: label});
        }
        return ({label: label + ' (' + filterCounts[label].current +')', value: label});
      });
      return (
        <div style={{marginLeft: 10,marginTop:0,height:65}}>
          <Dropdown
            onChange={this.handleSetSelected} source={labelValues} style={{marginTop:0}} value={selected}
          />
        </div>
      );
    }
}

FilterSelector.propTypes = {
  geneList: PropTypes.any.isRequired,
  onChange: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
  selected: PropTypes.any.isRequired,
};
