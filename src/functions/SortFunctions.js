import update from 'immutability-helper'
import { sumInstances, sumGeneExpression, sumParadigm} from './MathFunctions'
import {VIEW_ENUM} from '../data/ViewEnum'
import {isViewGeneExpression} from './DataFunctions'
import {SORT_ENUM} from '../data/SortEnum'

export function transpose(a) {
  // return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });
  // or in more modern dialect
  return a.length === 0 ? a : a[0].map((_, c) => a.map((r) => r[c]))
}


export function scoreColumns(prunedColumns) {
  return prunedColumns.pathways.map((el, index) => update(el, {
    samplesAffected: { $set: sumInstances(prunedColumns.data[index]) },
    index: { $set: index },
  }))
}

export function scoreParadigmColumns(prunedColumns) {
  return prunedColumns.pathways.map((el, index) => update(el, {
    // NOTE: a bit of a hack, but allows us to pass color through
    samplesAffected: { $set: sumParadigm(prunedColumns.data[index])/prunedColumns.data[index].length },
    index: { $set: index },
  }))
}

export function scoreGeneExpressionColumns(prunedColumns) {
  return prunedColumns.pathways.map((el, index) => update(el, {
    // NOTE: a bit of a hack, but allows us to pass color through
    samplesAffected: { $set: sumGeneExpression(prunedColumns.data[index])/prunedColumns.data[index].length },
    index: { $set: index },
  }))
}

/**
 * Populates density for each column
 * @param prunedColumns
 */
function sortColumnDensities(prunedColumns) {
  const pathways = scoreColumns(prunedColumns).sort((a, b) => b.samplesAffected - a.samplesAffected)
  return update(prunedColumns, {
    pathways: { $set: pathways },
    data: { $set: pathways.map((el) => prunedColumns.data[el.index]) },
  })
}

export function sortBySamples(renderedData,sampleOrder) {
  return renderedData.sort((a, b) => {
    return sampleOrder.indexOf(a[0].sample)-sampleOrder.indexOf(b[0].sample)
  })
}

export function sortByTypeScore(renderedData) {
  // sort samples first based on what gene in position 1 has the highest value
  // proceed to each gene
  return renderedData.sort((a, b) => {
    // a = sample of a.length -1 genes"paradigm": 0,
    for (let index = 0; index < a.length; ++index) {
      if (b[index].paradigm !== a[index].paradigm) return b[index].paradigm - a[index].paradigm
      if (b[index].geneExpression !== a[index].geneExpression) return b[index].geneExpression - a[index].geneExpression
      if (b[index].cnvHigh !== a[index].cnvHigh) return b[index].cnvHigh - a[index].cnvHigh
      if (b[index].cnvLow !== a[index].cnvLow) return b[index].cnvLow - a[index].cnvLow
      if (b[index].mutation4 !== a[index].mutation4) return b[index].mutation4 - a[index].mutation4
      if (b[index].mutation3 !== a[index].mutation3) return b[index].mutation3 - a[index].mutation3
      if (b[index].mutation2 !== a[index].mutation2) return b[index].mutation2 - a[index].mutation2
    }
    // sort by sample name
    return a[a.length - 1] - b[b.length - 1]
  })
}

/**
 * Sort by column density followed by row.
 * https://github.com/nathandunn/XenaGoWidget/issues/67
 *
 * 1. find density for each column
 * 2. sort the tissues based on first, most dense column, ties, based on next most dense column
 *
 * 3. sort / re-order column based on density (*) <- re-ordering is going to be a pain, do last
 *
 * @param prunedColumns
 * @returns {undefined}
 */
export function clusterSort(prunedColumns) {
  const sortedColumns = sortColumnDensities(prunedColumns)

  sortedColumns.data.push(prunedColumns.samples)
  let renderedData = transpose(sortedColumns.data)
  renderedData = sortByTypeScore(renderedData)
  renderedData = transpose(renderedData)
  const returnColumns = {}
  returnColumns.sortedSamples = renderedData[renderedData.length - 1]
  returnColumns.samples = sortedColumns.samples
  returnColumns.pathways = sortedColumns.pathways
  returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1)

  return returnColumns
}

