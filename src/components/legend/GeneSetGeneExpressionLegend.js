import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import PropTypes from 'prop-types'
import {VIEW_ENUM} from '../../data/ViewEnum'
import {GeneSetLegendLabel} from './GeneSetLegendLabel'
import BaseStyle from '../../css/base.css'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'

export function getMiddleGeneSetLabelForView(view){
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return 'Mean BPA Z-score'
  case VIEW_ENUM.PARADIGM:
    return 'Mean GSEA score'
  case VIEW_ENUM.REGULON:
    return 'Mean Regulon activity score'

  default:
    // eslint-disable-next-line no-console
    console.error('do not know how to handle')
  }
  return view
}

export function getSampleGeneSetLabelForView(view){
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return 'Sample BPA Z-score'
  case VIEW_ENUM.PARADIGM:
    return 'Sample GSEA score'
  case VIEW_ENUM.REGULON:
    return 'Sample Regulon activity score'

  default:
    // eslint-disable-next-line no-console
    console.error('do not know how to handle')
  }
  return view
}

export class GeneSetGeneExpressionLegend extends PureComponent {


  render() {

    if(!this.props.maxValue){
      return <tr><td/></tr>
    }

    return (
      <tr className={BaseStyle.geneSetLegend}>
        <td colSpan={1} width={DETAIL_WIDTH}>
          <GeneSetLegendLabel/>
        </td>
        <td colSpan={1} width={LABEL_WIDTH}>
          <div className={BaseStyle.legendTextDiv}>
            {getMiddleGeneSetLabelForView(this.props.filter)}
            <br/>
            <GeneSetLegend
              id='geneExpressionGeneSetLabelScore'
              maxScore={this.props.maxValue}
              minScore={-this.props.maxValue}
            />
          </div>
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}>
          <div className={BaseStyle.legendTextDiv}>
            {getSampleGeneSetLabelForView(this.props.filter)}
            <br/>
            <GeneSetLegend
              id='geneExpressionGeneSetSampleScore'
              maxScore={this.props.maxValue}
              minScore={-this.props.maxValue}
            />
          </div>
        </td>
      </tr>
    )
  }

}

GeneSetGeneExpressionLegend.propTypes = {
  filter: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
}
