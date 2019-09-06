import {
  sum, times, memoize, range
} from 'ucsc-xena-client/dist/underscore_ext';
import { izip } from 'itertools';
import lru from 'tiny-lru/lib/tiny-lru.es5';
import update from 'immutability-helper';
import mutationScores from '../data/mutationVector';
import { sumInstances, sumTotals } from './MathFunctions';
import { MIN_FILTER } from '../components/XenaGeneSetApp';
import { getGenesForNamedPathways } from './CohortFunctions';
import {
  clusterSort, diffSort, scoreColumns, synchronizedSort,
} from './SortFunctions';
import {FILTER_ENUM} from '../components/FilterSelector';

export const DEFAULT_AMPLIFICATION_THRESHOLD = 2;
export const DEFAULT_DELETION_THRESHOLD = -2;
const GENE_EXPRESSION_MIN = 12;

const associateCache = lru(500);
const pruneDataCache = lru(500);

// NOTE: this should be false for production.
const ignoreCache = false ;

export const DEFAULT_DATA_VALUE = {
  total: 0, mutation: 0, cnv: 0, mutation4: 0, mutation3: 0, mutation2: 0, cnvHigh: 0, cnvLow: 0,
};


export function average(data){
  let sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  return sum / data.length;
}

export function cleanData(array1,array2){
  return [...array1.filter( a => !isNaN(a)),...array2.filter( a => !isNaN(a))];
}

export function generateGeneExpressionStats(geneExpressionA, geneExpressionB){
  let geneExpressionStats = [geneExpressionA.length];
  for(const index in geneExpressionA){
    const cleanGeneExpression = cleanData(geneExpressionA[index],geneExpressionB[index]);
    const meanGeneExpression = average(cleanGeneExpression);
    const stdevGeneExpression = Math.sqrt(meanGeneExpression);
    geneExpressionStats[index] = { mean: meanGeneExpression,stdev:stdevGeneExpression };
  }
  return geneExpressionStats;
}

export function generateZScoreForGeneExpression(geneExpressionA,geneExpressionB){

  const geneExpressionStats = generateGeneExpressionStats(geneExpressionA,geneExpressionB);
  const zScoreA = geneExpressionA.map( (ge, index) => {
    const statRow = geneExpressionStats[index];
    return ge.map( (e) => {
      return (e - statRow.mean) / statRow.stdev ;
    } );
  });
  const zScoreB = geneExpressionB.map( (ge, index) => {
    const statRow = geneExpressionStats[index];
    return ge.map( (e) => {
      return (e - statRow.mean) / statRow.stdev ;
    } );
  });

  return [zScoreA,zScoreB];
}

export function getCopyNumberValue(copyNumberValue, amplificationThreshold, deletionThreshold) {
  return (!isNaN(copyNumberValue) && (copyNumberValue >= amplificationThreshold || copyNumberValue <= deletionThreshold)) ? 1 : 0;
}

export function getGeneExpressionHits(inputValue) {
  return (!isNaN(inputValue) && (inputValue>= GENE_EXPRESSION_MIN)) ? 1 : 0;
}

export function getGeneExpressionValue(inputValue) {
  return !isNaN(inputValue) ? inputValue : 0 ;
}

export function getCopyNumberHigh(copyNumberValue, amplificationThreshold) {
  return (!isNaN(copyNumberValue) && (copyNumberValue >= amplificationThreshold)) ? 1 : 0;
}

export function getCopyNumberLow(copyNumberValue, deletionThreshold) {
  return (!isNaN(copyNumberValue) && (copyNumberValue <= deletionThreshold)) ? 1 : 0;
}

/**
 * https://github.com/nathandunn/XenaGoWidget/issues/5
 * https://github.com/ucscXena/ucsc-xena-client/blob/master/js/models/mutationVector.js#L67
 Can use the scores directly or just count everything that is 4-2, and lincRNA, Complex Substitution, RNA which are all 0.
 * @param effect
 * @param min
 * @returns {*}
 */
export function getMutationScore(effect, min) {
  return (mutationScores[effect] >= min) ? 1 : 0;
}

