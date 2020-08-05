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

  shouldComponentUpdate(nextProps) {
    return nextProps.view !== this.props.view
      || nextProps.customGeneSets !== this.props.customGeneSets
      || nextProps.selectedGeneSets !== this.props.selectedGeneSets
      || nextProps.geneSetLimit !== this.props.geneSetLimit
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
          backgroundColor: 'rgba(255,255,255,0.7)',
          position: 'fixed',
          zIndex: 8,
          marginTop: HEADER_HEIGHT,
          marginLeft: 250,
          width: 182 + 182 + 222 +30
        }}>
          <table>
            <tbody>
              {/*Gene Set Editor / Selector controls*/}
              { isViewGeneExpression(this.props.view) &&
              <OpenGeneSetRow
                customGeneSets={this.props.customGeneSets[this.props.view]}
                geneSetLimit={this.props.geneSetLimit}
                isCustomGeneSet={this.props.isCustomGeneSet}
                onChangeGeneSetLimit={this.props.onChangeGeneSetLimit}
                onGeneEdit={this.props.handleGeneEdit}
                selectedGeneSets={this.props.selectedGeneSets}
                setActiveGeneSets={this.props.setActiveGeneSets}
                setGeneSetsOption={this.props.setGeneSetsOption}
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
  isCustomGeneSet: PropTypes.any.isRequired,
  maxGeneData: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  onShowDiffLabel: PropTypes.any.isRequired,
  selectedGeneSets: PropTypes.any,
  setActiveGeneSets: PropTypes.any.isRequired,
  setGeneSetsOption: PropTypes.any.isRequired,
  showDiffLabel: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
