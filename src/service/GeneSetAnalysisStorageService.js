import axios from 'axios'

// TODO: configure to environment
// export const ANALYSIS_SERVER_URL = process.env.ANALYSIS_SERVER_URL ? `${process.env.ANALYSIS_SERVER_URL}`:  'http://localhost:8080'
export const ANALYSIS_SERVER_URL = 'http://localhost:8080'

// NOTE: nwb is bad and reading the environment so we will hardcode per branch
// export const ANALYSIS_SERVER_URL = 'http://xenademo.berkeleybop.io:8080/'

export async function getAllCustomGeneSets(){
  try {
    const {data} = await axios.get(`${ANALYSIS_SERVER_URL}/gmt`)
    return data
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return []
  }
}

export async function getCustomGeneSetNames(method){
  console.log('getting custom names iwth ',ANALYSIS_SERVER_URL,process.env.ANALYSIS_SERVER_URL)
  console.log(process.env)
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const {data} = await axios.get(`${ANALYSIS_SERVER_URL}/gmt/names/?method=${method}`,config)
  return data
}


export async function getCustomGeneSet(method,geneSetName){
  const {data} = await axios.get(`${ANALYSIS_SERVER_URL}/gmt/${method}/${geneSetName}`)
  return data

}

export async function getCustomGeneSetResult(method,geneSetName,cohortName){
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const {data} = await axios.get(`${ANALYSIS_SERVER_URL}/result/findResult/?method=${method}&geneSetName=${geneSetName}&cohort=${cohortName}`,config)
  return data

}

export async function addCustomGeneSetToServer(method, geneSetName, inputData){
  const response = await axios.post(`${ANALYSIS_SERVER_URL}/gmt/save`,
    {
      method,
      geneset:geneSetName,
      result:inputData
    }
    ,{
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  )
  const { data} = response
  return data

}

export async function removeCustomServerGeneSet(method, geneSetName){
  const response = await axios.delete(`${ANALYSIS_SERVER_URL}/gmt/${method}/${geneSetName}`)
  const { data} = response
  return data
}

export async function retrieveCustomScoredPathwayResult(method,gmt,selectedCohort,samples,filterBy,filterOrder,geneSetLimit){
  console.log(filterBy,filterOrder,geneSetLimit)
  const config = {
    headers: {
      // 'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  let inputUrl = `${ANALYSIS_SERVER_URL}/compareResult/retrieveScoredResult`
  const input = {
    method:method,
    geneSetName: gmt,
    cohortNameA: selectedCohort[0].name,
    cohortNameB: selectedCohort[1].name,
    samples: samples,
    geneSetLimit,
    filterBy,
    filterOrder,
  }
  const {data} = await axios.post(inputUrl, input, config)
  return data
}




