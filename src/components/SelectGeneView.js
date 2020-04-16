import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../css/base.css'
import {interpolateGeneExpression, interpolateGeneExpressionFont} from '../functions/DrawFunctions'
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
    console.log('pathway selection',pathwaySelection)
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
        // return pathwaySelection.firstSampleTotal!==undefined   data.pathway.firstSampleTotal : data.pathway.firstChiSquared
        return 3
      }
      else{
        // return pathwaySelection.secondSampleTotal!==undefined  ? data.pathway.secondSampleTotal : data.pathway.secondChiSquared
        return 7
      }

    }
  };

  render() {
    let {data, cohortIndex, view} = this.props
    if(!data.pathwaySelection) return <div/>
    const pathwaySelection = data.pathwaySelection.pathway

    if (pathwaySelection) {
      const score =this.findScore(pathwaySelection, cohortIndex,view)
      return (
        <div>
          {pathwaySelection &&
                    <div className={BaseStyle.pathwayChip}>
                      <div className={BaseStyle.geneHoverPathway} style={{width:180}}>
                        <strong>Selected Gene Set&nbsp;&nbsp;</strong>
                        {pathwaySelection.golabel.replace(/_/g,' ')}
                      </div>
                      <div className={BaseStyle.geneHoverPathway} style={{width:180}}>
                        {pathwaySelection.gene.length} Genes
                      </div>
                      {/*{!isViewGeneExpression(view) &&*/}
                      {/*<div>*/}
                      {/*  <span><strong>Samples Affected</strong><br/> {this.getRatio(data)}</span>*/}
                      {/*</div>*/}
                      {/*}*/}
                      {/*{!isViewGeneExpression(view) &&*/}
                      {/*<div>*/}
                      {/*  <span><strong>Affected Area</strong><br/> {this.getAffectedPathway(data)}</span>*/}
                      {/*</div>*/}
                      {/*}*/}
                      <div>
                        <br/>
                        <span
                          className={BaseStyle.scoreBox}
                          style={{
                            color:isViewGeneExpression(view) ? interpolateGeneExpressionFont(score) : 'black',
                            backgroundColor: isViewGeneExpression(view) ? interpolateGeneExpression(score) : 'white'
                          }}
                        >
                          <strong>Mean Score</strong> {score === 'NaN' ? 'Not available' : score.toFixed(2)}</span>
                      </div>
                    </div>
          }
        </div>
      )
    }
    else {
      return <div/>
    }
  }
}

SelectGeneView.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
