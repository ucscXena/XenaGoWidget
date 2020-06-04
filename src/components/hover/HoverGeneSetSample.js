import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import {
  interpolateGeneExpression,
} from '../../functions/DrawFunctions'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import CnvMutationScoreBox from './CnvMutationScoreBox'
import {getSampleGeneSetLabelForView} from '../legend/GeneSetGeneExpressionLegend'

export default class HoverGeneSetSample extends PureComponent {


  render() {
    let {data, cohortIndex, score,view} = this.props
    return (
      <div>
        <div className={BaseStyle.pathwayChip}>
          <div className={BaseStyle.boxHeader}>Hovering over</div>
          {data.pathway.source === 'GeneSet' &&
            <span>
              <strong>Gene Set&nbsp;</strong>
              {data.pathway.golabel.replace(/_/g,' ')}
            </span>
          }
          <br/>
          <span><strong>Sample</strong> {data.tissue}</span>
          <br/>
          <div
            className={BaseStyle.scoreBoxBlock}
            style={{
              color: 'black',
              backgroundColor: isViewGeneExpression(view) ? interpolateGeneExpression(score) : 'white'
            }}
          >
            {isViewGeneExpression(view) ? <strong>{getSampleGeneSetLabelForView(view)}</strong> : <strong>Hits in sample</strong>}
            <br/>
            {score ==='NaN' ? 'Not Available' :score.toFixed(2)}
          </div>
          { !isViewGeneExpression(view) &&
          <CnvMutationScoreBox cohortIndex={cohortIndex} data={data}/>
          }
        </div>
      </div>
    )
  }
}

HoverGeneSetSample.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
  score: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
