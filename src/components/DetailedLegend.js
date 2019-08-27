import React from 'react';
import PureComponent from './PureComponent';
import BaseStyle from '../css/base.css';

export class DetailedLegend extends PureComponent {

  render() {
    return (
      <div style={{margin: 5,padding: 5,fontFamily:'Arial',fontSize:'small', boxShadow: '1px 1px 1px 1px gray',borderRadius:5}}>
        <span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span>
        <br/>
        <span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong></span>
        <hr/>
        <span className={BaseStyle.mutation4Color}><strong>Deleterious</strong></span>
                &nbsp;
        <span className={BaseStyle.mutation3Color}><strong>Splice</strong></span>
        <br/>
        <span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong></span>
      </div>
    );
  }
}
