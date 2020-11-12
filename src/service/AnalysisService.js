import axios from 'axios'
import {getCohortDetails} from '../functions/CohortFunctions'


export function generateTpmDownloadUrlFromCohorts(cohorts){
  return [
    {
      name: cohorts[0].name,
      url: generateTpmFromCohort(cohorts[0]),
    },
    {
      name: cohorts[1].name,
      url: generateTpmFromCohort(cohorts[1]),
    },
  ]
}

function generateTpmFromCohort(cohort){
  const selectedCohort = getCohortDetails(cohort)
  return `${selectedCohort['geneExpression'].host}/download/${selectedCohort['geneExpression'].dataset}.gz`
}

/**
 * Emulating:  curl -v -F tpmdata=@test-data/TCGA-CHOL_logtpm_forTesting.tsv -F gmtdata=@test-data/Xena_manual_pathways.gmt http://localhost:8000/bpa_analysis
 * @param cohorts
 * @param gmtData
 * @returns {Promise<{msg: ({"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string}|{"TCGA.3X.AAV9.01A.TCGA.3X.AAVA.01A.TCGA.3X.AAVB.01A.TCGA.3X.AAVC.01A.TCGA.3X.AAVE.01A.TCGA.4G.AAZO.01A.TCGA.4G.AAZT.01A.TCGA.W5.AA2G.01A.TCGA.W5.AA2H.01A.TCGA.W5.AA2I.01A": string})[]}>}
 */
export async function doBpaAnalysisForCohorts(cohort, gmtData){

  // const tpmData = generateTpmFromCohort(cohort)
  let formData = new FormData()
  formData.append('gmtdata',gmtData)
  formData.append('tpmname',cohort.name)
  formData.append('tpmurl',generateTpmFromCohort(cohort))
  formData.append('input','text')
  const response = await axios.post('http://localhost:8000/bpa_analysis',
    formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
  const { data} = response
  return data

}

export function createMeanMap(analyzedDatum) {
  let returnMap = {}
  for( const entry of Object.entries(analyzedDatum)){
    const key = entry[1].X.replaceAll('+',' ')
    const values = Object.values(entry[1]).filter( v => {
      return typeof v === 'number'
    })
    returnMap[key] = values.reduce( (a,b) => (a + b) / values.length )
  }

  return returnMap
}

export function calculateGeneSetActivity(selectedCohort,gmtData,analyzedData){
  const meanMapA = createMeanMap(analyzedData[0][0])
  const meanMapB = createMeanMap(analyzedData[1][0])
  return gmtData.split('\n').map( line => {
    const entries = line.split('\t')
    const key = entries[0] +  (entries[1]!=='' ? ' ('+entries[1]+')' :'')
    return {
      golabel: entries[0],
      goid: entries[1],
      gene: entries.slice(2),
      firstGeneExpressionPathwayActivity: meanMapA[key],
      secondGeneExpressionPathwayActivity: meanMapB[key],
    }
  } )
}



