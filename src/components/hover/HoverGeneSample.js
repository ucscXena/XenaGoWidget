import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import {
  interpolateCnvMutationColor,
  interpolateCnvMutationFont,
  interpolateGeneExpression,
  interpolateGeneExpressionFont
} from '../../functions/DrawFunctions'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import CnvMutationScoreBox from './CnvMutationScoreBox'

export default class HoverGeneSample extends PureComponent {


  render() {
    let {cohortIndex,data, score,view} = this.props
    return (
      <div className={BaseStyle.pathwayChip}>
        <div className={BaseStyle.boxHeader}>Hovering over </div>
        <div className={BaseStyle.geneHoverPathway}>
          <b>Gene</b> {data.pathway.gene[0].replace(/_/g,' ')}
        </div>
        <div className={BaseStyle.geneHoverPathway}>
          <strong>Sample</strong>{data.tissue}
        </div>
        <br/>
        <div
          className={BaseStyle.scoreBox}
          style={{
            color:isViewGeneExpression(view) ? interpolateGeneExpressionFont(score) : interpolateCnvMutationFont(score),
            backgroundColor: isViewGeneExpression(view) ? interpolateGeneExpression(score) : interpolateCnvMutationColor(score)
          }}
        >
          <strong>Score</strong> {score === 'NaN' ? 'Not available' : score.toFixed(2)}
        </div>
        { isViewGeneExpression(view) &&  data.expression && data.geneExpression &&
          <div className={BaseStyle.pathwayChip}>
            <strong>ZScore</strong>
            <div
              className={BaseStyle.scoreBox}
              style={{
                color:interpolateGeneExpressionFont(data.expression.geneExpression),
                backgroundColor:interpolateGeneExpression(data.expression.geneExpression)
              }}
            >
              {data.expression.geneExpression.toPrecision(2)}
            </div>
          </div>
        }
        <br/>
        <br/>
        {!isViewGeneExpression(view) &&
          <CnvMutationScoreBox cohortIndex={cohortIndex} data={data}/>
        }
      </div>
    )
  }
}

HoverGeneSample.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
  score: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
