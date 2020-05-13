import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import {MAX_CNV_MUTATION_DIFF} from '../XenaGeneSetApp'


export class GeneSetCnvMutationLegend extends PureComponent {


  render() {

    return (
      <tr>
        <td colSpan={4}>
          {/*<div className={BaseStyle.verticalLegendBox}>*/}
          Geneset
          {/*</div>*/}
          {/*</td>*/}
          {/*<td colSpan={1}>*/}
          Label
          <GeneSetLegend
            id='mean-score' label={'chi-square test χ2'}
            maxScore={MAX_CNV_MUTATION_DIFF} minScore={-MAX_CNV_MUTATION_DIFF}
            precision={0}
          />
          Sample
          <GeneSetLegend
            id='geneSampleLegendMutationCnv' label={'hits per sample'} maxColor='red'
            maxScore={'5+'} midColor='pink'
            minColor='white' minScore={0} precision={0}
          />

        </td>
      </tr>
    )
  }

}

GeneSetCnvMutationLegend.propTypes = {
}