export const getGenePathwayLookup = (pathways) => {
  const sets = pathways.map((p) => new Set(p.gene));
  const idxs = range(sets.length);
  return memoize((gene) => idxs.filter((i) => sets[i].has(gene)));
};

export const indexSamples = (samples) => {
  return new Map(samples.map((v, i) => [v, i]));
};

export function pruneColumns(data, pathways) {
  // TODO: we need to map the sum off each column
  const columnScores = data.map((d) => sum(d.total));
  const prunedPathways = pathways.filter((el, i) => columnScores[i] >= 0);
  const prunedAssociations = data.filter((el, i) => columnScores[i] >= 0);

  return {
    data: prunedAssociations,
    pathways: prunedPathways,
  };
}

export function createAssociatedDataKey(inputHash) {
  const {
    pathways, samples, filter, selectedCohort
  } = inputHash;
  return {
    filter,
    pathways,
    samples:samples.sort(),
    selectedCohort,
  };
}

export function findAssociatedData(inputHash, associatedDataKey) {
  const {
    expression, copyNumber, geneList, pathways, samples, filter, geneExpression
  } = inputHash;

  const key = JSON.stringify(associatedDataKey);
  let data = associateCache.get(key);
  if (ignoreCache || !data) {
    data = doDataAssociations(expression, copyNumber, geneExpression, geneList, pathways, samples, filter);
    associateCache.set(key, data);
  }

  return data;
}

export function findPruneData(associatedData, dataKey) {
  const key = JSON.stringify(dataKey);
  let data = pruneDataCache.get(key);
  if (ignoreCache || !data) {
    data = pruneColumns(associatedData, dataKey.pathways);
    pruneDataCache.set(key, data);
  }
  return data;
}

export function createEmptyArray(pathwayLength, sampleLength) {
  return times(pathwayLength, () => times(sampleLength, () => JSON.parse(JSON.stringify(DEFAULT_DATA_VALUE))));
}

/**
 * Converts per-sample pathway data to
 * @param pathwayData
 * @param filter
 */
export function calculateGeneSetExpected(pathwayData, filter) {
  const { genomeBackgroundCopyNumber, genomeBackgroundMutation } = pathwayData;
  // // initiate to 0
  const pathwayExpected = {};
  // init data
  for (const pathway of pathwayData.pathways) {
    pathwayExpected[pathway.golabel] = 0;
  }
  for (const sampleIndex in pathwayData.samples) {
    // TODO: if filter is all or copy number, or SNV . . etc.
    const copyNumberBackgroundExpected = genomeBackgroundCopyNumber[0][sampleIndex];
    const copyNumberBackgroundTotal = genomeBackgroundCopyNumber[1][sampleIndex];
    const mutationBackgroundExpected = genomeBackgroundMutation[0][sampleIndex];
    const mutationBackgroundTotal = genomeBackgroundMutation[1][sampleIndex];

    // TODO: add the combined filter: https://github.com/jingchunzhu/wrangle/blob/master/xenaGo/mergeExpectedHypergeometric.py#L17
    for (const pathway of pathwayData.pathways) {
      const sample_probs = [];

      if (filter === FILTER_ENUM.COPY_NUMBER || filter === FILTER_ENUM.CNV_MUTATION) {
        if(!isNaN(copyNumberBackgroundExpected) && !isNaN(copyNumberBackgroundTotal)){
          sample_probs.push(calculateExpectedProb(pathway, copyNumberBackgroundExpected, copyNumberBackgroundTotal));
        }
      }
      if (filter === FILTER_ENUM.MUTATION || filter === FILTER_ENUM.CNV_MUTATION) {
        sample_probs.push(calculateExpectedProb(pathway, mutationBackgroundExpected, mutationBackgroundTotal));
      }
      if (filter === FILTER_ENUM.GENE_EXPRESSION) {
        // TODO: add viper scores
        // sample_probs.push(this.calculateExpectedProb(pathway, mutationBackgroundExpected, mutationBackgroundTotal));
        // sample_probs.push(0);
      }
      // TODO: we should not filter out numbers
      let total_prob = addIndepProb(sample_probs.filter(Number));
      // const total_prob = addIndepProb(sample_probs);
      pathwayExpected[pathway.golabel] = pathwayExpected[pathway.golabel] + total_prob;
    }
  }

  // TODO we have an expected for the sample
  return pathwayExpected;
}

