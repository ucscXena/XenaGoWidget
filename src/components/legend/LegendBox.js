import React from 'react'
import PureComponent from '../PureComponent'
// import BaseStyle from '../../css/base.css'
import PropTypes from 'prop-types'
// import {VIEW_ENUM} from '../../data/ViewEnum'
import {LEGEND_HEIGHT} from '../XenaGeneSetApp'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import {OpenGeneSetLegend} from './OpenGeneSetLegend'
import {GeneGeneExpressionLegend} from './GeneGeneExpressionLegend'
import {GeneCnvMutationLegend} from './GeneCnvMutationLegend'
import {DiffScaleLegend} from './DiffScaleLegend'
import {GeneSetCnvMutationLegend} from './GeneSetCnvMutationLegend'
import {GeneSetGeneExpressionLegend} from './GeneSetGeneExpressionLegend'
import {TopLegend} from './TopLegend'

export class LegendBox extends PureComponent {

  render() {
    const {view,maxValue,geneData,maxGeneData,showDiffLabel } = this.props

    return (

      <div style={{height: LEGEND_HEIGHT,backgroundColor: 'white',position: 'fixed',zIndex:8,marginTop:140, marginLeft:260, border:2, borderStyle:'solid', borderColor: 'black',  width: 182 + 182  + 222}}>
        <table>
          <tbody>
            <TopLegend/>
            {/*Gene set layer*/}
            {isViewGeneExpression(view) &&
        <GeneSetGeneExpressionLegend filter={view} maxValue={maxValue}/>
            }
            {!isViewGeneExpression(view) &&
        <GeneSetCnvMutationLegend/>
            }


            {/*Gene layer*/}
            {/*empty*/}
            {(!geneData || !geneData[0].data) &&
        <OpenGeneSetLegend />
            }
            {geneData && geneData[0].data && isViewGeneExpression(view) &&
        <GeneGeneExpressionLegend filter={view}/>
            }
            {geneData && geneData[0].data && !isViewGeneExpression(view) &&
        <GeneCnvMutationLegend filter={view} maxValue={5} />
            }
            <DiffScaleLegend
              maxValue={maxGeneData} minValue={maxGeneData}
              onShowDiffLabel={(value) => {
                this.setState( { showDiffLabel: value })
              }}
              showDiffLabel={showDiffLabel}
              showScale={(geneData && geneData[0].data)!==undefined}
              view={view}
            />
          </tbody>
        </table>
      </div>
    )
  }
}

LegendBox.propTypes = {
  geneData: PropTypes.any.isRequired,
  maxGeneData: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  showDiffLabel: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
