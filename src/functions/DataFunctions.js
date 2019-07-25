import mutationScores from '../data/mutationVector';
import {sum, times, memoize, range} from 'ucsc-xena-client/dist/underscore_ext';
import {izip, permutations} from 'itertools';
import lru from 'tiny-lru/lib/tiny-lru.es5'
import update from "immutability-helper";
import {sumInstances, sumTotals} from "./MathFunctions";
import {MIN_FILTER} from "../components/XenaGeneSetApp";

const DEFAULT_AMPLIFICATION_THRESHOLD = 2 ;
const DEFAULT_DELETION_THRESHOLD = -2 ;

let associateCache = lru(500);
let pruneDataCache = lru(500);

// NOTE: this should be false for production.
let ignoreCache = false;

export const DEFAULT_DATA_VALUE = {total:0,mutation:0,cnv:0,mutation4:0,mutation3:0,mutation2:0,cnvHigh:0,cnvLow:0};

export function getCopyNumberValue(copyNumberValue, amplificationThreshold, deletionThreshold) {
    return (!isNaN(copyNumberValue) && (copyNumberValue >= amplificationThreshold || copyNumberValue <= deletionThreshold)) ? 1 : 0;
}

export function getCopyNumberHigh(copyNumberValue, amplificationThreshold) {
    return (!isNaN(copyNumberValue) && (copyNumberValue >= amplificationThreshold )) ? 1 : 0;
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

export let getGenePathwayLookup = pathways => {
    let sets = pathways.map(p => new Set(p.gene)),
        idxs = range(sets.length);
    return memoize(gene => idxs.filter(i => sets[i].has(gene)));
};

export function pruneColumns(data, pathways) {

    // TODO: we need to map the sum off each column
    let columnScores = data.map( d => sum(d.total));
    let prunedPathways = pathways.filter((el, i) => columnScores[i] >= 0);
    let prunedAssociations = data.filter((el, i) => columnScores[i] >= 0);

    return {
        'data': prunedAssociations,
        'pathways': prunedPathways
    };
}

export function createAssociatedDataKey(inputHash){
    let { geneList, pathways, samples, filter, min, cohortIndex} = inputHash;
    return  {
        filter,
        geneList,
        pathways,
        min,
        cohortIndex,
        sampleCount:samples.length,
    };
}

export function findAssociatedData(inputHash,associatedDataKey) {
    let {expression, copyNumber, geneList, pathways, samples, filter, min} = inputHash;

    const key = JSON.stringify(associatedDataKey);
    let data = associateCache.get(key);
    if (ignoreCache || !data) {
        data = doDataAssociations(expression, copyNumber, geneList, pathways, samples, filter, min);
        associateCache.set(key,data);
    }

    return data;
}

export function findPruneData(associatedData,dataKey) {
    let key = JSON.stringify(dataKey);
    let data = pruneDataCache.get(key);
    if (ignoreCache || !data) {
        data = pruneColumns(associatedData, dataKey.pathways);
        pruneDataCache.set(key,data);
    }
    return data;
}

export function createEmptyArray(pathwayLength,sampleLength){
    return times(pathwayLength, () => times(sampleLength, () => JSON.parse(JSON.stringify(DEFAULT_DATA_VALUE))));
}

/**
 * Converts per-sample pathway data to
 * @param pathwayData
 * @param filter
 */
export function calculateGeneSetExpected(pathwayData, filter) {

    // a list for each sample  [0] = expected_N, vs [1] total_pop_N
    let genomeBackgroundCopyNumber = pathwayData.genomeBackgroundCopyNumber;
    let genomeBackgroundMutation = pathwayData.genomeBackgroundMutation;
    // let's assume they are the same order for now since they were fetched with the same sample data
    filter = filter.indexOf('All') === 0 ? '' : filter;

    // // initiate to 0
    let pathwayExpected = {};
    // init data
    for (let pathway of pathwayData.pathways) {
        pathwayExpected[pathway.golabel] = 0;
    }
    for (let sampleIndex in pathwayData.samples) {

        // TODO: if filter is all or copy number, or SNV . . etc.
        let copyNumberBackgroundExpected = genomeBackgroundCopyNumber[0][sampleIndex];
        let copyNumberBackgroundTotal = genomeBackgroundCopyNumber[1][sampleIndex];
        let mutationBackgroundExpected = genomeBackgroundMutation[0][sampleIndex];
        let mutationBackgroundTotal = genomeBackgroundMutation[1][sampleIndex];


        // TODO: add the combined filter: https://github.com/jingchunzhu/wrangle/blob/master/xenaGo/mergeExpectedHypergeometric.py#L17
        for (let pathway of pathwayData.pathways) {
            let sample_probs = [];

            if (!filter || filter === 'Copy Number') {
                sample_probs.push(calculateExpectedProb(pathway, copyNumberBackgroundExpected, copyNumberBackgroundTotal));
            }
            if (!filter || filter === 'Mutation') {
                sample_probs.push(calculateExpectedProb(pathway, mutationBackgroundExpected, mutationBackgroundTotal));
            }
            let total_prob = addIndepProb(sample_probs);
            pathwayExpected[pathway.golabel] = pathwayExpected[pathway.golabel] + total_prob;
        }
    }

    // TODO we have an expected for the sample
    return pathwayExpected;
}

export function calculateExpectedProb(pathway, expected, total) {
    let prob = 1.0;
    let genesInPathway = pathway.gene.length;
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
    let expected2 = total - expected;
    let observed2 = total - observed;
    let chiSquaredValue = Math.pow(expected - observed,2.0)  / expected + Math.pow(expected2 - observed2,2.0) / expected2;
    chiSquaredValue = chiSquaredValue * ((expected > observed) ? -1 : 1);
    return chiSquaredValue;
}

// https://en.wikipedia.org/wiki/Chi-squared_test
export function scoreChiSquareTwoByTwo (observed11, observed12, observed21, observed22) {
    let rowTotal1 = observed11 + observed12,
        rowTotal2 = observed21 + observed22,
        columnTotal1 = observed11 + observed21,
        columnTotal2 = observed12 + observed22,
        total = rowTotal1 + rowTotal2,
        expected11 = columnTotal1 * rowTotal1 / total,
        expected12 = columnTotal2 * rowTotal1 / total,
        expected21 = columnTotal1 * rowTotal2 / total,
        expected22 = columnTotal2 * rowTotal2 / total;

    return Math.pow(observed11 - expected11, 2.0) / expected11 +
        Math.pow(observed12 - expected12, 2.0) / expected12 +
        Math.pow(observed21 - expected21, 2.0) / expected21 +
        Math.pow(observed22 - expected22, 2.0) / expected22;
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


/**
 * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
 *
 * @param expression
 * @param copyNumber
 * @param geneList
 * @param pathways
 * @param samples
 * @param filter
 * @param min
 * @param selectedCohort
 * @returns {any[]}
 */
export function doDataAssociations(expression, copyNumber, geneList, pathways, samples, filter, min) {

    filter = filter.indexOf('All') === 0 ? '' : filter;
    let returnArray = createEmptyArray(pathways.length,samples.length)
    let sampleIndex = new Map(samples.map((v, i) => [v, i]));
    let genePathwayLookup = getGenePathwayLookup(pathways);


    // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
    if (!filter || filter === 'Mutation') {
        for (let row of expression.rows) {

            let effectValue = getMutationScore(row.effect, min);
            let effectScore = mutationScores[row.effect];
            let pathwayIndices = genePathwayLookup(row.gene);

            for (let index of pathwayIndices) {
                returnArray[index][sampleIndex.get(row.sample)].total += effectValue;
                returnArray[index][sampleIndex.get(row.sample)].mutation += effectValue;

                switch(effectScore){
                    case 4:
                        returnArray[index][sampleIndex.get(row.sample)].mutation4 += 1 ;
                        break;
                    case 3:
                        returnArray[index][sampleIndex.get(row.sample)].mutation3 += 1 ;
                        break;
                    case 2:
                        returnArray[index][sampleIndex.get(row.sample)].mutation2 += 1 ;
                        break;
                    default:
                }

                //
            }
        }
    }


    if (!filter || filter === 'Copy Number') {

        // get list of genes in identified pathways
        for (let gene of geneList) {
            // if we have not processed that gene before, then process
            let geneIndex = geneList.indexOf(gene);

            let pathwayIndices = genePathwayLookup(gene);
            let sampleEntries = copyNumber[geneIndex]; // set of samples for this gene
            // we retrieve proper indices from the pathway to put back in the right place

            // get pathways this gene is involved in
            for (let index of pathwayIndices) {
                // process all samples
                for (let sampleEntryIndex in sampleEntries) {
                    let returnValue = getCopyNumberValue(sampleEntries[sampleEntryIndex]
                        ,DEFAULT_AMPLIFICATION_THRESHOLD
                        ,DEFAULT_DELETION_THRESHOLD);
                    if (returnValue > 0) {
                        returnArray[index][sampleEntryIndex].total += returnValue;
                        returnArray[index][sampleEntryIndex].cnv += returnValue;
                        returnArray[index][sampleEntryIndex].cnvHigh += getCopyNumberHigh(sampleEntries[sampleEntryIndex], DEFAULT_AMPLIFICATION_THRESHOLD);
                        returnArray[index][sampleEntryIndex].cnvLow += getCopyNumberLow(sampleEntries[sampleEntryIndex], DEFAULT_DELETION_THRESHOLD);
                    }
                }
            }
        }

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

export function addIndepProb(prob_list) {  //  p = PA + PB - PAB, etc
    let total_prob = 0.0;
    let sign = 0;
    let xs = range(0, prob_list.length);
    for (let i = 1; i <= prob_list.length; i++) {
        if (i % 2) {
            sign = 1.0
        }
        else {
            sign = -1.0
        }
        for (const [x, y] of izip(xs, getPermutations(prob_list, i))) {
            total_prob = total_prob + sign * y.reduce(function (acc, value) {
                return acc * value
            });
        }
    }
    return total_prob;
}

export function calculateAssociatedData(pathwayData, filter, min) {
    let hashAssociation = update(pathwayData, {
            filter: {$set: filter},
            min: {$set: min},
            selectedCohort: {$set: pathwayData.cohort},
        }
    );
    hashAssociation.filter = filter;
    hashAssociation.min = min;
    hashAssociation.selectedCohort = pathwayData.cohort;
    let associatedDataKey = createAssociatedDataKey(hashAssociation);
    let associatedData = findAssociatedData(hashAssociation,associatedDataKey);
    let prunedColumns = findPruneData(associatedData,associatedDataKey);
    prunedColumns.samples = pathwayData.samples;
    return associatedData;
}

export function calculateObserved(pathwayData, filter, min) {
    return calculateAssociatedData(pathwayData, filter, min).map(pathway => {
        return sumInstances(pathway);
    });
}

export function calculatePathwayScore(pathwayData, filter, min) {
    return calculateAssociatedData(pathwayData, filter, min).map(pathway => {
        return sumTotals(pathway);
    });
}
/**
 * Note:
 * @param pathwayDataA
 * @param pathwayDataB
 */
export function calculateAllPathways(pathwayDataA,pathwayDataB){

    console.log('pathways A',JSON.stringify(pathwayDataA))
    console.log('pathways B',JSON.stringify(pathwayDataB))

    const observationsA = calculateObserved(pathwayDataA, pathwayDataA.filter, MIN_FILTER,pathwayDataA.cohort );
    const totalsA = calculatePathwayScore(pathwayDataA, pathwayDataA.filter, MIN_FILTER);
    const expectedA = calculateGeneSetExpected(pathwayDataA, pathwayDataA.filter);
    const maxSamplesAffectedA = pathwayDataA.samples.length;

    const observationsB = calculateObserved(pathwayDataB, pathwayDataB.filter, MIN_FILTER,pathwayDataB.cohort );
    const totalsB = calculatePathwayScore(pathwayDataB, pathwayDataB.filter, MIN_FILTER);
    const expectedB = calculateGeneSetExpected(pathwayDataB, pathwayDataB.filter);
    const maxSamplesAffectedB = pathwayDataB.samples.length;

    let outputData = pathwayDataA.pathways.map((p, index) => {
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
    console.log('output',JSON.stringify(outputData))
    return outputData;

}
