import update from 'immutability-helper';
import {sumTotals, sumInstances, sumGeneExpression, sumParadigm} from './MathFunctions';
import {VIEW_ENUM} from '../data/ViewEnum';

export const SortType = {
  DIFF: 'diff',
  CLUSTER: 'cluster',
};

export function transpose(a) {
  // return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });
  // or in more modern dialect
  return a.length === 0 ? a : a[0].map((_, c) => a.map((r) => r[c]));
}


export function scoreColumns(prunedColumns) {
  return prunedColumns.pathways.map((el, index) => update(el, {
    samplesAffected: { $set: sumInstances(prunedColumns.data[index]) },
    index: { $set: index },
  }));
}

export function scoreParadigmColumns(prunedColumns) {
  return prunedColumns.pathways.map((el, index) => update(el, {
    // NOTE: a bit of a hack, but allows us to pass color through
    samplesAffected: { $set: sumParadigm(prunedColumns.data[index])/prunedColumns.data[index].length },
    index: { $set: index },
  }));
}

export function scoreGeneExpressionColumns(prunedColumns) {
  return prunedColumns.pathways.map((el, index) => update(el, {
    // NOTE: a bit of a hack, but allows us to pass color through
    samplesAffected: { $set: sumGeneExpression(prunedColumns.data[index])/prunedColumns.data[index].length },
    index: { $set: index },
  }));
}

/**
 * Populates density for each column
 * @param prunedColumns
 */
function sortColumnDensities(prunedColumns) {
  const pathways = scoreColumns(prunedColumns).sort((a, b) => b.samplesAffected - a.samplesAffected);
  return update(prunedColumns, {
    pathways: { $set: pathways },
    data: { $set: pathways.map((el) => prunedColumns.data[el.index]) },
  });
}

/**
 * Populates density for each column
 * @param prunedColumns
 */
function sortParadigm(prunedColumns) {
  const pathways = scoreParadigmColumns(prunedColumns).sort((a, b) => b.paradigmMean - a.paradigmMean);
  return update(prunedColumns, {
    pathways: { $set: pathways },
    data: { $set: pathways.map((el) => prunedColumns.data[el.index]) },
  });
}

/**
 * Populates density for each column
 * @param prunedColumns
 */
function sortGeneExpression(prunedColumns) {
  const pathways = scoreGeneExpressionColumns(prunedColumns).sort((a, b) => b.geneExpressionMean - a.geneExpressionMean);
  return update(prunedColumns, {
    pathways: { $set: pathways },
    data: { $set: pathways.map((el) => prunedColumns.data[el.index]) },
  });
}

export function sortByType(renderedData) {
  // sort samples first based on what gene in position 1 has the highest value
  // proceed to each gene
  return renderedData.sort((a, b) => {
    // a = sample of a.length -1 genes"paradigm": 0,
    for (let index = 0; index < a.length; ++index) {
      if (b[index].paradigm !== a[index].paradigm) return b[index].paradigm - a[index].paradigm;
      if (b[index].geneExpression !== a[index].geneExpression) return b[index].geneExpression - a[index].geneExpression;
      if (b[index].cnvHigh !== a[index].cnvHigh) return b[index].cnvHigh - a[index].cnvHigh;
      if (b[index].cnvLow !== a[index].cnvLow) return b[index].cnvLow - a[index].cnvLow;
      if (b[index].mutation4 !== a[index].mutation4) return b[index].mutation4 - a[index].mutation4;
      if (b[index].mutation3 !== a[index].mutation3) return b[index].mutation3 - a[index].mutation3;
      if (b[index].mutation2 !== a[index].mutation2) return b[index].mutation2 - a[index].mutation2;
    }
    // sort by sample name
    return a[a.length - 1] - b[b.length - 1];
  });
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
export function geneExpressionSort(prunedColumns) {
  const sortedColumns = sortGeneExpression(prunedColumns);
  sortedColumns.data.push(prunedColumns.samples);
  let renderedData = transpose(sortedColumns.data);
  renderedData = sortByType(renderedData);
  renderedData = transpose(renderedData);
  const returnColumns = {};
  returnColumns.sortedSamples = renderedData[renderedData.length - 1];
  returnColumns.samples = sortedColumns.samples;
  returnColumns.pathways = sortedColumns.pathways;
  returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);
  return returnColumns;
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
export function paradigmSort(prunedColumns) {
  const sortedColumns = sortParadigm(prunedColumns);
  sortedColumns.data.push(prunedColumns.samples);
  let renderedData = transpose(sortedColumns.data);
  renderedData = sortByType(renderedData);
  renderedData = transpose(renderedData);
  const returnColumns = {};
  returnColumns.sortedSamples = renderedData[renderedData.length - 1];
  returnColumns.samples = sortedColumns.samples;
  returnColumns.pathways = sortedColumns.pathways;
  returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);
  return returnColumns;
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
  const sortedColumns = sortColumnDensities(prunedColumns);

  sortedColumns.data.push(prunedColumns.samples);
  let renderedData = transpose(sortedColumns.data);
  renderedData = sortByType(renderedData);
  renderedData = transpose(renderedData);
  const returnColumns = {};
  returnColumns.sortedSamples = renderedData[renderedData.length - 1];
  returnColumns.samples = sortedColumns.samples;
  returnColumns.pathways = sortedColumns.pathways;
  returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);

  return returnColumns;
}

