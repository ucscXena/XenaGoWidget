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
  diffSort, scoreColumns,
} from './SortFunctions';
import {VIEW_ENUM} from '../data/ViewEnum';

export const DEFAULT_AMPLIFICATION_THRESHOLD = 2;
export const DEFAULT_DELETION_THRESHOLD = -2;

const associateCache = lru(500);
const pruneDataCache = lru(500);

// NOTE: this should be false for production.
const ignoreCache = true ;

export const DEFAULT_DATA_VALUE = {
  total: 0, mutation: 0, cnv: 0, mutation4: 0, mutation3: 0, mutation2: 0, cnvHigh: 0, cnvLow: 0, geneExpression: 0, paradigm: 0
};


export function average(data){
  let sumValue = data.reduce(function(input, value){
    return input + value;
  }, 0);

  return sumValue / data.length;
}

export function stdev(data,mean){
  let variance = data.reduce(function(input, value){
    return input + (Math.pow((value-mean),2));
  }, 0);
  return Math.sqrt(variance / data.length);
}

export function cleanData(array1,array2){
  return [...array1.filter( a => !isNaN(a)),...array2.filter( a => !isNaN(a))];
}

export function generateStats(inputA, inputB){
  let stats = [inputA.length];
  for(const index in inputA){
    const cleanGeneExpression = cleanData(inputA[index],inputB[index]);
    const meanGeneExpression = average(cleanGeneExpression);
    const stdevGeneExpression = stdev(cleanGeneExpression,meanGeneExpression);
    stats[index] = { mean: meanGeneExpression,stdev:stdevGeneExpression,count: cleanGeneExpression.length };
  }
  return stats;
}

export function generateZScore( data,stats){
  return  data.map( (ge, index) => {
    const statRow = stats[index];
    return ge.map( (e) => {
      if(isNaN(e))  return e ;
      return (e - statRow.mean) / statRow.stdev ;
    } );
  });
}

export function generateZScoreForBoth(inputA, inputB){
  if(!inputA || !inputB) return [0,0];
  const geneExpressionStats = generateStats(inputA,inputB);
  const zScoreA = generateZScore(inputA,geneExpressionStats);
  const zScoreB = generateZScore(inputB,geneExpressionStats);
  return [zScoreA,zScoreB];
}



export function getCopyNumberValue(copyNumberValue, amplificationThreshold, deletionThreshold) {
  return (!isNaN(copyNumberValue) && (copyNumberValue >= amplificationThreshold || copyNumberValue <= deletionThreshold)) ? 1 : 0;
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
    pathways, samples, filter, selectedCohort, selectedGeneSet
  } = inputHash;
  return {
    filter,
    pathways,
    selectedGeneSet,
    samples:samples.sort(),
    selectedCohort,
  };
}

