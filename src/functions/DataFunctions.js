import mutationScores from '../data/mutationVector';
import {sum, times, memoize, range} from 'underscore';
import {izip, permutations} from 'itertools';
import lru from 'tiny-lru/lib/tiny-lru.es5'


let associateCache = lru(500);
let pruneDataCache = lru(500);

// export const DEFAULT_DATA_HEADER= ['total','mutation','cnv'];
// export const DEFAULT_DATA_ARRAY= [0,0,0];
// export const DEFAULT_DATA_ARRAY_HEADERS = {total:0,mutation:1,cnv:2};

export function getCopyNumberValue(copyNumberValue, amplificationThreshold, deletionThreshold) {
    return (!isNaN(copyNumberValue) && (copyNumberValue >= amplificationThreshold || copyNumberValue <= deletionThreshold)) ? 1 : 0;
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

export function pruneColumns(data, pathways, min) {
    // TODO: we need to map the sum off each column
    let columnScores = data.map( d => sum(d.total));

    let prunedPathways = pathways.filter((el, i) => columnScores[i] >= min);
    let prunedAssociations = data.filter((el, i) => columnScores[i] >= min);

    return {
        'data': prunedAssociations,
        'pathways': prunedPathways
    };
}


export function findAssociatedData(inputHash) {
    let {expression, copyNumber, geneList, pathways, samples, filter, min, selectedCohort} = inputHash;
    let key = JSON.stringify(inputHash);
    let data = associateCache.get(key);
    if (!data) {
        data = associateData(expression, copyNumber, geneList, pathways, samples, filter, min, selectedCohort);
        associateCache.set(key,data);
    }

    return data;
}

export function findPruneData(inputHash) {
    let {associatedData, pathways, filterMin} = inputHash;
    let key = JSON.stringify(inputHash);
    let data = pruneDataCache.get(key);
    if (!data) {
        data = pruneColumns(associatedData, pathways, filterMin);
        pruneDataCache.set(key,data);
    }
    return data;
}

export function createEmptyArray(pathwayLength,sampleLength){
    return times(pathwayLength, () => times(sampleLength, () => 0));
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
export function associateData(expression, copyNumber, geneList, pathways, samples, filter, min, selectedCohort) {
    filter = filter.indexOf('All') === 0 ? '' : filter;
    // let cnvArray = createEmptyArray(pathways.length,samples.length)
    let cnvArray = times(pathways.length, () => times(samples.length, () => 0));
    // let mutationArray = createEmptyArray(pathways.length,samples.length)
    let mutationArray = times(pathways.length, () => times(samples.length, () => 0));
    console.log('B:',cnvArray)
    console.log('C:',mutationArray)
    let sampleIndex = new Map(samples.map((v, i) => [v, i]));
    let genePathwayLookup = getGenePathwayLookup(pathways);


    // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
    if (!filter || filter === 'Mutation') {
        for (let row of expression.rows) {
            let effectValue = getMutationScore(row.effect, min);
            let pathwayIndices = genePathwayLookup(row.gene);

            for (let index of pathwayIndices) {
                mutationArray[index][sampleIndex.get(row.sample)] += effectValue;
                mutationArray[index][sampleIndex.get(row.sample)] += effectValue;
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
                        , selectedCohort ? selectedCohort.amplificationThreshold : 2
                        , selectedCohort ? selectedCohort.deletionThreshold : -2);
                    if (returnValue > 0) {
                        cnvArray[index][sampleEntryIndex] += returnValue;
                        cnvArray[index][sampleEntryIndex] += returnValue;
                    }
                }
            }
        }

    }


    return mutationArray;

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
