import axios from 'axios'
import {getCohortDetails} from '../functions/CohortFunctions'

const mean = sampleScores => (sampleScores.reduce((sume, el) => sume + el, 0) )/sampleScores.length

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

export function getDataStatisticsForGeneSet(arr){
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

export function getValuesForCohort(data){
  return data.map( d => getValuesForGeneSet(d))
}

export function getValues(data){
  return [getValuesForCohort(data[0]),getValuesForCohort(data[1])]
}

/**
 * We assume that both the cohorts have been glued together.
 * @param data
 * @returns {*}
 */
export function getDataStatisticsPerGeneSet(data){
  const dataA = data[0]
  const dataB = data[1]
  let outputData = []
  for( const i in dataA){
    const values = dataA[i].concat(dataB[i])
    const {mean, variance} = getDataStatisticsForGeneSet(values)
    outputData.push({mean,variance})
  }
  return outputData
}


export function getSamples(data){
  return Object.keys(data[0]).filter( k => k!=='X' )
}

export function getValuesForGeneSet(data){
  return Object.entries(data).filter( k => k[0]!=='X' ).map( d => d[1])
}


export function getZSampleScores(values,dataStatisticsPerGeneSet){
  let scoreValues = []
  for( let index in values){
    const { mean, variance} = dataStatisticsPerGeneSet[index]
    const array = values[index].map( v => (v - mean)/ variance )
    scoreValues.push(array)
  }
  return scoreValues
}

export function getZPathwayScoresForCohort(sampleScores){
  return sampleScores.map( d => {
    return mean(d)
  })

}

// eslint-disable-next-line no-unused-vars
export function getZPathwayScores(sampleScores){
  // console.log('input sample scores ',sampleScores)
  const returnValues = [getZPathwayScoresForCohort(sampleScores[0]),getZPathwayScoresForCohort(sampleScores[1])]
  console.log(returnValues[0])
  return returnValues
}

export function createMeanMap(analyzedData) {
  // console.log('input data',analyzedData)
  // console.log('input data string',JSON.stringify(analyzedData))
  const samples = [getSamples(analyzedData[0][0]),getSamples(analyzedData[1][0])]

  const geneSetNames = getGeneSetNames(analyzedData[0])
  const values = getValues(analyzedData)
  // console.log('values')
  // console.log(JSON.stringify(values))
  const dataStatisticsPerGeneSet = getDataStatisticsPerGeneSet(values)
  // calculates cohorts separately
  const zSampleScores = [getZSampleScores(values[0],dataStatisticsPerGeneSet),getZSampleScores(values[1],dataStatisticsPerGeneSet)]
  // uses mean separately
  const zPathwayScores = getZPathwayScores(zSampleScores)

  let returnMap = {
    samples,
    zSampleScores,
    zPathwayScores,
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



