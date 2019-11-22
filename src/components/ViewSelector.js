import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from 'react-toolbox';
import {VIEW_ENUM} from '../data/ViewEnum';


export class ViewSelector extends PureComponent {

    handleSetSelected = (targetValue) => {
      this.props.onChange(targetValue);
    };

    render() {
      const {pathwayData, selected} = this.props;
      if(pathwayData.expression.length === 0){
        return <div>Loading...</div>;
      }
      const labelValues = Object.values(VIEW_ENUM).map(label => {
        return ({label: label , value: label});
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
