import axios from 'axios'

export async function getAllCustomGeneSets(){
  const {data} = await axios.get('http://localhost:3001/geneset')
  return data
}

export async function getCustomGeneSetNames(method){
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Access-Control-Allow-Origin': '*'
    }
  }
  const {data} = await axios.get(`http://localhost:3001/geneset/all/${method}`,config)
  console.log('response',data)

  return data
}


export async function getCustomGeneSet(method,geneSetName){
  const response = await axios.get(`http://localhost:3001/geneset/${method}/${geneSetName}`)
  console.log('response',response)
  return response

}

export async function addCustomGeneSet(method,geneSetName,inputData){
  // let formData = new FormData()
  // formData.append('data',)
  const response = await axios.post('http://localhost:3001/geneset',
    {
      method,
      geneset:geneSetName,
      data: inputData
    }
    ,{
      headers: {
        'Content-Type': 'multipart/form-data',
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

