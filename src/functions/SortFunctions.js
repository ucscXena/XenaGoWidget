import update from 'immutability-helper';
import { sumTotals, sumInstances } from './MathFunctions';

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

export function sortByType(renderedData) {
  // sort samples first based on what gene in position 1 has the highest value
  // proceed to each gene
  return renderedData.sort((a, b) => {
    // a = sample of a.length -1 genes
    // b = sample of b.length -1 genes
    for (let index = 0; index < a.length; ++index) {
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
 */
export function diffSort(prunedColumns) {
  // console.log('diffsort input',JSON.stringify(prunedColumns),prunedColumns)
  const sortedColumns = sortPathwaysDiffs(prunedColumns);
  sortedColumns.data.push(prunedColumns.samples);
  let renderedData = transpose(sortedColumns.data);
  renderedData = sortByType(renderedData);
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

export function synchronizedSort(prunedColumns, geneList, rescore) {
  rescore = rescore === undefined ? true : rescore;
  let pathways = rescore ? scoreColumns(prunedColumns) : prunedColumns.pathways;
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
