import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import {VIEW_ENUM} from '../../data/ViewEnum'
import PropTypes from 'prop-types'
import {GeneLegendLabel} from './GeneLegendLabel'

export function getMiddleGeneLabelForView(view){
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return 'Mean gene exp Z-Score'
  case VIEW_ENUM.PARADIGM:
    return 'Mean PARADIGM IPL Z-Score'
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
    return 'Sample PARADIGM IPL Z-Score'
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
      <tr style={{height: 50}} >
        <td colSpan={1}>
          <GeneLegendLabel/>
        </td>
        <td colSpan={1} style={{borderLeftWidth:1,borderLeft:'1 px solid black'}}>
          {/*<span className={BaseStyle.legendLabel}>Middle</span>*/}
          <pre style={{marginLeft: 0,display:'inline'}}>{getMiddleGeneLabelForView(this.props.filter)}</pre>
          <br/>
          <GeneSetLegend
            id='geneExpressionGeneScore'
            maxScore={2}
            minScore={-2}
          />
        </td>
        <td colSpan={1}>
          {/*<span className={BaseStyle.legendLabel}>Sample</span>*/}
          <pre style={{marginLeft: 0,display:'inline'}}>{getSampleGeneLabelForView(this.props.filter)}</pre>
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
GeneGeneExpressionLegend.propTypes = {
  filter: PropTypes.any.isRequired,
  // maxValue: PropTypes.any.isRequired,
}
