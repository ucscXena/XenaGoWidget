import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import {GeneSetLegend} from './GeneSetLegend'


export class GeneGeneExpressionLegend extends PureComponent {

  render() {
    return (
      <tr style={{height: 50}} >
        <td colSpan={1}>
          <div className={BaseStyle.verticalLegendBox}>
            Gene
          </div>
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Middle</span>
          <pre style={{marginLeft: 10,display:'inline'}}>Mean ZScore</pre>
          <br/>
          <GeneSetLegend
            id='geneExpressionGeneScore'
            maxScore={2}
            minScore={-2}
          />
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Sample</span>
          <pre style={{marginLeft: 10,display:'inline'}}>ZScore</pre>
          <br/>
          <GeneSetLegend
            id='geneExpressionGeneSampleScore'
            // label={this.props.filter + ' score'}
            maxScore={2}
            minScore={-2}
          />

        </td>
      </tr>
    )
  }
}