/**
 * Populates density for each column
 * @param prunedColumns
 * @param reverse
 */
function sortPathwaysDiffs(prunedColumns, reverse) {
  reverse = reverse || false;
  const pathways = prunedColumns.pathways.sort((a, b) => (b.diffScore - a.diffScore) * (reverse ? -1 : 1));
  return update(prunedColumns, {
    pathways: { $set: pathways },
    data: { $set: pathways.map((el) => prunedColumns.data[el.index]) },
  });
}

/**
 * Same as the cluster sort, but we don't sort by pathways at all, we just re-order samples
 * @param prunedColumns
 * @param sortType
 */
export function diffSort(prunedColumns,sortType) {
  // console.log('diffsort input',JSON.stringify(prunedColumns),prunedColumns)
  const sortedColumns = sortPathwaysDiffs(prunedColumns);
  sortedColumns.data.push(prunedColumns.samples);
  let renderedData = transpose(sortedColumns.data);
  if(sortType==='SORT_BY_TYPE'){
    renderedData = sortByType(renderedData);
  }
  else
  if(sortType==='INVERSE'){
    // console.log('diff sort',sortType)
    renderedData = renderedData.reverse();
  }
  // else, no transform


  renderedData = transpose(renderedData);
  const returnColumns = {};
  returnColumns.sortedSamples = renderedData[renderedData.length - 1];
  returnColumns.samples = sortedColumns.samples;
  returnColumns.pathways = sortedColumns.pathways;
  returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);

  // console.log('diffsort output',JSON.stringify(prunedColumns),prunedColumns)

  return returnColumns;
}

/**
 * Same as the cluster sort, but we don't sort by pathways at all, we just re-order samples
 * @param prunedColumns
 */
export function clusterSampleSort(prunedColumns) {
  // prunedColumns =
  // - data = 41 gene sets times N samples
  // - pathways = 41 gene set descriptions
  // - samples = N sample descriptions
  const transposedData = transpose(prunedColumns.data);
  const summedSamples = transposedData.map((d, index) => ({ index, score: sumTotals(d) })).sort((a, b) => b.score - a.score);
  const sortedTransposedData = [];
  summedSamples.forEach((d, i) => {
    sortedTransposedData[i] = transposedData[d.index];
  });
  const unTransposedData = transpose(sortedTransposedData);
  const returnColumns = prunedColumns;
  returnColumns.data = unTransposedData;
  return returnColumns;
}