export function calculateExpectedProb(pathway, expected, total) {
  let prob = 1.0;
  const genesInPathway = pathway.gene.length;
  for (let i = 0; i < genesInPathway; i++) {
    prob = prob * (total - expected - i) / (total - i);
  }
  prob = 1 - prob;
  return prob;
}

/**
 *
 * https://github.com/jingchunzhu/wrangle/blob/master/xenaGo/chiSquare.py#L62
 * @returns {*}
 * @param observed
 * @param expected
 * @param total
 *
 */
export function scoreChiSquaredData(observed, expected, total) {
  const expected2 = total - expected;
  const observed2 = total - observed;
  let chiSquaredValue = Math.pow(expected - observed, 2.0) / expected + Math.pow(expected2 - observed2, 2.0) / expected2;
  chiSquaredValue *= ((expected > observed) ? -1 : 1);
  return chiSquaredValue;
}

// https://en.wikipedia.org/wiki/Chi-squared_test
export function scoreChiSquareTwoByTwo(observed11, observed12, observed21, observed22) {
  const rowTotal1 = observed11 + observed12;
  const rowTotal2 = observed21 + observed22;
  const columnTotal1 = observed11 + observed21;
  const columnTotal2 = observed12 + observed22;
  const total = rowTotal1 + rowTotal2;
  const expected11 = columnTotal1 * rowTotal1 / total;
  const expected12 = columnTotal2 * rowTotal1 / total;
  const expected21 = columnTotal1 * rowTotal2 / total;
  const expected22 = columnTotal2 * rowTotal2 / total;

  return Math.pow(observed11 - expected11, 2.0) / expected11
        + Math.pow(observed12 - expected12, 2.0) / expected12
        + Math.pow(observed21 - expected21, 2.0) / expected21
        + Math.pow(observed22 - expected22, 2.0) / expected22;
}

/**
 * label is just for density
 * @param score
 * @param numSamples
 * @param geneCount
 * @returns {*}
 */
export function scoreData(score, numSamples, geneCount) {
  if (score === 0) {
    return 0;
  }
  // let inputScore = score / (numSamples * geneCount);
  // return adjustScore(inputScore);
  return score / (numSamples * geneCount);
}

export function filterMutations(expression,returnArray,samples,pathways){
  const genePathwayLookup = getGenePathwayLookup(pathways);
  const sampleIndex = indexSamples(samples);
  for (const row of expression.rows) {
    const effectValue = getMutationScore(row.effect, MIN_FILTER);
    const effectScore = mutationScores[row.effect];
    const pathwayIndices = genePathwayLookup(row.gene);

    for (const index of pathwayIndices) {
      returnArray[index][sampleIndex.get(row.sample)].total += effectValue;
      returnArray[index][sampleIndex.get(row.sample)].mutation += effectValue;

      switch (effectScore) {
      case 4:
        returnArray[index][sampleIndex.get(row.sample)].mutation4 += 1;
        break;
      case 3:
        returnArray[index][sampleIndex.get(row.sample)].mutation3 += 1;
        break;
      case 2:
        returnArray[index][sampleIndex.get(row.sample)].mutation2 += 1;
        break;
      default:
      }
    }
  }
  return returnArray;
}


