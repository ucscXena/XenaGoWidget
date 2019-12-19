import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {getLabelForIndex} from '../functions/CohortFunctions';

export class LabelTop extends PureComponent {

  render() {
    let fontSize = 15 ;
    let y = 12;
    let x = 7;
    let color = 'gray';
    let bolder = 'bolder';
    return (
      <svg style={{height: 15,marginLeft: 10,width:this.props.width}}>
        <text
          fill={color} fontFamily='Arial' fontSize={fontSize} fontWeight={bolder} textDecoration='underline' x={x} y={y}
        >
                    Cohort {getLabelForIndex(0)}
        </text>
        <text
          fill={color} fontFamily='Arial' fontSize={fontSize} fontWeight={bolder} textDecoration='underline' x={x+this.props.width/2} y={y}
        >
          Cohort {getLabelForIndex(1)}
        </text>
      </svg>
    );
  }
}

LabelTop.propTypes = {
  width: PropTypes.any.isRequired,
};
