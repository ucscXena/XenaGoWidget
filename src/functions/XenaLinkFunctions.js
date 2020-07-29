import {VIEW_ENUM} from '../data/ViewEnum'

const XENA_SS_LINK = 'https://xenabrowser.net/heatmap/'

export function generateXenaLink(props){
  // const geneExpressionHost = getHostForGeneData(props.cohort[props.cohortIndex], this.props.view)
  // const cnvHost = getHostForGeneData(props.cohort[props.cohortIndex], this.props.view)
  // const mutationHost = getHostForGeneData(props.cohort[props.cohortIndex], this.props.view)

  const cohort = props.cohort[props.cohortIndex]
  // console.log('cohort',cohort)
  // console.log('props',props)
  const samples = props.pathwayData[props.cohortIndex].samples
  console.log('# of samples',samples.length)

  let samplesJson = {
    showWelcome: false,
  }
  if(samples.length < 100 ){
    samplesJson.searchSampleList= samples
  }
  // filter: samples,

  // console.log('samples',samples)
  let geneExpressionDataset = cohort.geneExpression.dataset
  let geneExpressionHost = cohort.geneExpression.host
  let cnvDataset = cohort.copyNumberDataSetId
  let cnvHost = cohort.host
  const mutationDataSet= cohort.mutationDataSetId
  const mutationHost = cohort.host

  let linkString = ''

  let genes = props.open ? props.geneDataStats[props.cohortIndex].pathways.map( p => p.gene[0]) : []
  // console.log('genes',genes)
  linkString += '?columns=['
  if(props.view === VIEW_ENUM.GENE_EXPRESSION){
    // show selected gene set and all genes in another columns
    if(props.open){
      // TODO:
      linkString += `{"name":"${geneExpressionDataset}","host":"${geneExpressionHost}","fields":"${genes}","columnLabel":"Gene View","fieldLabel":"${genes.length} genes"}`
    }
    // show all gene sets
    else{
      // TODO:

    }
  }
  else
  if(props.view === VIEW_ENUM.COPY_NUMBER){
    // show selected gene set and all genes in another columns
    if(props.open){
      // TODO:
      linkString += `{"name":"${cnvDataset}","host":"${cnvHost}","fields":"${genes}","columnLabel":"CNV","fieldLabel":"${genes.length} genes"}`
    }
    // show all gene sets
    else{
      // TODO:

    }
  }
  else
  if(props.view === VIEW_ENUM.MUTATION){
    // show selected gene set and all genes in another columns
    if(props.open){
      // TODO:
      linkString += `{"name":"${geneExpressionDataset}","host":"${geneExpressionHost}","fields":"${genes}","columnLabel":"Gene View","fieldLabel":"${genes.length} genes"}`
    }
    // show all gene sets
    else{
      // TODO:

    }
  }
  else
  if(props.view === VIEW_ENUM.CNV_MUTATION){
    // show selected gene set and all genes in another columns
    if(props.open){
      // TODO:
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
