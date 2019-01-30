import mutationScores from '../data/mutationVector';
import {sum, times, memoize, range} from 'underscore';
import {isEqual, omit} from 'underscore';


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
    let columnScores = data.map(sum);

    let prunedPathways = pathways.filter((el, i) => columnScores[i] >= min);
    let prunedAssociations = data.filter((el, i) => columnScores[i] >= min);

    return {
        'data': prunedAssociations,
        'pathways': prunedPathways
    };
}

let associationDataHash = null;
let associationDataCache = null;

let pruneHash = null;
let pruneCache = null;

export function findAssociatedData(inputHash) {
    if (!isEqual(omit(associationDataHash, ['cohortIndex']), omit(inputHash, ['cohortIndex']))) {
        let {expression, copyNumber, geneList, pathways, samples, filter, min, cohortIndex, selectedCohort} = inputHash;
        associationDataCache = associateData(expression, copyNumber, geneList, pathways, samples, filter, min, cohortIndex, selectedCohort);
        associationDataHash = inputHash;
    }
    return associationDataCache;
}

export function findPruneData(inputHash) {
    if (!isEqual(pruneHash, inputHash)) {
        let {associatedData, pathways, filterMin} = inputHash;
        pruneCache = pruneColumns(associatedData, pathways, filterMin);
        pruneHash = inputHash;
    }
    return pruneCache;
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
 * @param key
 * @param selectedCohort
 * @returns {any[]}
 */
export function associateData(expression, copyNumber, geneList, pathways, samples, filter, min, key, selectedCohort) {
    filter = filter.indexOf('All') === 0 ? '' : filter;
    let returnArray = times(pathways.length, () => times(samples.length, () => 0));
    let sampleIndex = new Map(samples.map((v, i) => [v, i]));
    let genePathwayLookup = getGenePathwayLookup(pathways);



    // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
    if (!filter || filter === 'Mutation') {
        for (let row of expression.rows) {
            let effectValue = getMutationScore(row.effect, min);
            let pathwayIndices = genePathwayLookup(row.gene);

            for (let index of pathwayIndices) {
                returnArray[index][sampleIndex.get(row.sample)] += effectValue;
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
                        returnArray[index][sampleEntryIndex] += returnValue;
                    }
                }
            }
        }

    }


    return returnArray;

}

export function addIndepProb(prob_list) {  //  p = PA + PB - PAB, etc
    // let total_prob = 0.0;
    // let sign = 0;

    // hack:
    if (prob_list.length === 1) {
        return prob_list[0];
    }
    else if (prob_list.length === 2) {
        return prob_list[0] + prob_list[1] - (prob_list[0] * prob_list[1]);
    }
    return 0;


    // for (let i = 1; i <= prob_list.length; i++) {
    //     if (i % 2) {
    //         sign = 1.0
    //     }
    //     else {
    //         sign = -1.0
    //     }
    //     // https://www.npmjs.com/package/itertools
    //
    //     // const xs = [1, 2, 3, 4];
    //     // const ys = ['hello', 'there'];
    //     // for (const [x, y] of izip(xs, cycle(prob_list))) {
    //     //     if(i < 5){
    //     //         console.log(x, y);
    //     //     }
    //     // }
    //     // 		for combo in combinations(prob_list, i):
    //     // 			total_prob = total_prob + reduce(lambda x,y: x*y, combo, 1) * sign
    // }
    // return total_prob;
}
