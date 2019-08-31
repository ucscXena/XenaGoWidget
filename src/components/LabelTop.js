import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {LABEL_A, LABEL_B} from './XenaGeneSetApp';


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
          fill={color} fontFamily='Arial' fontSize={fontSize} fontWeight={bolder} x={x} y={y}
        >
                    Cohort {LABEL_A}
        </text>
        <text
          fill={color} fontFamily='Arial' fontSize={fontSize} fontWeight={bolder} x={x+this.props.width/2} y={y}
        >
                    Cohort {LABEL_B}
        </text>
      </svg>
    );
  }
}

LabelTop.propTypes = {
  width: PropTypes.any.isRequired,
};
