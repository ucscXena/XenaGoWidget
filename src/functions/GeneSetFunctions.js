


// Key is gene set name, and value is array of gene sets
// TODO: use local storage?
let customGeneSets = {}

export function getAvailableCustomGeneSets(){
  return customGeneSets
}

export function getCustomGeneSet(name){
  return customGeneSets[name]
}

export function addUpdateCustomGeneSet(name,geneSet){
  customGeneSets[name] = geneSet
}

export function isCustomGeneSet(name){
  return (customGeneSets[name]!==undefined)
}
