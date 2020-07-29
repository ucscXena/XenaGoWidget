import {VIEW_ENUM} from '../data/ViewEnum'

const XENA_SS_LINK = 'https://xenabrowser.net/heatmap/'
const MAX_PATHWAYS = 20
const MAX_GENES = 60

export function generateXenaLink(props){
  const cohort = props.cohort[props.cohortIndex]
  const samples = props.pathwayData[props.cohortIndex].samples

  console.log('cohort',cohort)

  let samplesJson = {
    showWelcome: false,
  }
  if(samples.length < 100 ){
    samplesJson.searchSampleList= samples
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
    console.log('import cohort',cohort,props)
    const geneExpressionDataset = cohort.paradigm.dataset
    const geneExpressionHost = cohort.paradigm.host
    const geneExpressionActivityDataset = cohort.paradigmPathwayActivity.dataset
    const geneExpressionActivityHost = cohort.paradigmPathwayActivity.host
    if(props.open){
      // TODO:
      // linkString += `{"name":"${geneExpressionActivityDataset}","host":"${geneExpressionActivityHost}","fields":"${selectedGeneSet}","columnLabel":"Paradigm IPL","fieldLabel":"${selectedGeneSet}"}`
      // linkString += ','
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
    // const cnvBackgroundDataset = cohort.genomeBackgroundCopyNumber.dataset
    // const cnvBackgroundHost = cohort.genomeBackgroundCopyNumber.host
    if(props.open){
      // linkString += `{"name":"${cnvBackgroundDataset}","host":"${cnvBackgroundHost}","fields":"${selectedGeneSet}","columnLabel":"CNV","fieldLabel":"${selectedGeneSet}"}`
      // linkString += ','
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
      linkString += `{"name":"${mutationDataSet}","host":"${mutationHost}","fields":"${genes}","columnLabel":"Gene View","fieldLabel":"${genes.length} genes"}`
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
      linkString += `{"name":"${mutationDataSet}","host":"${mutationHost}","fields":"${genes}","columnLabel":"Somatic Mutation","fieldLabel":"${genes.length} genes"}`
    }
    // show all gene sets
    else{
      // TODO:

    }
  }


  // // TODO: add filter column for samples
  //
  // linkString += `{"name":"${geneExpressionDataset}","host":"${geneExpressionHost}","fields":"${genes}","columnLabel":"Gene Set View","fieldLabel":"${genes.length} genes"}`
  // linkString += ','
  // linkString += `{"name":"${cnvDataset}","host":"${cnvHost}","fields":"${genes}","columnLabel":"CNV","fieldLabel":"${genes.length} genes"}`
  // linkString += ','
  // linkString += `{"name":"${mutationDataSet}","host":"${mutationHost}","fields":"${genes}","columnLabel":"Somatic Mutation","fieldLabel":"${genes.length} genes"}`

  // // show them individually
  // let count = 0
  // const geneSplit = genes.split(' ')
  // // console.log('# of genes ',geneSplit.length)
  // for(const g of geneSplit){
  //   if(count < 1){
  //     // console.log('gene',g)
  //     if(count < geneSplit.length-1){
  //       linkString += ','
  //     }
  //     linkString += `{"name":"${geneExpressionDataset}","host":"${geneExpressionHost}","fields":"${g}","columnLabel":"Gene ${g}","fieldLabel":"Individual Gene expression for ${g}"}`
  //     linkString += ','
  //     linkString += `{"name":"${cnvDataset}","host":"${cnvHost}","fields":"${g}","columnLabel":"Gene ${g}","fieldLabel":"Individual CNV ${g}"}`
  //     linkString += ','
  //     linkString += `{"name":"${mutationDataSet}","host":"${mutationHost}","fields":"${g}","columnLabel":"Gene ${g}","fieldLabel":"Individual Mutation ${g}"}`
  //   }
  //   ++count
  // }
  linkString += ']'

  // add gene link
  // console.log('link string: ',linkString)

  // <a id="link1" href="https://xenabrowser.net/heatmap/?columns=%5B%7B%22name%22%3A%22tcga_Kallisto_tpm%22%2C%22host%22%3A%22https%3A%2F%2Ftoil.xenahubs.net%22%2C%22fields%22%3A%22TP53%20FOXM1%22%7D%5D">Example 1</a>
  // https://xenabrowser.net/heatmap/?columns=%5B%7B%22name%22:%22Gene%20Details%22,%22host%22:%22https://toil.xenahubs.net%22,%22fields%22:%22TP53%20FOXM1%22%7D%5D
  // https://xenabrowser.net/heatmap/?columns=%5B%7B%22name%22%3A%22tcga_Kallisto_tpm%22%2C%22host%22%3A%22https%3A%2F%2Ftoil.xenahubs.net%22%2C%22fields%22%3A%22TP53%20FOXM1%22%7D%5D

  let encodedUri = encodeURI(linkString)
  // console.log('input samples json',samplesJson)
  let heatmapUrl = '&heatmap='+encodeURI(JSON.stringify(samplesJson))
  let finalLink = XENA_SS_LINK + encodedUri.replace(/:/g,'%3A').replace(/\//g,'%2F').replace(/,/g,'%2C')
  finalLink += heatmapUrl
  // console.log(finalLink)
  return finalLink
}
