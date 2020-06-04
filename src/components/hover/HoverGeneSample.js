import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import {
  interpolateGeneExpression,
} from '../../functions/DrawFunctions'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import CnvMutationScoreBox from './CnvMutationScoreBox'
import {getSampleGeneLabelForView} from '../legend/GeneGeneExpressionLegend'

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
        {isViewGeneExpression(view) &&
        <div
          className={BaseStyle.scoreBoxBlock}
          style={{
            color:'black',
            backgroundColor: interpolateGeneExpression(score)
          }}
        >
          <strong>{getSampleGeneLabelForView(view)}</strong>
          <br/>
          {score ==='NaN' ? 'Not Available' :score.toFixed(2)}
        </div>
        }
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
