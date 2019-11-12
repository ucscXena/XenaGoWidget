import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from 'react-toolbox';

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
      const {pathwayData, selected} = this.props;
      const viewCounts = pathwayData.viewCounts;
      if(pathwayData.expression.length === 0){
        return <div>Loading...</div>;
      }
      let labels = Object.keys(viewCounts).sort(lowerCaseCompare);
      const labelValues = labels.map(label => {
        if(viewCounts[label].current!==viewCounts[label].available){
          return ({label: label + ' (' + viewCounts[label].current + '/' + viewCounts[label].available+ ')', value: label});
        }
        return ({label: label + ' (' + viewCounts[label].current +')', value: label});
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

ViewSelector.propTypes = {
  geneList: PropTypes.any.isRequired,
  onChange: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
  selected: PropTypes.any.isRequired,
};
