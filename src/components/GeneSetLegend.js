import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';

export class GeneSetLegend extends PureComponent {

  render() {
    return (
      <svg height="20" width="100%">
        <defs>
          <linearGradient id="grad1">
            <stop offset="0%" stopColor="red" />
            <stop offset="50%" stopColor="white" />
            <stop offset="100%" stopColor="blue" />
          </linearGradient>
        </defs>
        <rect
          fill="url(#grad1)" height={20} width={300} x={0}
          y={0}
        />
      </svg>
    );
  }

}

GeneSetLegend.propTypes = {
  maxScore: PropTypes.any.isRequired,
};