export function filterGeneExpression(geneExpression,returnArray,geneList,pathways){
  const genePathwayLookup = getGenePathwayLookup(pathways);

  let scored = 0 ;
  for (const gene of geneList) {
    // if we have not processed that gene before, then process
    const geneIndex = geneList.indexOf(gene);

    const pathwayIndices = genePathwayLookup(gene);
    const sampleEntries = geneExpression[geneIndex]; // set of samples for this gene

    // get pathways this gene is involved in
    for (const index of pathwayIndices) {
      // process all samples
      for (const sampleEntryIndex in sampleEntries) {
        // const returnValue = sampleEntries[sampleEntryIndex] > GENE_EXPRESSION_MIN ? 1 : 0 ;;
        const returnValue = getGeneExpressionHits(sampleEntries[sampleEntryIndex]);
        // sumTotal += sampleEntries[sampleEntryIndex];
        if (returnValue > 0) {
          ++scored ;
          returnArray[index][sampleEntryIndex].total += returnValue;
          returnArray[index][sampleEntryIndex].cnv += returnValue;
          returnArray[index][sampleEntryIndex].mutation += returnValue;
          returnArray[index][sampleEntryIndex].mutation4 += returnValue;
          // // returnArray[index][sampleEntryIndex].cnvHigh += getCopyNumberHigh(sampleEntries[sampleEntryIndex], DEFAULT_AMPLIFICATION_THRESHOLD);
          returnArray[index][sampleEntryIndex].cnvLow += returnValue;
        }
      }
    }
  }
  return {score: scored, returnArray};
}

export function filterCopyNumbers(copyNumber,returnArray,geneList,pathways){
  const genePathwayLookup = getGenePathwayLookup(pathways);

  for (const gene of geneList) {
    // if we have not processed that gene before, then process
    const geneIndex = geneList.indexOf(gene);

    const pathwayIndices = genePathwayLookup(gene);
    const sampleEntries = copyNumber[geneIndex]; // set of samples for this gene
    // we retrieve proper indices from the pathway to put back in the right place

    // get pathways this gene is involved in
    for (const index of pathwayIndices) {
      // process all samples
      for (const sampleEntryIndex in sampleEntries) {
        const returnValue = getCopyNumberValue(sampleEntries[sampleEntryIndex],
          DEFAULT_AMPLIFICATION_THRESHOLD,
          DEFAULT_DELETION_THRESHOLD);
        if (returnValue > 0) {
          returnArray[index][sampleEntryIndex].total += returnValue;
          returnArray[index][sampleEntryIndex].cnv += returnValue;
          returnArray[index][sampleEntryIndex].cnvHigh += getCopyNumberHigh(sampleEntries[sampleEntryIndex], DEFAULT_AMPLIFICATION_THRESHOLD);
          returnArray[index][sampleEntryIndex].cnvLow += getCopyNumberLow(sampleEntries[sampleEntryIndex], DEFAULT_DELETION_THRESHOLD);
        }
      }
    }
  }
  return returnArray;
}

/**
 * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
 *
 * @param expression
 * @param copyNumber
 * @param geneExpression
 * @param geneList
 * @param pathways
 * @param samples
 * @param filter
 * @returns {any[]}
 */
export function doDataAssociations(expression, copyNumber, geneExpression, geneList, pathways, samples, filter) {
  let returnArray = createEmptyArray(pathways.length, samples.length);
  // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
  if (filter === FILTER_ENUM.CNV_MUTATION || filter === FILTER_ENUM.MUTATION) {
    returnArray = filterMutations(expression,returnArray,samples,pathways);
  }

  if (filter === FILTER_ENUM.CNV_MUTATION|| filter === FILTER_ENUM.COPY_NUMBER) {
    returnArray = filterCopyNumbers(copyNumber,returnArray,geneList,pathways);
    // get list of genes in identified pathways
  }

  if (filter === FILTER_ENUM.GENE_EXPRESSION) {
    returnArray = filterGeneExpression(geneExpression,returnArray,geneList,pathways).returnArray;
    // get list of genes in identified pathways
  }
  return returnArray;
}

// https://stackoverflow.com/a/45813619/1739366
function getPermutations(array, size) {
  function p(t, i) {
    if (t.length === size) {
      result.push(t);
      return;
    }
    if (i + 1 > array.length) {
      return;
    }
    p(t.concat(array[i]), i + 1);
    p(t, i + 1);
  }

  var result = [];
  p([], 0);
  return result;
}

