import PureComponent from './PureComponent';
import React from 'react';
import BaseStyle from "../css/base.css";

export default class VerticalLegend extends PureComponent {

  render() {
    return (
      <div style={{margin: 5,padding: 5,fontFamily:'Arial',fontSize:'small', boxShadow: '1px 1px 1px 1px gray',borderRadius:5}}>
        <span className={BaseStyle.overRepresentedColor}><strong>Over Represented</strong></span>
        <br/>
        <span className={BaseStyle.neutralColor}><strong>Occurs as Expected</strong></span>
        <br/>
        <span className={BaseStyle.underRepresentedColor}><strong>Under Represented</strong></span>
      </div>
    )
  }
}
