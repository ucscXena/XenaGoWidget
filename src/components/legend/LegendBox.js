import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {HEADER_HEIGHT, LEGEND_HEIGHT} from '../XenaGeneSetApp'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import {OpenGeneSetLegend} from './OpenGeneSetLegend'
import {GeneGeneExpressionLegend} from './GeneGeneExpressionLegend'
import {GeneCnvMutationLegend} from './GeneCnvMutationLegend'
import {DiffScaleLegend} from './DiffScaleLegend'
import {GeneSetCnvMutationLegend} from './GeneSetCnvMutationLegend'
import {GeneSetGeneExpressionLegend} from './GeneSetGeneExpressionLegend'
import {TopLegend} from './TopLegend'
// import {OpenGeneSetRow} from './OpenGeneSetRow'

export class LegendBox extends PureComponent {

  shouldComponentUpdate(nextProps) {
    return nextProps.view !== this.props.view
      || nextProps.maxValue !== this.props.maxValue
      || nextProps.maxGeneData !== this.props.maxGeneData
      || nextProps.showDiffLabel !== this.props.showDiffLabel
  }

  render() {
    const {view,maxValue,geneData,maxGeneData,showDiffLabel } = this.props
    if (geneData) {
      return (

        <div style={{
          height: LEGEND_HEIGHT,
          // backgroundColor: 'rgba(255,255,255,0.7)',
          // backgroundColor: 'rgba(255,255,255,1)',
          position: 'fixed',
          zIndex: 10,
          marginTop: HEADER_HEIGHT-5,
          marginLeft: 250,
          width: 182 + 182 + 222 +30
        }}>
          <table>
            <tbody>
              {/*legend for middle versus sample */}
              { maxValue !== 0 &&
              <TopLegend cohortColors={this.props.cohortColors}/>
              }


              {/*Gene set layer*/}
              {(!geneData || !geneData[0].data) && isViewGeneExpression(view) &&
            <GeneSetGeneExpressionLegend filter={view} maxValue={maxValue}/>
              }
              {(!geneData || !geneData[0].data) && !isViewGeneExpression(view) &&
            <GeneSetCnvMutationLegend/>
              }


              {/*Gene layer*/}
              {(!geneData || !geneData[0].data) && maxValue!==0 &&
            <OpenGeneSetLegend/>
              }
              {geneData && geneData[0].data && isViewGeneExpression(view) &&
            <GeneGeneExpressionLegend filter={view}/>
              }
              {geneData && geneData[0].data && !isViewGeneExpression(view) &&
            <GeneCnvMutationLegend filter={view} maxValue={5}/>
              }

              {/*Diff scale layer*/}
              <DiffScaleLegend
                maxValue={maxGeneData} minValue={maxGeneData}
                onShowDiffLabel={this.props.onShowDiffLabel}
                showDiffLabel={showDiffLabel}
                showScale={(geneData && geneData[0].data) !== undefined}
                view={view}
              />
            </tbody>
          </table>
        </div>
      )
    }
    return <div/>
  }
}

LegendBox.propTypes = {
  cohortColors: PropTypes.any.isRequired,
  geneData: PropTypes.any.isRequired,
  maxGeneData: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  onShowDiffLabel: PropTypes.any.isRequired,
  showDiffLabel: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