/**
 * Populates density for each column
 * @param prunedColumns
 * @param reverse
 */
function sortPathwaysDiffs(prunedColumns, reverse) {
  reverse = reverse || false
  const pathways = prunedColumns.pathways.sort((a, b) => (b.diffScore - a.diffScore) * (reverse ? -1 : 1))
  return update(prunedColumns, {
    pathways: { $set: pathways },
    data: { $set: pathways.map((el) => prunedColumns.data[el.index]) },
  })
}

/**
 * Same as the cluster sort, but we don't sort by pathways at all, we just re-order samples
 * @param prunedColumns
 * @param sampleOrder
 */
export function diffSort(prunedColumns,sampleOrder) {
  const sortedColumns = sortPathwaysDiffs(prunedColumns)
  sortedColumns.data.push(prunedColumns.samples)
  let renderedData = transpose(sortedColumns.data)
  renderedData = transpose(sortBySamples(renderedData,sampleOrder))
  const returnColumns = {}
  returnColumns.sortedSamples = renderedData[renderedData.length - 1]
  returnColumns.samples = sortedColumns.samples
  returnColumns.pathways = sortedColumns.pathways
  returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1)
  return returnColumns
}

export function scorePathway(p,sortBy) {
  switch (SORT_ENUM[sortBy]) {
  case SORT_ENUM.TOTAL:
    return (p.firstGeneExpressionPathwayActivity + p.secondGeneExpressionPathwayActivity).toFixed(2)
  case SORT_ENUM.CONTRAST_DIFF:
    // if it a positive, then there is no contrast so multiple by 0.5 to emphasize contrast
    return ((p.firstGeneExpressionPathwayActivity * p.secondGeneExpressionPathwayActivity) < 0 ? 1 : 0.5) * Math.abs(p.firstGeneExpressionPathwayActivity - p.secondGeneExpressionPathwayActivity).toFixed(2)
  case SORT_ENUM.ABS_DIFF:
    return Math.abs(p.firstGeneExpressionPathwayActivity - p.secondGeneExpressionPathwayActivity).toFixed(2)
  case SORT_ENUM.DIFF:
  default:
    return (p.firstGeneExpressionPathwayActivity - p.secondGeneExpressionPathwayActivity).toFixed(2)
  }
}


function generateMissingColumns(pathways, geneList) {
  const pathwayGenes = pathways.map((p) => p.gene[0])
  const missingGenes = geneList.filter((g) => pathwayGenes.indexOf(g) < 0)
  const returnColumns = []
  missingGenes.forEach((mg) => {
    const newPathway = {
      density: 0,
      goid: pathways[0].goid,
      golabel: pathways[0].golabel,
      index: -1,
      gene: [mg],
    }
    returnColumns.push(newPathway)
  })

  return returnColumns
}

function scoreGenePrunedColumns(prunedColumns, view) {
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return scoreGeneExpressionColumns(prunedColumns)
  case VIEW_ENUM.PARADIGM:
    return scoreParadigmColumns(prunedColumns)
  default:
    return scoreColumns(prunedColumns)
  }
}

