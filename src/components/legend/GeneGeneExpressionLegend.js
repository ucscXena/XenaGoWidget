import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import {GeneSetLegend} from './GeneSetLegend'


export class GeneGeneExpressionLegend extends PureComponent {

  render() {
    return (
      <tr style={{height: 40}} >
        <td colSpan={1}>
          <div className={BaseStyle.verticalLegendBox}>
            Gene Legend
          </div>
        </td>
        <td colSpan={3}>
          <GeneSetLegend
            id='geneExpressionGeneScore'
            label={'Gene expression z-score'} maxScore={2}
            minScore={-2}
          />
        </td>
      </tr>
    )
  }
}
