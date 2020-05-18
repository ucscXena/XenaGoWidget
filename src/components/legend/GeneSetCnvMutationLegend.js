import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import {MAX_CNV_MUTATION_DIFF} from '../XenaGeneSetApp'
import {
  CNV_MUTATION_GENE_SET_COLOR_MAX,
  CNV_MUTATION_GENE_SET_COLOR_MID,
  RGBToHex
} from '../../functions/ColorFunctions'
import {GeneSetLegendLabel} from './GeneSetLegendLabel'


export class GeneSetCnvMutationLegend extends PureComponent {


  render() {

    return (
      <tr>
        <td colSpan={1} >
          <GeneSetLegendLabel/>
        </td>
        <td colSpan={1}>
          <pre style={{marginLeft: 0,display:'inline'}}>chi-square test χ2</pre>
          <GeneSetLegend
            id='mean-score'
            maxScore={MAX_CNV_MUTATION_DIFF} minScore={-MAX_CNV_MUTATION_DIFF}
            precision={0}
          />
        </td>
        <td colSpan={1}>
          <pre style={{marginLeft: 0,display:'inline'}}>Hits per sample</pre>
          <GeneSetLegend
            id='geneSampleLegendMutationCnv'
            maxColor={RGBToHex(CNV_MUTATION_GENE_SET_COLOR_MAX)}
            maxScore={'5+'} midColor={RGBToHex(CNV_MUTATION_GENE_SET_COLOR_MID)}
            minColor='white' minScore={0} precision={0}
          />

        </td>
      </tr>
    )
  }

}

GeneSetCnvMutationLegend.propTypes = {
}
