import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import {
  interpolateCnvMutationColor,
  interpolateGeneExpression,
} from '../../functions/DrawFunctions'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import {getRatio} from '../../functions/HoverFunctions'
import {getMiddleGeneLabelForView} from '../legend/GeneGeneExpressionLegend'

export default class HoverGeneLabel extends PureComponent {

  getPercent(data){
    return data.pathway.samplesAffected / data.pathway.total * 100.0
  }

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
                className={BaseStyle.scoreBoxBlock}
                key={4}
                style={{
                  color: 'black',
                  backgroundColor: interpolateGeneExpression(data.pathway.geneExpressionMean)
                }}
              >
                <strong>
                  {getMiddleGeneLabelForView(view)}
                </strong>
                <br/>
                {data.pathway.geneExpressionMean ? data.pathway.geneExpressionMean.toPrecision(2) : 0}
              </div>
          }
          { !isViewGeneExpression(view) && data.pathway && data.pathway.samplesAffected!==undefined &&
          <div
            className={BaseStyle.scoreBoxBlock}
            style={{
              color: 'black',
              marginTop: 5,
              backgroundColor: interpolateCnvMutationColor(this.getPercent(data) )
            }}
          >
            <strong>Samples Affected</strong><br/> {getRatio(data.pathway)}
          </div>
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
