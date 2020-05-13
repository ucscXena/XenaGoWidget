import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import {VIEW_ENUM} from '../../data/ViewEnum'

export function getMiddleGeneSetLabelForView(view){
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return 'Sample BPA score'
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

export function getSampleGeneSetLabelForView(view){
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return 'Sample BPA score'
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

    return (
      <tr>
        <td colSpan={1}>
          <div className={BaseStyle.verticalLegendBox}>
            Geneset
          </div>
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Middle</span>
          <pre style={{marginLeft: 10,display:'inline'}}>{getMiddleGeneSetLabelForView(this.props.filter)} </pre>
          <br/>
          <GeneSetLegend
            id='geneExpressionGeneSetLabelScore'
            // label={this.props.filter + ' score'}
            maxScore={this.props.maxValue}
            minScore={-this.props.maxValue}
          />
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Sample</span>
          <pre style={{marginLeft: 10,display:'inline'}}>{getSampleGeneSetLabelForView(this.props.filter)}</pre>
          <br/>
          <GeneSetLegend
            id='geneExpressionGeneSetSampleScore'
            // label={this.props.filter + ' score'}
            maxScore={this.props.maxValue}
            minScore={-this.props.maxValue}
          />

        </td>
      </tr>
    )
  }

}

GeneSetGeneExpressionLegend.propTypes = {
  filter: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
}
