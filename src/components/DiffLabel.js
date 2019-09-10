import React from 'react';
import PropTypes from 'prop-types';
import underscore from 'underscore';
import PureComponent from './PureComponent';
import { scoreData } from '../functions/DataFunctions';

export class DiffLabel extends PureComponent {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return !underscore.isEqual(nextProps, this.props);
  }

  /**
     * Score is from 0 to 1
     * @returns {*}
     */
  style() {
    const {
      labelOffset, left, width, labelHeight, cohortIndex,
    } = this.props;
    const colorString = 'black';

    return {
      position: 'absolute',
      top: labelOffset,
      left,
      height: labelHeight,
      width,
      borderTop: cohortIndex === 0 ? `solid 2px ${colorString}` : '',
      borderBottom: cohortIndex === 1 ? `solid 2px ${colorString}` : '',
      opacity: 0.5,
      cursor: 'crosshair',
    };
  }

  calculateDiamond(width,height,cohortIndex) {
    const diamondWidth = 6 * (width /20) ;
    const diamondHeight = 6 * (width / 20);
    const offset = (width - diamondWidth) / 2.0;
    if(cohortIndex === 0){
      return `${offset} 0,${offset + diamondWidth / 2} ${diamondHeight}, ${offset + diamondWidth} 0`;
    }
    else{
      return `${offset} ${height},${offset + diamondWidth / 2} ${height - diamondHeight}, ${offset + diamondWidth} ${height}`;
    }
  }


  render() {
    const {
      item, geneLength, numSamples, colorSettings,width, cohortIndex, labelHeight
    } = this.props;
    const className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
    const colorDensity = scoreData(item.samplesAffected, numSamples, geneLength) * colorSettings.shadingValue;
    return (
      <svg
        className={className}
        style={this.style(colorDensity)}
      >
        <polygon fill='black' points={this.calculateDiamond(width,labelHeight,cohortIndex)} stroke='black'/>
      </svg>
    );
  }
}

DiffLabel.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  colorSettings: PropTypes.any.isRequired,
  geneLength: PropTypes.any.isRequired,
  item: PropTypes.any.isRequired,
  labelHeight: PropTypes.any.isRequired,
  labelOffset: PropTypes.any.isRequired,
  labelString: PropTypes.string.isRequired,
  left: PropTypes.any.isRequired,
  numSamples: PropTypes.number.isRequired,
  width: PropTypes.any.isRequired,
};
