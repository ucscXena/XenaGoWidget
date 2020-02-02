import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';

const TEXT_Y_OFFSET = 15;
const IMAGE_HEIGHT = 10 ;
// const IMAGE_WIDTH = 15;

export class GeneSetLegend extends PureComponent {


  render() {

    const formattedMin = this.props.minScore.toFixed(2);
    const formattedMax = this.props.maxScore.toFixed(2);

    return (
      <svg height="20" width="100%">
        <defs>
          <linearGradient id="grad1">
            <stop offset="0%" stopColor="red" />
            <stop offset="50%" stopColor="white" />
            <stop offset="100%" stopColor="blue" />
          </linearGradient>
        </defs>
        <text fontFamily='monospace' height={20} width={20} x={0} y={TEXT_Y_OFFSET}>
          {formattedMax}
        </text>
        <rect fill="url(#grad1)" height={IMAGE_HEIGHT} width={50} x={40} y={5}/>
        <text fontFamily='monospace' height={10} width={300} x={100} y={TEXT_Y_OFFSET}>
          {formattedMin}
        </text>
      </svg>
    );
  }

}

GeneSetLegend.propTypes = {
  maxScore: PropTypes.any.isRequired,
  minScore: PropTypes.any.isRequired,
};
