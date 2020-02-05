import React from 'react';
import PureComponent from './PureComponent';
import BaseStyle from '../css/base.css';
import {CardText, Card} from 'react-toolbox';

export class CnvMutationLegend extends PureComponent {

  render() {
    return (
      <Card>
        <CardText>
          <table width='100%'>
            <tbody>
              <tr>
                <td>
                  <span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span>
                  &nbsp;
                  <span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong></span>
                </td>
                <td style={{borderLeft:'2px solid'}}/>
                <td>
                  <span className={BaseStyle.mutation4Color}><strong>Deleterious</strong></span>
                  &nbsp;
                  <span className={BaseStyle.mutation3Color}><strong>Splice</strong></span>
                  &nbsp;
                  <span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong></span>
                </td>
              </tr>
            </tbody>
          </table>
        </CardText>
      </Card>
    );
  }
}