export function addIndepProb(prob_list) { //  p = PA + PB - PAB, etc
  let total_prob = 0.0;
  let sign = 0;
  const xs = range(0, prob_list.length);
  for (let i = 1; i <= prob_list.length; i++) {
    if (i % 2) {
      sign = 1.0;
    } else {
      sign = -1.0;
    }
    // eslint-disable-next-line no-unused-vars
    for (const [x, y] of izip(xs, getPermutations(prob_list, i))) {
      total_prob += sign * y.reduce((acc, value) => acc * value);
    }
  }
  return total_prob;
}

export function calculateAssociatedData(pathwayData, filter) {
  const hashAssociation = update(pathwayData, {
    filter: { $set: filter },
    selectedCohort: { $set: pathwayData.cohort },
  });
  hashAssociation.filter = filter;
  hashAssociation.selectedCohort = pathwayData.cohort;
  const associatedDataKey = createAssociatedDataKey(hashAssociation);
  const associatedData = findAssociatedData(hashAssociation, associatedDataKey);
  const prunedColumns = findPruneData(associatedData, associatedDataKey);
  prunedColumns.samples = pathwayData.samples;
  return associatedData;
}

export function calculateObserved(pathwayData, filter) {
  return calculateAssociatedData(pathwayData, filter).map((pathway) => sumInstances(pathway));
}

export function calculatePathwayScore(pathwayData, filter) {
  return calculateAssociatedData(pathwayData, filter).map((pathway) => sumTotals(pathway));
}


/**
 * Note:
 * @param pathwayData
 */
export function calculateAllPathways(pathwayData) {
  const pathwayDataA = pathwayData[0];
  const pathwayDataB = pathwayData[1];


  const observationsA = calculateObserved(pathwayDataA, pathwayDataA.filter);
  const totalsA = calculatePathwayScore(pathwayDataA, pathwayDataA.filter);
  const expectedA = calculateGeneSetExpected(pathwayDataA, pathwayDataA.filter);
  const maxSamplesAffectedA = pathwayDataA.samples.length;

  const observationsB = calculateObserved(pathwayDataB, pathwayDataB.filter);
  const totalsB = calculatePathwayScore(pathwayDataB, pathwayDataB.filter);
  const expectedB = calculateGeneSetExpected(pathwayDataB, pathwayDataB.filter);
  const maxSamplesAffectedB = pathwayDataB.samples.length;


  // TODO: Note, this has to be a clone of pathways, otherwise any shared references will causes problems
  const setPathways = JSON.parse(JSON.stringify(pathwayDataA.pathways));
  return setPathways.map((p, index) => {
    p.firstObserved = observationsA[index];
    p.firstTotal = totalsA[index];
    p.firstNumSamples = maxSamplesAffectedA;
    p.firstExpected = expectedA[p.golabel];
    p.firstChiSquared = scoreChiSquaredData(p.firstObserved, p.firstExpected, p.firstNumSamples);
    p.secondObserved = observationsB[index];
    p.secondTotal = totalsB[index];
    p.secondNumSamples = maxSamplesAffectedB;
    p.secondExpected = expectedB[p.golabel];
    p.secondChiSquared = scoreChiSquaredData(p.secondObserved, p.secondExpected, p.secondNumSamples);
    return p;
  });
}

export function generateScoredData(selection, pathwayData, pathways, filter, showClusterSort) {
  // let [pathwayDataA,pathwayDataB] = pathwayData;
  const pathwayDataA = pathwayData[0];
  const pathwayDataB = pathwayData[1];
  const geneDataA = generateGeneData(selection, pathwayDataA, pathways, filter[0]);
  const geneDataB = generateGeneData(selection, pathwayDataB, pathways, filter[1]);

  const scoredGeneDataA = scoreGeneData(geneDataA);
  const scoredGeneDataB = scoreGeneData(geneDataB);
  const scoredGenePathways = calculateDiffs(scoredGeneDataA.pathways, scoredGeneDataB.pathways);
  geneDataA.pathways = scoredGenePathways[0];
  geneDataB.pathways = scoredGenePathways[1];
  geneDataA.data = scoredGeneDataA.data;
  geneDataB.data = scoredGeneDataB.data;
  let sortedGeneDataA;
  let sortedGeneDataB;
  if (showClusterSort) {
    sortedGeneDataA = clusterSort(geneDataA);
    const synchronizedGeneList = sortedGeneDataA.pathways.map((g) => g.gene[0]);
    sortedGeneDataB = synchronizedSort(geneDataB, synchronizedGeneList);
  } else {
    sortedGeneDataA = diffSort(geneDataA);
    sortedGeneDataB = diffSort(geneDataB);
  }
  geneDataA.sortedSamples = sortedGeneDataA.sortedSamples;
  geneDataA.samples = sortedGeneDataA.samples;
  geneDataA.pathways = sortedGeneDataA.pathways;
  geneDataA.data = sortedGeneDataA.data;

  geneDataB.sortedSamples = sortedGeneDataB.sortedSamples;
  geneDataB.samples = sortedGeneDataB.samples;
  geneDataB.pathways = sortedGeneDataB.pathways;
  geneDataB.data = sortedGeneDataB.data;
  return [geneDataA, geneDataB];
}

