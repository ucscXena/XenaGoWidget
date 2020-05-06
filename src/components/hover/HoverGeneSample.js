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

export default class HoverGeneSample extends PureComponent {


  render() {
    let {data, view} = this.props
    return (
      <div>
        {data.pathway &&
        <div className={BaseStyle.pathwayChip}>
          <span><b>Gene</b> {data.pathway.gene[0].replace(/_/g,' ')}</span>
        </div>
        }
        {data.expression != null &&
        <div>
          { isViewGeneExpression(view) && data && data.expression && data.geneExpression &&
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
          {data.selectCnv && data.expression.cnvHigh > 0 &&
          <Chip>
            <span
              className={data.expression.cnvHigh === 0 ? '' : BaseStyle.cnvHighColor}
            ><strong>CNV Amplification</strong>
              <ScoreBadge score={data.expression.cnvHigh}/>
            </span>
          </Chip>
          }
          {data.selectCnv && data.expression.cnvLow > 0 &&
          <Chip>
            <span
              className={data.expression.cnvLow === 0 ? '' : BaseStyle.cnvLowColor}
            ><strong>CNV Deletion</strong>
              <ScoreBadge score={data.expression.cnvLow}/>
            </span>
          </Chip>
          }
          {!data.selectCnv && data.expression.mutation2 > 0 &&
          <Chip>
            <span
              className={data.expression.mutation2 === 0 ? '' : BaseStyle.mutation2Color}
            > <strong>Missense / Inframe </strong>
              <ScoreBadge score={data.expression.mutation2}/>
            </span>
          </Chip>
          }
          {!data.selectCnv && data.expression.mutation3 > 0 &&
          <Chip>
            <span
              className={data.expression.mutation3 === 0 ? '' : BaseStyle.mutation3Color}
            > <strong>Splice</strong>
              <ScoreBadge score={data.expression.mutation3}/>
            </span>
          </Chip>
          }
          {!data.selectCnv && data.expression.mutation4 > 0 &&
          <Chip>
            <span
              className={data.expression.mutation4 === 0 ? '' : BaseStyle.mutation4Color}
            > <strong>Deleterious</strong>
              <ScoreBadge score={data.expression.mutation4}/>
            </span>
          </Chip>
          }
        </div>
        }
        {data.tissue &&
        <Chip>
          <span style={{margin: 0}}>
            <strong>Sample</strong>
            <span>{data.tissue}</span>
          </span>
        </Chip>
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
