import axios from 'axios'
import {getCohortDetails} from '../functions/CohortFunctions'
import {ANALYSIS_SERVER_URL} from './GeneSetAnalysisStorageService'


export function generateTpmDownloadUrlFromCohorts(cohorts) {
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

function generateTpmFromCohort(cohort) {
  const selectedCohort = getCohortDetails(cohort)
  return `${selectedCohort['geneExpression'].host}/download/${selectedCohort['geneExpression'].dataset}.gz`
}

export async function storeGmt(gmtData, geneSetName, view, profile) {

  let headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
  if(profile){
    headers['Authorization']= `Bearer jwt=${profile.tokenId}`
  }
  const config = {
    headers
  }
  let formData = {}
  formData['gmtdata'] = gmtData
  formData['gmtname'] = geneSetName
  formData['method'] = view
  const response = await axios.post(`${ANALYSIS_SERVER_URL}/gmt/store`,
    formData,
    config
  )
  let {data} = response
  return data
}


