import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {Chip} from 'react-toolbox'
import BaseStyle from '../../css/base.css'
import {ScoreBadge} from '../ScoreBadge'
import {
  interpolateGeneExpression,
  interpolateGeneExpressionFont
} from '../../functions/DrawFunctions'
import {isViewGeneExpression} from '../../functions/DataFunctions'

export default class HoverGeneSetSample extends PureComponent {


  render() {
    let {data, cohortIndex, score,view} = this.props
    return (
      <div>
        <div
          className={BaseStyle.pathwayChip}
        >
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
          <br/>
          <span
            className={BaseStyle.scoreBox}
            style={{
              color:isViewGeneExpression(view) ? interpolateGeneExpressionFont(score) : 'black',
              backgroundColor: isViewGeneExpression(view) ? interpolateGeneExpression(score) : 'white'
            }}
          >
            <strong>Score</strong> {score ==='NaN' ? 'Not Available' :score.toFixed(2)}</span>
          {!isViewGeneExpression(view) && cohortIndex ===0 && data.pathway.firstSampleCnvHigh > 0 &&
            <Chip><span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong><ScoreBadge score={data.pathway.firstSampleCnvHigh}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===0 && data.pathway.firstSampleCnvLow > 0 &&
            <Chip><span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong><ScoreBadge score={data.pathway.firstSampleCnvLow}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===0 && data.pathway.firstSampleMutation2 > 0 &&
            <Chip><span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong><ScoreBadge score={data.pathway.firstSampleMutation2}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===0 && data.pathway.firstSampleMutation3 > 0 &&
            <Chip><span className={BaseStyle.mutation3Color}><strong>Splice</strong><ScoreBadge score={data.pathway.firstSampleMutation3}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===0 && data.pathway.firstSampleMutation4 > 0 &&
            <Chip><span className={BaseStyle.mutation4Color}><strong>Deleterious</strong><ScoreBadge score={data.pathway.firstSampleMutation4}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===1 && data.pathway.secondSampleCnvHigh > 0 &&
            <Chip><span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong><ScoreBadge score={data.pathway.secondSampleCnvHigh}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===1 && data.pathway.secondSampleCnvLow > 0 &&
            <Chip><span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong><ScoreBadge score={data.pathway.secondSampleCnvLow}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===1 && data.pathway.secondSampleMutation2 > 0 &&
            <Chip><span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong><ScoreBadge score={data.pathway.secondSampleMutation2}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===1 && data.pathway.secondSampleMutation3 > 0 &&
            <Chip><span className={BaseStyle.mutation3Color}><strong>Splice</strong><ScoreBadge score={data.pathway.secondSampleMutation3}/></span></Chip>
          }
          {!isViewGeneExpression(view) && cohortIndex ===1 && data.pathway.secondSampleMutation4 > 0 &&
            <Chip><span className={BaseStyle.mutation4Color}><strong>Deleterious</strong><ScoreBadge score={data.pathway.secondSampleMutation4}/></span></Chip>
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
