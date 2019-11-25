import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from 'react-toolbox';
import {intersection} from '../functions/MathFunctions';

export class ViewSelector extends PureComponent {

    handleSetSelected = (targetValue) => {
      this.props.onChange(targetValue);
    };

    render() {
      const {allowableViews,pathwayData, view} = this.props;
      const filterCounts = pathwayData.filterCounts;
      if(pathwayData.expression.length === 0){
        return <div>Loading...</div>;
      }
      let labels = Object.keys(filterCounts);
      const views = intersection(labels,allowableViews);
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
  allowableViews: PropTypes.any.isRequired,
  geneList: PropTypes.any.isRequired,
  onChange: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
};
