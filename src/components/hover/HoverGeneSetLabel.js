import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import {
  interpolateCnvMutationColor,
  interpolateGeneExpression,
} from '../../functions/DrawFunctions'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import {getAffectedPathway, getRatio} from '../../functions/HoverFunctions'
import {getMiddleGeneSetLabelForView} from '../legend/GeneSetGeneExpressionLegend'

export default class HoverGeneSetLabel extends PureComponent {


  render() {
    let {data, cohortIndex, score,view} = this.props
    return (
      <div className={BaseStyle.pathwayChip}>
        <div className={BaseStyle.boxHeader}>Hovering over </div>
        <div className={BaseStyle.geneHoverPathway} style={{width:180}}>
          <strong>Gene Set&nbsp;&nbsp;</strong>
          {data.pathway.golabel.replace(/_/g,' ')}
        </div>
        {!isViewGeneExpression(view) &&
        [
          <div key={'samples'+cohortIndex}>
            <span><strong>Samples Affected</strong><br/> {getRatio(data.expression)}</span>
          </div>
          ,
          <div key={'affected'+cohortIndex}>
            <span><strong>Affected Area</strong><br/> {getAffectedPathway(data)}</span>
          </div>
        ]
        }
        <span
          className={BaseStyle.scoreBoxBlock}
          style={{
            color: 'black',
            backgroundColor: isViewGeneExpression(view) ? interpolateGeneExpression(score) : interpolateCnvMutationColor(score)
          }}
        >
          <strong>
            {/*{ isViewGeneExpression(view) ? getMiddleGeneSetLabelForView(view) : 'chi-square test χ2'}*/}
            { isViewGeneExpression(view) ? getMiddleGeneSetLabelForView(view) : 'χ2 test'}
          </strong>
          <br/>
          {score === 'NaN' ? 'Not available' : score.toFixed(2)}
        </span>
      </div>
    )
  }
}

HoverGeneSetLabel.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
  score: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
