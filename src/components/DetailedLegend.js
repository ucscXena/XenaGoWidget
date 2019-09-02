import React from 'react';
import PureComponent from './PureComponent';
import BaseStyle from '../css/base.css';
import {CardText, Card} from 'react-toolbox';

export class DetailedLegend extends PureComponent {

  render() {
    return (
      <Card>
        <CardText>
          <div style={{marginBottom: 5,fontSize: 'large',fontWeight:'bolder'}}>Legend</div>
          <span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span>
          <br/>
          <span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong></span>
          <hr/>
          <span className={BaseStyle.mutation4Color}><strong>Deleterious</strong></span>
          &nbsp;
          <span className={BaseStyle.mutation3Color}><strong>Splice</strong></span>
          <br/>
          <span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong></span>
        </CardText>
      </Card>
    );
  }
}
