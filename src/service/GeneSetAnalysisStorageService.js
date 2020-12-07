import axios from 'axios'

// TODO: configure to environment
const BASE_URL = 'http://localhost:8080'

export async function getAllCustomGeneSets(){
  try {
    const {data} = await axios.get(`${BASE_URL}/gmt`)
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
  const {data} = await axios.get(`${BASE_URL}/gmt/${method}/all`,config)
  return data
}


export async function getCustomGeneSet(method,geneSetName){
  const {data} = await axios.get(`${BASE_URL}/geneset/${method}/${geneSetName}`)
  return data

}

export async function addCustomGeneSet(method,geneSetName,inputData){
  const response = await axios.post(`${BASE_URL}/geneset`,
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
  const response = await axios.delete(`${BASE_URL}/geneset/${method}/${geneSetName}`)
  const { data} = response
  return data
}

