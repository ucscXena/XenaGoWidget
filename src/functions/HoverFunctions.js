import {isViewGeneExpression} from './DataFunctions'

export function findScore (data, cohortIndex,filter) {
  if(isViewGeneExpression(filter)){
    if(cohortIndex===0){
      return data.pathway.firstSampleGeneExpressionPathwayActivity!==undefined  && data.tissue !=='Header' ? data.pathway.firstSampleGeneExpressionPathwayActivity: data.pathway.firstGeneExpressionPathwayActivity
    }
    else{
      return data.pathway.secondSampleGeneExpressionPathwayActivity!==undefined && data.tissue !=='Header' ? data.pathway.secondSampleGeneExpressionPathwayActivity: data.pathway.secondGeneExpressionPathwayActivity
    }
  }
  else{
    if(data.source==='GeneSet' && data.tissue === 'Header'){
      if(cohortIndex===0){
        return data.pathway.firstChiSquared!==undefined  ?  data.pathway.firstChiSquared : data.pathway.firstSampleTotal
      }
      else{
        return data.pathway.secondChiSquared!==undefined  ?  data.pathway.secondChiSquared : data.pathway.secondSampleTotal
      }
    }
    else {
      if (cohortIndex === 0) {
        return data.pathway.firstSampleTotal !== undefined && data.tissue !== 'Header' ? data.pathway.firstSampleTotal : data.pathway.firstChiSquared
      } else {
        return data.pathway.secondSampleTotal !== undefined && data.tissue !== 'Header' ? data.pathway.secondSampleTotal : data.pathway.secondChiSquared
      }
    }
  }
}

/**
 * This returns the number of affected versus the total number versus a single gene
 * @param data
 * @returns {string}
 */
export function getRatio(data) {
  let returnString = data.samplesAffected + '/' + data.total
  returnString += '  ('
  returnString += ((Number.parseFloat(data.samplesAffected ) / Number.parseFloat(data.total)) * 100.0).toFixed(0)
  returnString += '%)'
  return returnString
}

export function getAffectedPathway(data) {
  let returnString = data.expression.allGeneAffected + '/' + (data.expression.total * data.pathway.gene.length)
  returnString += '  ('
  returnString += ((Number.parseFloat(data.expression.allGeneAffected) / Number.parseFloat(data.expression.total * data.pathway.gene.length)) * 100.0).toFixed(0)
  returnString += '%)'
  return returnString

}

