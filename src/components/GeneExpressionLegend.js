import React from 'react';
import PureComponent from './PureComponent';
import BaseStyle from '../css/base.css';
import {CardText, Card} from 'react-toolbox';

export class GeneExpressionLegend extends PureComponent {

  render() {
    return (
      <Card>
        <CardText>
          <div style={{marginBottom: 5,fontSize: 'large',fontWeight:'bolder'}}>Legend</div>
          <span className={BaseStyle.cnvHighColor}><strong>Over Expressed</strong></span>
          <br/>
          <span className={BaseStyle.cnvLowColor}><strong>Under Expressed</strong></span>
        </CardText>
      </Card>
    );
  }
}
