import axios from 'axios'

// TODO: configure to environment
export const BASE_URL = 'http://localhost:8080'

export async function getAllCustomGeneSets(){
  try {
    console.log('getting alll custom gene sets ')
    const {data} = await axios.get(`${BASE_URL}/gmt`)
    console.log(data)
    return data
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return []
  }
}

export async function getCustomGeneSetNames(method){
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const {data} = await axios.get(`${BASE_URL}/gmt/names/?method=${method}`,config)
  return data
}


export async function getCustomGeneSet(method,geneSetName){
  const {data} = await axios.get(`${BASE_URL}/gmt/${method}/${geneSetName}`)
  return data

}

export async function getCustomGeneSetResult(method,geneSetName,cohortName){
  console.log('metho',method)
  console.log('cohort',cohortName)
  console.log('gene set name',geneSetName)
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const {data} = await axios.get(`${BASE_URL}/result/findResult/?method=${method}&geneSetName=${geneSetName}&cohort=${cohortName}`,config)
  return data

}

export async function addCustomGeneSet(method,geneSetName,inputData){
  const response = await axios.post(`${BASE_URL}/gmt/save`,
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

export async function removeCustomGeneSet(method,geneSetName){
  const response = await axios.delete(`${BASE_URL}/gmt/${method}/${geneSetName}`)
  const { data} = response
  return data
}

export async function fetchPathwayResult(method,gmt,selectedCohort,samples){
  console.log('getting pathway result',method,gmt,selectedCohort,samples)
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const {data} = await axios.get(`${BASE_URL}/compareResult/findResult?method=${method}&geneSetName=${gmt}&cohortNameA=${selectedCohort[0].name}&cohortNameB=${selectedCohort[1].name}&samples=${samples}`,config)
  return data

}

export async function fetchOrGenerateScoredPathwayResult(method,gmt,selectedCohort,samples){

  console.log('getting pathway result',method,gmt,selectedCohort,samples)
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const {data} = await axios.get(`${BASE_URL}/compareResult/generateScoredResult?method=${method}&geneSetName=${gmt}&cohortNameA=${selectedCohort[0].name}&cohortNameB=${selectedCohort[1].name}&samples=${samples}`,config)
  return data
}


export async function savePathwayResult(view,gmt,selectedCohort,samples, customGeneSetData){
  const response = await axios.post(`${BASE_URL}/compareResult/storeResult`,
    {
      method: view,
      geneset:gmt.name,
      cohortA: selectedCohort[0].name,
      cohortB: selectedCohort[1].name,
      samples: samples,
      result:customGeneSetData,
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

