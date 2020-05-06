import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import {
  interpolateGeneExpression,
  interpolateGeneExpressionFont
} from '../../functions/DrawFunctions'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import {getRatio} from '../../functions/HoverFunctions'

export default class HoverGeneLabel extends PureComponent {


  render() {
    let {data, view} = this.props
    return (
      <div>
        <div className={BaseStyle.pathwayChip}>
          <div className={BaseStyle.boxHeader}>Hovering over </div>
          <div><b>Gene</b> {data.pathway.gene[0].replace(/_/g,' ')}</div>
          <br/>
          { isViewGeneExpression(view) &&
          <div
            className={BaseStyle.scoreBox}
            style={{
              color: interpolateGeneExpressionFont(data.pathway.geneExpressionMean),
              backgroundColor: interpolateGeneExpression(data.pathway.geneExpressionMean)
            }}
          >
            Mean ZScore&nbsp;&nbsp;
            {data.pathway.geneExpressionMean ? data.pathway.geneExpressionMean.toPrecision(2) : 0}
          </div>
          }
          { !isViewGeneExpression(view) && data.pathway && data.pathway.samplesAffected!==undefined &&
          <span>
            <strong>Samples Affected</strong><br/> {getRatio(data.pathway)}
          </span>
          }
        </div>
      </div>
    )
  }
}

HoverGeneLabel.propTypes = {
  data: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
