import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import {VIEW_ENUM} from '../../data/ViewEnum'
import PropTypes from 'prop-types'
import {GeneLegendLabel} from './GeneLegendLabel'
import BaseStyle from '../../css/base.css'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'

export function getMiddleGeneLabelForView(view){
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return 'Mean gene exp Z-Score'
  case VIEW_ENUM.PARADIGM:
    return 'Mean Paradigm IPL Z-Score'
  case VIEW_ENUM.REGULON:
    return 'Mean gene exp Z-Score'

  default:
    // eslint-disable-next-line no-console
    console.error('do not know how to handle')
  }
  return view
}

export function getSampleGeneLabelForView(view){
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return 'Sample gene exp Z-Score'
  case VIEW_ENUM.PARADIGM:
    return 'Sample Paradigm IPL Z-Score'
  case VIEW_ENUM.REGULON:
    return 'Sample gene exp Z-Score'

  default:
    // eslint-disable-next-line no-console
    console.error('do not know how to handle')
  }
  return view
}

export class GeneGeneExpressionLegend extends PureComponent {

  render() {
    return (
      // <tr style={{height: 50, fixed: 'position'}} >
      <tr className={BaseStyle.geneSetLegend} >
        <td colSpan={1} width={DETAIL_WIDTH}>
          <GeneLegendLabel/>
        </td>
        <td colSpan={1} width={LABEL_WIDTH}>
          <div className={BaseStyle.legendTextDiv}>
            {getMiddleGeneLabelForView(this.props.filter)}
            <br/>
            <GeneSetLegend
              id='geneExpressionGeneScore'
              maxScore={2}
              minScore={-2}
            />
          </div>
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}>
          <div className={BaseStyle.legendTextDiv}>
            {getSampleGeneLabelForView(this.props.filter)}
            <br/>
            <GeneSetLegend
              id='geneExpressionGeneSampleScore'
              // label={this.props.filter + ' score'}
              maxScore={2}
              minScore={-2}
            />
          </div>
        </td>
      </tr>
    )
  }
}
GeneGeneExpressionLegend.propTypes = {
  filter: PropTypes.any.isRequired,
  // maxValue: PropTypes.any.isRequired,
}