/**
 * this nicely forces synchronization as well
 * @param geneData0
 * @param geneData1
 * @returns {*[]}
 */
export function calculateDiffs(geneData0, geneData1) {
  if (geneData0 && geneData1 && geneData0.length === geneData1.length) {
    const gene0List = geneData0.map((g) => g.gene[0]);
    const gene1Objects = geneData1.sort((a, b) => {
      const aGene = a.gene[0];
      const bGene = b.gene[0];
      return gene0List.indexOf(aGene) - gene0List.indexOf(bGene);
    });

    for (const geneIndex in geneData0) {
      const chiSquareValue = scoreChiSquareTwoByTwo(
        geneData0[geneIndex].samplesAffected,
        geneData0[geneIndex].total - geneData0[geneIndex].samplesAffected,
        gene1Objects[geneIndex].samplesAffected,
        gene1Objects[geneIndex].total - gene1Objects[geneIndex].samplesAffected,
      );
      let diffScore = geneData0[geneIndex].samplesAffected / geneData0[geneIndex].total > gene1Objects[geneIndex].samplesAffected / gene1Objects[geneIndex].total
        ? chiSquareValue : -chiSquareValue;
      diffScore = isNaN(diffScore) ? 0 : diffScore;

      geneData0[geneIndex].diffScore = diffScore;
      gene1Objects[geneIndex].diffScore = diffScore;
    }
    return [geneData0, gene1Objects];
  }

  return [geneData0, geneData1];
}

export function generateGeneData(pathwaySelection, pathwayData, geneSetPathways, filter) {
  const { expression, samples, copyNumber,filterCounts,geneExpression ,cohort} = pathwayData;
  const { pathway: { goid, golabel } } = pathwaySelection;

  const geneList = getGenesForNamedPathways(golabel, geneSetPathways);
  const pathways = geneList.map((gene) => ({ goid, golabel, gene: [gene] }));

  // TODO: just return this once fixed
  return {
    selectedCohort: cohort,
    expression,
    samples,
    copyNumber,
    geneExpression,
    filter,
    filterCounts,
    geneList:pathwayData.geneList, // use the geneList form the
    pathways,
    pathwaySelection,
  };
}

export function scoreGeneData(inputGeneData) {
  const { samples, cohortIndex } = inputGeneData;
  const associatedDataKey = createAssociatedDataKey(inputGeneData);
  const associatedData = findAssociatedData(inputGeneData, associatedDataKey);
  const prunedColumns = findPruneData(associatedData, associatedDataKey);
  prunedColumns.samples = samples;
  const calculatedPathways = scoreColumns(prunedColumns);
  const returnedValue = update(prunedColumns, {
    pathways: { $set: calculatedPathways },
    index: { $set: cohortIndex },
  });

  // set affected versus total
  const samplesLength = returnedValue.data[0].length;

  for (const d in returnedValue.data) {
    returnedValue.pathways[d].total = samplesLength;
    returnedValue.pathways[d].affected = sumTotals(returnedValue.data[d]);
    returnedValue.pathways[d].samplesAffected = sumInstances(returnedValue.data[d]);
  }

  return returnedValue;
}
