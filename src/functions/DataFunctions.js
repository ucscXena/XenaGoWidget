import mutationScores from '../data/mutationVector';
import {sum, times, memoize, range} from 'ucsc-xena-client/dist/underscore_ext';
import {izip, permutations} from 'itertools';
import lru from 'tiny-lru/lib/tiny-lru.es5'


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
    if (ignoreCache || !data) {
        data = associateData(expression, copyNumber, geneList, pathways, samples, filter, min, selectedCohort);
        associateCache.set(key,data);
    }

    return data;
}

export function findPruneData(inputHash) {
    let {associatedData, pathways, filterMin} = inputHash;
    let key = JSON.stringify(inputHash);
    let data = pruneDataCache.get(key);
    if (ignoreCache || !data) {
        data = pruneColumns(associatedData, pathways, filterMin);
        pruneDataCache.set(key,data);
    }
    return data;
}

export function createEmptyArray(pathwayLength,sampleLength){
    return times(pathwayLength, () => times(sampleLength, () => JSON.parse(JSON.stringify(DEFAULT_DATA_VALUE))));
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
                        , selectedCohort ? selectedCohort.amplificationThreshold : 2
                        , selectedCohort ? selectedCohort.deletionThreshold : -2);
                    if (returnValue > 0) {
                        returnArray[index][sampleEntryIndex].total += returnValue;
                        returnArray[index][sampleEntryIndex].cnv += returnValue;
                        returnArray[index][sampleEntryIndex].cnvHigh += getCopyNumberHigh(sampleEntries[sampleEntryIndex],selectedCohort ? selectedCohort.amplificationThreshold : 2);
                        returnArray[index][sampleEntryIndex].cnvLow += getCopyNumberLow(sampleEntries[sampleEntryIndex],selectedCohort ? selectedCohort.deletionThreshold : -2);
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
