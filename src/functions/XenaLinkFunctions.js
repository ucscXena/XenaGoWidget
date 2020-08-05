import {VIEW_ENUM} from '../data/ViewEnum'

const XENA_SS_LINK = 'https://xenabrowser.net/heatmap/'
const MAX_PATHWAYS = 20
const MAX_GENES = 60

export function generateXenaLink(props){
  const cohort = props.cohort[props.cohortIndex]
  const samples = props.pathwayData[props.cohortIndex].samples

  let samplesJson = {
    showWelcome: false,
  }
  if(samples.length < 100 ){
    samplesJson.searchSampleList= samples
    if(props.cohort[0].name===props.cohort[1].name){
      samplesJson.filter = 'A:'+props.pathwayData[0].samples.join(' OR A:')+props.pathwayData[1].samples.join(' OR A:')
    }
  }

  let genes = props.open ? props.geneDataStats[props.cohortIndex].pathways.map( p => p.gene[0]) : []
  genes = genes.length > MAX_GENES ? genes.slice(0,MAX_GENES) : genes
  let pathways = props.open ? [props.pathwayData[props.cohortIndex].pathwaySelection.pathway.golabel] : props.geneDataStats[props.cohortIndex].pathways.map( p => p.golabel )
  const selectedGeneSet = pathways[0]

  let linkString = '?columns=['
  if(props.view === VIEW_ENUM.GENE_EXPRESSION){
    // show selected gene set and all genes in another columns
    const geneExpressionDataset = cohort.geneExpression.dataset
    const geneExpressionHost = cohort.geneExpression.host
    const geneExpressionActivityDataset = cohort.geneExpressionPathwayActivity.dataset
    const geneExpressionActivityHost = cohort.geneExpressionPathwayActivity.host
    if(props.open){
      // TODO:
      linkString += `{"name":"${geneExpressionActivityDataset}","host":"${geneExpressionActivityHost}","fields":"${selectedGeneSet}","columnLabel":"Gene Expression Activity","fieldLabel":"${selectedGeneSet}"}`
      linkString += ','
      linkString += `{"name":"${geneExpressionDataset}","host":"${geneExpressionHost}","fields":"${genes}","columnLabel":"Gene View","fieldLabel":"${genes.length} genes ${genes.length===MAX_GENES  ? '(max)' : ''}"}`
    }
    // show all gene sets
    else{
      // TODO:
      for(const pathwayIndex in pathways){
        if(pathwayIndex < MAX_PATHWAYS){
          const pathway = pathways[pathwayIndex]
          linkString += `{"name":"${geneExpressionActivityDataset}","host":"${geneExpressionActivityHost}","fields":"${pathway}","columnLabel":"Gene Expression Activity","fieldLabel":"${pathway}"}`
        }
        if(pathwayIndex < pathways.length -1 && pathwayIndex < MAX_PATHWAYS-1 ){
          linkString += ','
        }
      }
    }
  }
  if(props.view === VIEW_ENUM.PARADIGM){
    // show selected gene set and all genes in another columns
    const geneExpressionDataset = cohort.paradigm.dataset
    const geneExpressionHost = cohort.paradigm.host
    const geneExpressionActivityDataset = cohort.paradigmPathwayActivity.dataset
    const geneExpressionActivityHost = cohort.paradigmPathwayActivity.host
    if(props.open){
      // TODO:
      linkString += `{"name":"${geneExpressionActivityDataset}","host":"${geneExpressionActivityHost}","fields":"${selectedGeneSet}","columnLabel":"Paradigm IPL","fieldLabel":"${selectedGeneSet}"}`
      linkString += ','
      linkString += `{"name":"${geneExpressionDataset}","host":"${geneExpressionHost}","fields":"${genes}","columnLabel":"Gene View","fieldLabel":"${genes.length} genes ${genes.length===MAX_GENES  ? '(max)' : ''}"}`
    }
    // show all gene sets
    else{
      // TODO:
      for(const pathwayIndex in pathways){
        if(pathwayIndex < MAX_PATHWAYS){
          const pathway = pathways[pathwayIndex]
          linkString += `{"name":"${geneExpressionActivityDataset}","host":"${geneExpressionActivityHost}","fields":"${pathway}","columnLabel":"Paradigm IPL","fieldLabel":"${pathway}"}`
        }
        if(pathwayIndex < pathways.length -1 && pathwayIndex < MAX_PATHWAYS-1 ){
          linkString += ','
        }
      }
    }
  }
  else
  if(props.view === VIEW_ENUM.REGULON){
    // show selected gene set and all genes in another columns
    const geneExpressionDataset = cohort.geneExpression.dataset
    const geneExpressionHost = cohort.geneExpression.host
    const geneExpressionActivityDataset = cohort.regulonPathwayActivity.dataset
    const geneExpressionActivityHost = cohort.regulonPathwayActivity.host
    if(props.open){
      // TODO:
      linkString += `{"name":"${geneExpressionActivityDataset}","host":"${geneExpressionActivityHost}","fields":"${selectedGeneSet}","columnLabel":"Regulon","fieldLabel":"${selectedGeneSet}"}`
      linkString += ','
      linkString += `{"name":"${geneExpressionDataset}","host":"${geneExpressionHost}","fields":"${genes}","columnLabel":"Gene View","fieldLabel":"${genes.length} genes ${genes.length===MAX_GENES  ? '(max)' : ''}"}`
    }
    // show all gene sets
    else{
      // TODO:
      for(const pathwayIndex in pathways){
        if(pathwayIndex < MAX_PATHWAYS){
          const pathway = pathways[pathwayIndex]
          linkString += `{"name":"${geneExpressionActivityDataset}","host":"${geneExpressionActivityHost}","fields":"${pathway}","columnLabel":"Regulon","fieldLabel":"${pathway}"}`
        }
        if(pathwayIndex < pathways.length -1 && pathwayIndex < MAX_PATHWAYS-1 ){
          linkString += ','
        }
      }
    }
  }
  if(props.view === VIEW_ENUM.COPY_NUMBER){
    // show selected gene set and all genes in another columns
    const cnvDataset = cohort.copyNumberDataSetId
    const cnvHost = cohort.host
    if(props.open){
      linkString += `{"name":"${cnvDataset}","host":"${cnvHost}","fields":"${genes}","columnLabel":"CNV","fieldLabel":"${genes.length} genes"}`
    }
    // show all gene sets
    else{
      // not sure what show here
    }
  }
  else
  if(props.view === VIEW_ENUM.MUTATION){
    // show selected gene set and all genes in another columns
    const mutationDataSet= cohort.mutationDataSetId
    const mutationHost = cohort.host
    if(props.open){
      for(const geneIndex in genes){
        const gene = genes[geneIndex]
        linkString += `{"name":"${mutationDataSet}","host":"${mutationHost}","fields":"${gene}","columnLabel":"Somatic Mutation","fieldLabel":"Gene ${gene}"}`
        if(geneIndex < genes.length -1 && geneIndex < MAX_GENES-1 ){
          linkString += ','
        }
      }
    }
    // show all gene sets
    else{
      // not sure what show here
    }
  }
  else
  if(props.view === VIEW_ENUM.CNV_MUTATION){
    // show selected gene set and all genes in another columns
    const cnvDataset = cohort.copyNumberDataSetId
    const cnvHost = cohort.host
    const mutationDataSet= cohort.mutationDataSetId
    const mutationHost = cohort.host
    if(props.open){
      linkString += `{"name":"${cnvDataset}","host":"${cnvHost}","fields":"${genes}","columnLabel":"CNV","fieldLabel":"${genes.length} genes"}`
      linkString += ','
      for(const geneIndex in genes){
        const gene = genes[geneIndex]
        linkString += `{"name":"${mutationDataSet}","host":"${mutationHost}","fields":"${gene}","columnLabel":"Somatic Mutation","fieldLabel":"Gene ${gene}"}`
        if(geneIndex < genes.length -1 && geneIndex < MAX_GENES-1 ){
          linkString += ','
        }
      }
    }
    // show all gene sets
    else{
      // TODO:

    }
  }


  linkString += ']'

  let encodedUri = encodeURI(linkString)
  let heatmapUrl = '&heatmap='+encodeURI(JSON.stringify(samplesJson))
  let finalLink = XENA_SS_LINK + encodedUri.replace(/:/g,'%3A').replace(/\//g,'%2F').replace(/,/g,'%2C')
  finalLink += heatmapUrl
  return finalLink
}