export function findAssociatedData(inputHash, associatedDataKey) {
  const {
    expression, copyNumber, geneList, pathways, samples, filter,
    geneExpression, geneExpressionPathwayActivity,
    paradigm, paradigmPathwayActivity, regulonPathwayActivity
  } = inputHash;

  const key = JSON.stringify(associatedDataKey);
  let data = associateCache.get(key);
  if (ignoreCache || !data) {
    data = doDataAssociations(expression, copyNumber,
      geneExpression,geneExpressionPathwayActivity,
      paradigm,paradigmPathwayActivity, regulonPathwayActivity,
      geneList, pathways, samples, filter);
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

      if (filter === VIEW_ENUM.COPY_NUMBER || filter === VIEW_ENUM.CNV_MUTATION) {
        if(!isNaN(copyNumberBackgroundExpected) && !isNaN(copyNumberBackgroundTotal)){
          sample_probs.push(calculateExpectedProb(pathway, copyNumberBackgroundExpected, copyNumberBackgroundTotal));
        }
      }
      if (filter === VIEW_ENUM.MUTATION || filter === VIEW_ENUM.CNV_MUTATION) {
        sample_probs.push(calculateExpectedProb(pathway, mutationBackgroundExpected, mutationBackgroundTotal));
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

export function filterGeneExpressionPathwayActivity(geneExpressionPathwayActivity, returnArray) {
  let scored = 0 ;
  for(const pathwayIndex in returnArray){
    for(const sampleIndex in returnArray[pathwayIndex]){
      if(geneExpressionPathwayActivity[pathwayIndex]){
        returnArray[pathwayIndex][sampleIndex].geneExpressionPathwayActivity = geneExpressionPathwayActivity[pathwayIndex][sampleIndex];
      }
      else{
        returnArray[pathwayIndex][sampleIndex].geneExpressionPathwayActivity = 0;
      }
      ++scored;
    }
  }
  return {score: scored, returnArray};
}

export function filterRegulonPathwayActivity(regulonPathwayActivity, returnArray) {
  let scored = 0 ;
  for(const pathwayIndex in returnArray){
    for(const sampleIndex in returnArray[pathwayIndex]){
      if(regulonPathwayActivity[pathwayIndex]){
        returnArray[pathwayIndex][sampleIndex].regulonPathwayActivity = regulonPathwayActivity[pathwayIndex][sampleIndex];
      }
      else{
        returnArray[pathwayIndex][sampleIndex].regulonPathwayActivity = 0;
      }
      ++scored;
    }
  }
  return {score: scored, returnArray};
}

export function filterParadigmPathwayActivity(paradigmPathwayActivity, returnArray) {
  let scored = 0 ;
  for(const pathwayIndex in returnArray){
    for(const sampleIndex in returnArray[pathwayIndex]){
      if(paradigmPathwayActivity[pathwayIndex]){
        returnArray[pathwayIndex][sampleIndex].paradigmPathwayActivity = paradigmPathwayActivity[pathwayIndex][sampleIndex];
      }
      else{
        returnArray[pathwayIndex][sampleIndex].paradigmPathwayActivity = 0;
      }
      ++scored;
    }
  }
  return {score: scored, returnArray};
}

export function filterParadigm(paradigm,returnArray,geneList,pathways){
  const genePathwayLookup = getGenePathwayLookup(pathways);
  let scored = 0 ;
  for (const gene of geneList) {
    // if we have not processed that gene before, then process
    const geneIndex = geneList.indexOf(gene);
    const pathwayIndices = genePathwayLookup(gene);
    const sampleEntries = paradigm[geneIndex]; // set of samples for this gene

    // get pathways this gene is involved in
    for (const index of pathwayIndices) {
      // process all samples
      for (const sampleEntryIndex in sampleEntries) {
        const returnValue = sampleEntries[sampleEntryIndex];
        if (!isNaN(returnValue)) {
          ++scored ;
          returnArray[index][sampleEntryIndex].paradigm += returnValue ;
        }
      }
    }
  }
  return {score: scored, returnArray};
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
        const returnValue = sampleEntries[sampleEntryIndex];
        if (!isNaN(returnValue)) {
          ++scored ;
          returnArray[index][sampleEntryIndex].geneExpression += returnValue ;
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

export function isViewGeneExpression(filter){
  switch (filter) {
  case VIEW_ENUM.GENE_EXPRESSION:
  case VIEW_ENUM.PARADIGM:
  case VIEW_ENUM.REGULON:
    return true;
  default:
    return false;
  }
}

function labelArray(returnArray,pathways, samples) {
  for(let pathwayIndex in pathways){
    for(let sampleIndex in samples){
      returnArray[pathwayIndex][sampleIndex].golabel = pathways[pathwayIndex].golabel;
      returnArray[pathwayIndex][sampleIndex].sample = samples[sampleIndex];
    }
  }
  return returnArray ;
}

/**
 * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
 *
 * @param expression
 * @param copyNumber
 * @param geneExpression
 * @param geneExpressionPathwayActivity
 * @param paradigm
 * @param paradigmPathwayActivity
 * @param regulonPathwayActivity
 * @param geneList
 * @param pathways
 * @param samples
 * @param filter
 * @returns {any[]}
 */
export function doDataAssociations(expression, copyNumber,
  geneExpression, geneExpressionPathwayActivity,
  paradigm, paradigmPathwayActivity, regulonPathwayActivity,
  geneList, pathways, samples, filter) {
  let returnArray = createEmptyArray(pathways.length, samples.length);
  returnArray = labelArray(returnArray,pathways,samples);
  // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
  if (filter === VIEW_ENUM.CNV_MUTATION || filter === VIEW_ENUM.MUTATION) {
    returnArray = filterMutations(expression,returnArray,samples,pathways);
  }

  if (filter === VIEW_ENUM.CNV_MUTATION|| filter === VIEW_ENUM.COPY_NUMBER) {
    returnArray = filterCopyNumbers(copyNumber,returnArray,geneList,pathways);
    // get list of genes in identified pathways
  }

  if (filter === VIEW_ENUM.GENE_EXPRESSION) {
    returnArray = filterGeneExpression(geneExpression,returnArray,geneList,pathways).returnArray;
    if(geneExpressionPathwayActivity){
      returnArray = filterGeneExpressionPathwayActivity(geneExpressionPathwayActivity,returnArray,geneList,pathways).returnArray;
    }
    // get list of genes in identified pathways
  }

  if (filter === VIEW_ENUM.PARADIGM) {
    returnArray = filterParadigm(paradigm,returnArray,geneList,pathways).returnArray;
    if(paradigmPathwayActivity){
      returnArray = filterParadigmPathwayActivity(paradigmPathwayActivity,returnArray,geneList,pathways).returnArray;
    }
    // get list of genes in identified pathways
  }

  if (filter === VIEW_ENUM.REGULON) {
    returnArray = filterGeneExpression(geneExpression,returnArray,geneList,pathways).returnArray;
    if(regulonPathwayActivity){
      returnArray = filterRegulonPathwayActivity(regulonPathwayActivity,returnArray,geneList,pathways).returnArray;
    }
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

function calculateParadigmPathwayActivity(pathwayData) {
  if(pathwayData.filter!==VIEW_ENUM.PARADIGM) return 0 ;
  return pathwayData.pathways.map( (p,index) => average(pathwayData.paradigmPathwayActivity[index].filter( f => !isNaN(f)))  );
}

function calculateRegulonPathwayActivity(pathwayData) {
  if(pathwayData.filter!==VIEW_ENUM.REGULON) return 0 ;
  return pathwayData.pathways.map( (p,index) => average(pathwayData.regulonPathwayActivity[index].filter( f => !isNaN(f)))  );
}

function calculateGeneExpressionPathwayActivity(pathwayData) {
  if(pathwayData.filter!==VIEW_ENUM.GENE_EXPRESSION) return 0 ;
  return pathwayData.pathways.map( (p,index) => average(pathwayData.geneExpressionPathwayActivity[index].filter( f => !isNaN(f)))  );
}

/**
 * Note:
 * @param pathwayData
 * @param associatedData
 */
export function calculateAllPathways(pathwayData,associatedData) {
  const pathwayDataA = pathwayData[0];
  const pathwayDataB = pathwayData[1];
  const associatedDataA = associatedData[0];
  const associatedDataB = associatedData[1];

  const geneExpressionPathwayActivityA = calculateGeneExpressionPathwayActivity(pathwayDataA);
  const paradigmPathwayActivityA = calculateParadigmPathwayActivity(pathwayDataA);
  const regulonPathwayActivityA = calculateRegulonPathwayActivity(pathwayDataA);
  // each pathway needs to have its own set BPA samples
  // const observationsA = calculateObserved(pathwayDataA, pathwayDataA.filter);
  const observationsA = associatedDataA.map( pathway => sumInstances(pathway));
  // const totalsA = calculatePathwayScore(pathwayDataA, pathwayDataA.filter);
  const totalsA = associatedDataA.map( pathway => sumTotals(pathway));
  const expectedA = calculateGeneSetExpected(pathwayDataA, pathwayDataA.filter);
  const maxSamplesAffectedA = pathwayDataA.samples.length;

  const geneExpressionPathwayActivityB = calculateGeneExpressionPathwayActivity(pathwayDataB);
  const paradigmPathwayActivityB = calculateParadigmPathwayActivity(pathwayDataB);
  const regulonPathwayActivityB = calculateRegulonPathwayActivity(pathwayDataB);
  // const observationsB = calculateObserved(pathwayDataB, pathwayDataB.filter);
  const observationsB = associatedDataB.map( pathway => sumInstances(pathway));
  // const totalsB = calculatePathwayScore(pathwayDataB, pathwayDataB.filter);
  const totalsB = associatedDataB.map( pathway => sumTotals(pathway));
  const expectedB = calculateGeneSetExpected(pathwayDataB, pathwayDataB.filter);
  const maxSamplesAffectedB = pathwayDataB.samples.length;


  // TODO: Note, this has to be a clone of pathways, otherwise any shared references will causes problems
  const setPathways = JSON.parse(JSON.stringify(pathwayDataA.pathways));
  return setPathways.map((p, index) => {
    if(!isNaN(geneExpressionPathwayActivityA[index])) p.firstGeneExpressionPathwayActivity = geneExpressionPathwayActivityA[index];
    if(!isNaN(paradigmPathwayActivityA[index])) p.firstParadigmPathwayActivity = paradigmPathwayActivityA[index];
    if(!isNaN(regulonPathwayActivityA[index])) p.firstRegulonPathwayActivity = regulonPathwayActivityA[index];
    p.firstObserved = observationsA[index];
    p.firstTotal = totalsA[index];
    p.firstNumSamples = maxSamplesAffectedA;
    p.firstExpected = expectedA[p.golabel];
    p.firstChiSquared = scoreChiSquaredData(p.firstObserved, p.firstExpected, p.firstNumSamples);

    if(!isNaN(geneExpressionPathwayActivityB[index])) p.secondGeneExpressionPathwayActivity = geneExpressionPathwayActivityB[index];
    if(!isNaN(paradigmPathwayActivityB[index])) p.secondParadigmPathwayActivity = paradigmPathwayActivityB[index];
    if(!isNaN(regulonPathwayActivityB[index])) p.secondRegulonPathwayActivity = regulonPathwayActivityB[index];
    p.secondObserved = observationsB[index];
    p.secondTotal = totalsB[index];
    p.secondNumSamples = maxSamplesAffectedB;
    p.secondExpected = expectedB[p.golabel];
    p.secondChiSquared = scoreChiSquaredData(p.secondObserved, p.secondExpected, p.secondNumSamples);
    return p;
  });
}

export function generateScoredData(selection, pathwayData, pathways, view, sortedAssociatedData) {
  const pathwayDataA = pathwayData[0];
  const pathwayDataB = pathwayData[1];
  const geneDataA = generateGeneData(selection, pathwayDataA, pathways, view);
  const geneDataB = generateGeneData(selection, pathwayDataB, pathways, view);

  const scoredGeneDataA = scoreGeneData(geneDataA);
  const scoredGeneDataB = scoreGeneData(geneDataB);
  const scoredGenePathways = calculateDiffs(scoredGeneDataA.pathways, scoredGeneDataB.pathways,view);
  geneDataA.pathways = scoredGenePathways[0];
  geneDataB.pathways = scoredGenePathways[1];
  geneDataA.data = scoredGeneDataA.data;
  geneDataB.data = scoredGeneDataB.data;

  const sortedGeneDataA = diffSort(geneDataA,sortedAssociatedData[0]);
  const sortedGeneDataB = diffSort(geneDataB,sortedAssociatedData[1]);
  geneDataA.sortedSamples = sortedGeneDataA.sortedSamples;
  geneDataA.samples = sortedGeneDataA.sortedSamples;
  geneDataA.data = sortedGeneDataA.data;
  geneDataB.sortedSamples = sortedGeneDataB.sortedSamples;
  geneDataB.sample = sortedGeneDataB.sortedSamples;
  geneDataB.data = sortedGeneDataB.data;
  return [geneDataA, geneDataB];
}

export function tTestParadigm(geneData0Element, geneData1Element) {
  const poolSquared = Math.sqrt(   ( (( geneData0Element.total - 1 ) * geneData0Element.paradigmVariance)  + (( geneData1Element.total - 1 ) * geneData1Element.paradigmVariance) ) / (geneData0Element.total + geneData1Element.total - 2) );
  const standardError = poolSquared * Math.sqrt( (1 / geneData0Element.total ) + ( 1 / geneData1Element.total ));
  return  (geneData0Element.paradigmMean - geneData1Element.paradigmMean) / standardError;
}

export function tTestGeneExpression(geneData0Element, geneData1Element) {
  const poolSquared = Math.sqrt(   ( (( geneData0Element.total - 1 ) * geneData0Element.geneExpressionVariance)  + (( geneData1Element.total - 1 ) * geneData1Element.geneExpressionVariance) ) / (geneData0Element.total + geneData1Element.total - 2) );
  const standardError = poolSquared * Math.sqrt( (1 / geneData0Element.total ) + ( 1 / geneData1Element.total ));
  return  (geneData0Element.geneExpressionMean - geneData1Element.geneExpressionMean) / standardError;
}

/**
 * this nicely forces synchronization as well
 * @param geneData0
 * @param geneData1
 * @returns {*[]}
 */
export function calculateDiffs(geneData0, geneData1,view) {
  if (geneData0 && geneData1 && geneData0.length === geneData1.length) {
    const gene0List = geneData0.map((g) => g.gene[0]);
    const gene1Objects = geneData1.sort((a, b) => {
      const aGene = a.gene[0];
      const bGene = b.gene[0];
      return gene0List.indexOf(aGene) - gene0List.indexOf(bGene);
    });

    if(view===VIEW_ENUM.PARADIGM){
      for (const geneIndex in geneData0) {
        let diffScore = tTestParadigm(geneData0[geneIndex],geneData1[geneIndex]);
        diffScore = isNaN(diffScore) ? 0 : diffScore;
        geneData0[geneIndex].diffScore = diffScore;
        gene1Objects[geneIndex].diffScore = diffScore;
      }
    }
    else
    if(view===VIEW_ENUM.GENE_EXPRESSION || view === VIEW_ENUM.REGULON){
      for (const geneIndex in geneData0) {
        let diffScore = tTestGeneExpression(geneData0[geneIndex],geneData1[geneIndex]);
        diffScore = isNaN(diffScore) ? 0 : diffScore;
        geneData0[geneIndex].diffScore = diffScore;
        gene1Objects[geneIndex].diffScore = diffScore;
      }
    }
    else{
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
    }

    return [geneData0, gene1Objects];
  }

  return [geneData0, geneData1];
}

export function generateGeneData(pathwaySelection, pathwayData, geneSetPathways, filter) {
  const { expression, samples, copyNumber, filterCounts, geneExpression , paradigm, cohort} = pathwayData;
  let { pathway: { goid, golabel } } = pathwaySelection;
  let geneList = getGenesForNamedPathways(golabel, geneSetPathways);
  if(geneList.length===0){
    golabel = geneSetPathways[0].golabel;
    geneList = getGenesForNamedPathways(golabel, geneSetPathways);
  }
  const pathways = geneList.map((gene) => ({ goid, golabel, gene: [gene] }));

  // TODO: just return this once fixed
  return {
    selectedCohort: cohort,
    expression,
    samples,
    copyNumber,
    geneExpression,
    paradigm,
    filter,
    geneList:pathwayData.geneList, // use the geneList form the
    filterCounts,
    pathways,
    pathwaySelection,
  };
}

function calculateVarianceParadigm(datum,mean) {
  let total = 0;
  for (let i = 0; i < datum.length; ++i) {
    total += Math.pow(datum[i].paradigm - mean,2.0);
  }
  return total / (datum.length-1) ;
}


function calculateMeanParadigm(datum) {
  let total = 0;
  for (let i = 0; i < datum.length; ++i) {
    total += datum[i].paradigm;
  }
  return total / datum.length ;
}

function calculateVarianceGeneExpression(datum,mean) {
  let total = 0;
  for (let i = 0; i < datum.length; ++i) {
    total += Math.pow(datum[i].geneExpression - mean,2.0);
  }
  return total / (datum.length-1) ;
}


function calculateMeanGeneExpression(datum) {
  let total = 0;
  for (let i = 0; i < datum.length; ++i) {
    total += datum[i].geneExpression;
  }
  return total / datum.length ;
}

export function scoreGeneData(inputGeneData) {
  const { samples, cohortIndex, filter } = inputGeneData;

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
    if(filter===VIEW_ENUM.GENE_EXPRESSION || filter===VIEW_ENUM.REGULON){
      returnedValue.pathways[d].geneExpressionMean = calculateMeanGeneExpression(returnedValue.data[d]);
      returnedValue.pathways[d].geneExpressionVariance = calculateVarianceGeneExpression(returnedValue.data[d],returnedValue.pathways[d].geneExpressionMean);
    }
    else
    if(filter===VIEW_ENUM.PARADIGM){
      returnedValue.pathways[d].paradigmMean = calculateMeanParadigm(returnedValue.data[d]);
      returnedValue.pathways[d].paradigmVariance = calculateVarianceParadigm(returnedValue.data[d],returnedValue.pathways[d].paradigmMean);
    }
    returnedValue.pathways[d].affected = sumTotals(returnedValue.data[d]);
    returnedValue.pathways[d].samplesAffected = sumInstances(returnedValue.data[d]);
  }

  return returnedValue;
}
