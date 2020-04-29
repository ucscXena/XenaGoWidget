import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../css/base.css'
import {isViewGeneExpression} from '../functions/DataFunctions'

export default class SelectGeneView extends PureComponent {

    /**
     * This returns the number of affected versus the total number versus a single gene
     * @param data
     * @returns {string}
     */
    getRatio = data => {
      let returnString = data.expression.samplesAffected + '/' + data.expression.total
      returnString += '  ('
      returnString += ((Number.parseFloat(data.expression.samplesAffected ) / Number.parseFloat(data.expression.total)) * 100.0).toFixed(0)
      returnString += '%)'
      return returnString
    };

    getAffectedPathway = data => {
      let returnString = data.expression.allGeneAffected + '/' + (data.expression.total * data.pathway.gene.length)
      returnString += '  ('
      returnString += ((Number.parseFloat(data.expression.allGeneAffected) / Number.parseFloat(data.expression.total * data.pathway.gene.length)) * 100.0).toFixed(0)
      returnString += '%)'
      return returnString

    };

  findScore = (pathwaySelection, cohortIndex,filter) => {
    if(isViewGeneExpression(filter)){
      if(cohortIndex===0){
        return pathwaySelection.firstSampleGeneExpressionPathwayActivity!==undefined   ? pathwaySelection.firstSampleGeneExpressionPathwayActivity: pathwaySelection.firstGeneExpressionPathwayActivity
      }
      else{
        return pathwaySelection.secondSampleGeneExpressionPathwayActivity!==undefined  ? pathwaySelection.secondSampleGeneExpressionPathwayActivity: pathwaySelection.secondGeneExpressionPathwayActivity
      }
    }
    else{
      if(cohortIndex===0){
        return pathwaySelection.firstChiSquared!==undefined  ?  pathwaySelection.firstChiSquared : pathwaySelection.firstSampleTotal
      }
      else{
        return pathwaySelection.secondChiSquared!==undefined  ?  pathwaySelection.secondChiSquared : pathwaySelection.secondSampleTotal
      }
    }
  };

  render() {
    const {data} = this.props
    if(!data.pathwaySelection) return <div/>
    const pathwaySelection = data.pathwaySelection.pathway

    if (pathwaySelection && data.pathwaySelection.open) {
      return (
        <div className={BaseStyle.pathwayChip}>
          <div className={BaseStyle.boxHeader}>Opened Gene Set</div>
          <div className={BaseStyle.geneHoverPathway} style={{width:180}}>
            {pathwaySelection.golabel.replace(/_/g,' ')}
          </div>
          <div className={BaseStyle.geneHoverPathway} style={{width:180}}>
            {pathwaySelection.gene.length} Genes
          </div>
        </div>
      )
    }
    else {
      return (
        <div className={BaseStyle.pathwayChip}>
        No Gene Set selected
        </div>
      )
    }
  }
}

SelectGeneView.propTypes = {
  data: PropTypes.any.isRequired,
}