function sortWithIndeces(toSort) {
  for (var i = 0; i < toSort.length; i++) {
    toSort[i] = [toSort[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? 1 : -1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort;
}

export function scorePathway(p,sortBy) {
  switch (sortBy) {
  case 'Total':
    return (p.firstGeneExpressionPathwayActivity + p.secondGeneExpressionPathwayActivity).toFixed(2);
  case 'AbsDiff':
    return Math.abs(p.firstGeneExpressionPathwayActivity - p.secondGeneExpressionPathwayActivity).toFixed(2);
  case 'Diff':
  default:
    return (p.firstGeneExpressionPathwayActivity - p.secondGeneExpressionPathwayActivity).toFixed(2);
  }
}

export function sortSampleActivity(filter, prunedColumns, selectedGeneSet) {
  console.log('sorting sample activity',filter,prunedColumns,selectedGeneSet);
  switch (filter) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return selectedSampleGeneExpressionActivitySort(prunedColumns,selectedGeneSet);
  case VIEW_ENUM.PARADIGM:
    return selectedSampleParadigmActivitySort(prunedColumns,selectedGeneSet);
  default:
    return clusterSampleSort(prunedColumns);
  }
}

/**
 * Sorts based on a selected sample
 * @param prunedColumns
 * @param selectedGeneSet
 * @returns {*}
 */
export function selectedSampleParadigmActivitySort(prunedColumns, selectedGeneSet) {
  let selectedPathwayIndex = prunedColumns.pathways.findIndex( p => selectedGeneSet.pathway.golabel === p.golabel);
  if(selectedPathwayIndex<0) selectedPathwayIndex = 0 ;
  // console.log('data',prunedColumns);
  const selectedData = prunedColumns.data[selectedPathwayIndex].map( p => p.paradigmPathwayActivity);
  sortWithIndeces( selectedData);
  const sortedIndices = selectedData.sortIndices;

  // prunedColumns =
  // - data = 41 gene sets times N samples
  // - pathways = 41 gene set descriptions
  // - samples = N sample descriptions
  const transposedData = transpose(prunedColumns.data);

  // for the transposed data sort by sortedIndexes
  // const summedSamples = transposedData.map((d, index) => ({ index, score: sumTotals(d) })).sort((a, b) => b.score - a.score);
  const sortedTransposedData = [];
  sortedIndices.forEach((d, i) => {
    sortedTransposedData[i] = transposedData[d];
  });
  const unTransposedData = transpose(sortedTransposedData);
  const returnColumns = prunedColumns;
  returnColumns.data = unTransposedData;
  return returnColumns;
}

/**
 * Sorts based on a selected sample
 * @param prunedColumns
 * @param selectedGeneSet
 * @returns {*}
 */
export function selectedSampleGeneExpressionActivitySort(prunedColumns, selectedGeneSet) {

  let selectedPathwayIndex = prunedColumns.pathways.findIndex( p => selectedGeneSet.pathway.golabel === p.golabel);
  if(selectedPathwayIndex<0) selectedPathwayIndex = 0 ;
  const selectedData = prunedColumns.data[selectedPathwayIndex].map( p => p.geneExpressionPathwayActivity);
  sortWithIndeces( selectedData);
  const sortedIndices = selectedData.sortIndices;

  // prunedColumns =
  // - data = 41 gene sets times N samples
  // - pathways = 41 gene set descriptions
  // - samples = N sample descriptions
  const transposedData = transpose(prunedColumns.data);

  // for the transposed data sort by sortedIndexes
  // const summedSamples = transposedData.map((d, index) => ({ index, score: sumTotals(d) })).sort((a, b) => b.score - a.score);
  const sortedTransposedData = [];
  sortedIndices.forEach((d, i) => {
    sortedTransposedData[i] = transposedData[d];
  });
  const unTransposedData = transpose(sortedTransposedData);
  const returnColumns = prunedColumns;
  returnColumns.data = unTransposedData;
  return returnColumns;
}

function generateMissingColumns(pathways, geneList) {
  const pathwayGenes = pathways.map((p) => p.gene[0]);
  const missingGenes = geneList.filter((g) => pathwayGenes.indexOf(g) < 0);
  const returnColumns = [];
  missingGenes.forEach((mg) => {
    const newPathway = {
      density: 0,
      goid: pathways[0].goid,
      golabel: pathways[0].golabel,
      index: -1,
      gene: [mg],
    };
    returnColumns.push(newPathway);
  });

  return returnColumns;
}

function scoreGenePrunedColumns(prunedColumns, view) {
  switch (view) {
  case VIEW_ENUM.GENE_EXPRESSION:
    return scoreGeneExpressionColumns(prunedColumns);
  case VIEW_ENUM.PARADIGM:
    return scoreParadigmColumns(prunedColumns);
  default:
    return scoreColumns(prunedColumns);
  }
}

export function synchronizedSort(prunedColumns, geneList, rescore,view) {
  rescore = rescore === undefined ? true : rescore;
  let pathways;
  if(rescore){
    pathways =  scoreGenePrunedColumns(prunedColumns,view);
  }
  else{
    pathways =  prunedColumns.pathways;
  }
  const missingColumns = generateMissingColumns(pathways, geneList);
  pathways = [...pathways, ...missingColumns];
  pathways.sort((a, b) => {
    const geneA = a.gene[0];
    const geneB = b.gene[0];
    const index1 = geneList.indexOf(geneA);
    const index2 = geneList.indexOf(geneB);

    if (index1 >= 0 && index2 >= 0) {
      return geneList.indexOf(geneA) - geneList.indexOf(geneB);
    }
    return b.samplesAffected - a.samplesAffected;
  });
  // refilter data by index
  const columnLength = prunedColumns.data[0].length;
  const data = pathways.map((el) => {
    const columnData = prunedColumns.data[el.index];
    if (columnData) {
      return columnData;
    }
    return Array.from(Array(columnLength), () => 0);
  });
  data.push(prunedColumns.samples);
  let renderedData = transpose(data);
  renderedData = sortByType(renderedData);
  renderedData = transpose(renderedData);
  return {
    sortedSamples: renderedData[renderedData.length - 1],
    samples: prunedColumns.samples,
    pathways,
    data: renderedData.slice(0, data.length - 1),
  };
}

function sortDataBySampleOrder(sortedSample, geneDatum) {
  console.log('sorted samples',sortedSample,geneDatum);

  return geneDatum ;
}

export function sortGeneDataWithSamples(sortedSamples,geneData){
  return [
    sortDataBySampleOrder(sortedSamples[0],geneData[0]),
    sortDataBySampleOrder(sortedSamples[1],geneData[1]),
  ];
}

// function sortWithIndeces(toSort) {
//   for (var i = 0; i < toSort.length; i++) {
//     toSort[i] = [toSort[i], i];
//   }
//   toSort.sort(function(left, right) {
//     return left[0] < right[0] ? 1 : -1;
//   });
//   toSort.sortIndices = [];
//   for (var j = 0; j < toSort.length; j++) {
//     toSort.sortIndices.push(toSort[j][1]);
//     toSort[j] = toSort[j][0];
//   }
//   return toSort;
// }

function sortByIndexOrder(associatedDatum, indexedPathway) {
  let newAssociatedData = new Array(associatedDatum.length);
  for(let index in associatedDatum){
    newAssociatedData[index] = associatedDatum[indexedPathway[index].originalIndex] ;
    // console.log('from',associatedDatum,index,associatedDatum[index]);
    // console.log('to',newAssociatedData,indexedPathway,indexedPathway.originalIndex,newAssociatedData[indexedPathway.originalIndex]);
  }
  // console.log('ass data',associatedDatum,indexedPathway,newAssociatedData);
  return newAssociatedData ;
  // return associatedDatum.sort( (a,b) => a.originalIndex - b.originalIndex );
}

/**
 * For each pathway,
 * @param selectedPathway
 * @param associatedData
 * @param filter
 * @returns {null|*}
 */
export function sortAssociatedData(selectedPathway,associatedData,filter){

  // find the selected pathway and sor that sample based on the sample . .
  // console.log('input ass data',associatedData,selectedPathway,filter);
  const realizedPathway = associatedData.filter( d => d[0].golabel === selectedPathway.golabel );
  const indexedPathway = realizedPathway[0].map( (p,i) => {
    p.originalIndex = i ;
    return p ;
  }).sort( (a,b) => {
    // TODO: map for other filters
    if(filter===VIEW_ENUM.PARADIGM){
      return b.paradigmPathwayActivity - a.paradigmPathwayActivity;
    }
    else
    if(filter===VIEW_ENUM.GENE_EXPRESSION){
      return b.geneExpressionPathwayActivity - a.geneExpressionPathwayActivity;
    }
    else{
      console.error('verify this filter',filter);
      return b.total - a.total;
    }
    // return  0 ;
  });
  // create a sorted index

  let newAssociatedData = new Array(associatedData.length);
  for(let index in associatedData){
    newAssociatedData[index] = sortByIndexOrder( associatedData[index] , indexedPathway );
  }
  // console.log('output realized data',realizedPathway[0],indexedPathway);
  // console.log('newAssociatedData',associatedData,newAssociatedData);
  return  newAssociatedData;
}
