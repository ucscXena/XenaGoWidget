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

export function getZValues(data,mean,variance){
  return data.map( d => (d - mean) / variance )
}

export function getDataStatistics(arr){
  function getVariance(arr, mean) {
    return arr.reduce(function(pre, cur) {
      pre = pre + Math.pow((cur - mean), 2)
      return pre
    }, 0)
  }

  var meanTot = arr.reduce(function(pre, cur) {
    return pre + cur
  })
  var total = getVariance(arr, meanTot / arr.length)

  return {
    mean:meanTot / arr.length,
    variance: total / arr.length,
  }
}

export function getGeneSetNames(data){
  let returnArray = []
  for( const entry of Object.entries(data)) {
    const entryX = entry[1].X
    if(entryX.indexOf(' ')){
      returnArray.push(entryX.split(' ')[0])
    }
    else{
      returnArray.push(entryX.trim())
    }
  }
  return returnArray
}

export function getSamples(data){
  return Object.keys(data[0]).filter( k => k!=='X' )
}

export function getValues(data){
  return Object.entries(data[0]).filter( k => k[0]!=='X' ).map( d => d[1])
}

// eslint-disable-next-line no-unused-vars
export function getZSampleScores(data,mean,variance){

}

// eslint-disable-next-line no-unused-vars
export function getZPathwayScores(data,mean,variance){

}

export function createMeanMap(analyzedData) {
  // console.log('input data',analyzedData)
  // console.log('input data string',JSON.stringify(analyzedData))
  const samplesA = getSamples(analyzedData[0][0])
  const samplesB = getSamples(analyzedData[1][0])


  const geneSetNames = getGeneSetNames(analyzedData[0])
  // const geneSetLength = geneSetNames.length

  const valuesA = getValues(analyzedData[0][0])
  const valuesB = getValues(analyzedData[1][0])
  const values = valuesA.concat(valuesB)
  const {mean, variance} = getDataStatistics(values)
  const zSampleScoresA = getZSampleScores(analyzedData[0][0],mean,variance)
  const zSampleScoresB = getZSampleScores(analyzedData[1][0],mean,variance)
  const zPathwayScoresA = getZPathwayScores(analyzedData[0][0],mean,variance)
  const zPathwayScoresB = getZPathwayScores(analyzedData[1][0],mean,variance)

  // for( const entry of Object.entries(analyzedDatum)){
  //   console.log('entry',entry)
  //   const key = entry[1].X.replaceAll('+',' ')
  //   const values = Object.values(entry[1]).filter( v => {
  //     return typeof v === 'number'
  //   })
  //   console.log('key / value',key,values)
  //   const mean = values.reduce( (a,b) => (a + b) ,0 )/ values.length
  //   const variance = values.reduce( (a,b) => (a + Math.pow( (b - mean) ,2)))
  //   const stdev= Math.sqrt(variance)
  //   const zScores = values.map( x => (( x - mean ) / variance) )
  //   returnMap[key] = values.reduce( (a,b) => (a + b) ,0 )/ values.length
  // }

  let returnMap = {
    samplesA,
    samplesB,
    zSampleScoresA,
    zSampleScoresB,
    zPathwayScoresA,
    zPathwayScoresB,
    geneSetNames
  }
  console.log('return map',returnMap)

  return returnMap
}

export function calculateCustomGeneSetActivity(selectedCohort, gmtData, analyzedData){
  const meanMapA = createMeanMap(analyzedData[0][0])
  const meanMapB = createMeanMap(analyzedData[1][0])
  console.log('mean maps',meanMapA,meanMapB,analyzedData)
  return gmtData.split('\n')
    .filter( l => l.split('\t').length>2)
    .map( line => {
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



