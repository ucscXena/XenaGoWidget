import axios from 'axios'

export async function getAllCustomGeneSets(){
  try {
    const {data} = await axios.get('http://localhost:3001/geneset')
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
  const {data} = await axios.get(`http://localhost:3001/geneset/all/${method}`,config)
  return data
}


export async function getCustomGeneSet(method,geneSetName){
  const {data} = await axios.get(`http://localhost:3001/geneset/${method}/${geneSetName}`)
  return data

}

export async function addCustomGeneSet(method,geneSetName,inputData){
  const response = await axios.post('http://localhost:3001/geneset',
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
  const response = await axios.delete(`http://localhost:3001/geneset/${method}/${geneSetName}`)
  const { data} = response
  return data
}

