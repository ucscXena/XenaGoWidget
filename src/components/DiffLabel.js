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
    const colorString = cohortIndex === 0 ? 'green' : 'hotpink';

    return {
      position: 'absolute',
      top: labelOffset,
      left,
      height: labelHeight,
      width,
      borderTop: cohortIndex === 0 ? `solid 5px ${colorString}` : '',
      borderBottom: cohortIndex === 1 ? `solid 5px ${colorString}` : '',
      opacity: 0.5,
      cursor: 'crosshair',
    };
  }

  render() {
    const {
      item, geneLength, numSamples, colorSettings,
    } = this.props;
    const className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
    const colorDensity = scoreData(item.samplesAffected, numSamples, geneLength) * colorSettings.shadingValue;
    return (
      <svg
        className={className}
        style={this.style(colorDensity)}
      />
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