export function synchronizedSort(prunedColumns, geneList, rescore,view) {
  rescore = rescore === undefined ? true : rescore
  let pathways
  if(rescore){
    pathways =  scoreGenePrunedColumns(prunedColumns,view)
  }
  else{
    pathways =  prunedColumns.pathways
  }
  const missingColumns = generateMissingColumns(pathways, geneList)
  pathways = [...pathways, ...missingColumns]
  pathways.sort((a, b) => {
    const geneA = a.gene[0]
    const geneB = b.gene[0]
    const index1 = geneList.indexOf(geneA)
    const index2 = geneList.indexOf(geneB)

    if (index1 >= 0 && index2 >= 0) {
      return geneList.indexOf(geneA) - geneList.indexOf(geneB)
    }
    return b.samplesAffected - a.samplesAffected
  })
  // refilter data by index
  const columnLength = prunedColumns.data[0].length
  const data = pathways.map((el) => {
    const columnData = prunedColumns.data[el.index]
    if (columnData) {
      return columnData
    }
    return Array.from(Array(columnLength), () => 0)
  })
  data.push(prunedColumns.samples)
  let renderedData = transpose(data)
  renderedData = sortByTypeScore(renderedData)
  renderedData = transpose(renderedData)
  return {
    sortedSamples: renderedData[renderedData.length - 1],
    samples: prunedColumns.samples,
    pathways,
    data: renderedData.slice(0, data.length - 1),
  }
}

/**
 * Lookup the samples for both and create an index based on the first sample set
 * @param sortedSample
 * @param geneDatum
 * @returns {*}
 */
function sortDataBySampleOrder(sortedSample, geneDatum) {
  const sampleIndices = geneDatum.samples.map( s => sortedSample.indexOf(s) )
  let transposedData  = transpose(geneDatum.geneExpression)
  // transposedData =
  // switch(view){
  // case VIEW_ENUM.PARADIGM:
  // case VIEW_ENUM.REGULON:
  // case VIEW_ENUM.GENE_EXPRESSION:
  //   transposedData = transpose(geneDatum.geneExpression);
  //   break;
  // default:
  //   // eslint-disable-next-line no-console
  //   console.error('not sure what to do here',view,geneDatum,sortedSample);
  // }
  let sortedData = new Array(transposedData.length)
  for(let dataIndex in transposedData){
    sortedData[dataIndex] = transposedData[sampleIndices[dataIndex]]
  }

  return update(geneDatum,{
    paradigm: {$set: transpose(sortedData)},
  })
}

export function sortGeneDataWithSamples(sortedSamples,geneData){
  return [
    sortDataBySampleOrder(sortedSamples[0],geneData[0]),
    sortDataBySampleOrder(sortedSamples[1],geneData[1]),
  ]
}


function sortByIndexOrder(associatedDatum, indexedPathway) {
  let newAssociatedData = new Array(associatedDatum.length)
  for(let index in associatedDatum){
    newAssociatedData[index] = associatedDatum[indexedPathway[index].originalIndex]
  }
  return newAssociatedData
}

/**
 * For each pathway,
 * @param selectedPathway
 * @param associatedData
 * @param view
 * @returns {null|*}
 */
export function sortAssociatedData(selectedPathway,associatedData,view){

  // find the selected pathway and sor that sample based on the sample . .
  const realizedPathway = associatedData.filter( d => d[0].golabel === selectedPathway.golabel )
  const indexedPathway = realizedPathway[0].map( (p,i) => {
    p.originalIndex = i
    return p
  }).sort( (a,b) => {
    if(isViewGeneExpression(view)){
      if(b.geneExpressionPathwayActivity === 'NaN' && a.geneExpressionPathwayActivity !== 'NaN') return -1
      if(b.geneExpressionPathwayActivity !== 'NaN' && a.geneExpressionPathwayActivity === 'NaN') return 1
      if(b.geneExpressionPathwayActivity === 'NaN' && a.geneExpressionPathwayActivity === 'NaN') return b.geneExpression - a.geneExpression
      return b.geneExpressionPathwayActivity - a.geneExpressionPathwayActivity
    }
    else{
      // TODO: verify this filter
      return b.total - a.total
    }
    // return  0 ;
  })
  // create a sorted index

  let newAssociatedData = new Array(associatedData.length)
  for(let index in associatedData){
    newAssociatedData[index] = sortByIndexOrder( associatedData[index] , indexedPathway )
  }
  return  newAssociatedData
}
