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
import {OpenGeneSetRow} from './OpenGeneSetRow'

export class LegendBox extends PureComponent {

  render() {
    const {view,maxValue,geneData,maxGeneData,showDiffLabel } = this.props
    if (geneData) {
      return (

        <div style={{
          height: LEGEND_HEIGHT,
          backgroundColor: 'rgba(255,255,255,0.7)',
          position: 'fixed',
          zIndex: 8,
          marginTop: HEADER_HEIGHT,
          marginLeft: 250,
          // border:2,
          // borderRadius: 15,
          // borderStyle:'solid',
          // borderColor: 'black',
          width: 182 + 182 + 222 +30
          // width: '100%'
        }}>
          <table>
            <tbody>
              {/*Gene Set Editor / Selector controls*/}
              { isViewGeneExpression(this.props.view) &&
              <OpenGeneSetRow
                customGeneSets={this.props.customGeneSets}
                geneSetLimit={this.props.geneSetLimit}
                onChangeGeneSetLimit={this.props.onChangeGeneSetLimit}
                onGeneEdit={this.props.handleGeneEdit}
                sortGeneSetBy={this.props.sortGeneSetBy}
              />
              }

              {/*legend for middle versus sample */}
              <TopLegend/>


              {/*Gene set layer*/}
              {isViewGeneExpression(view) &&
            <GeneSetGeneExpressionLegend filter={view} maxValue={maxValue}/>
              }
              {!isViewGeneExpression(view) &&
            <GeneSetCnvMutationLegend/>
              }


              {/*Gene layer*/}
              {(!geneData || !geneData[0].data) &&
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
  customGeneSets: PropTypes.any,
  geneData: PropTypes.any.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  handleGeneEdit: PropTypes.any.isRequired,
  maxGeneData: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  onShowDiffLabel: PropTypes.any.isRequired,
  showDiffLabel: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
