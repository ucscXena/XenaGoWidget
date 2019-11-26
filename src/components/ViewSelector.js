import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from 'react-toolbox';

export class ViewSelector extends PureComponent {

    handleSetSelected = (targetValue) => {
      this.props.onChange(targetValue);
    };

    render() {
      const {allowableViews,view} = this.props;
      const labelValues = allowableViews.map(label => {
        return ({label: label , value: label});
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
  view: PropTypes.any.isRequired,
};
