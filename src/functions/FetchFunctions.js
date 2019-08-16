import {getGenesForPathways, getSamplesFromSelectedSubCohorts} from "./CohortFunctions";
import {intersection, intersectLists} from "./MathFunctions";
let Rx = require('ucsc-xena-client/dist/rx');
let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, datasetFetch, sparseData} = xenaQuery;

export function getSamplesForCohort(cohort){
    // scrunches the two
        return Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
            datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
            intersection);
}

// TODO: move into a service as an async method
export function fetchCombinedCohorts(selectedCohorts,pathways,combinationHandler){

    // console.log('fetching with ',JSON.stringify(selectedCohorts),selectedCohorts)
    let geneList = getGenesForPathways(pathways);

    // this selects cohorts, not sub-cohorts
    // TODO: get working
    // TODO: extend to get subcohorts
    Rx.Observable.zip(
        getSamplesForCohort(selectedCohorts[0]),
        getSamplesForCohort(selectedCohorts[1]),
    ).flatMap((samples) => {

        const samplesA = selectedCohorts[0].selectedSubCohorts.length>0 ? intersection(samples[0],getSamplesFromSelectedSubCohorts(selectedCohorts[0])) : samples[0] ; // mutation
        const samplesB = selectedCohorts[1].selectedSubCohorts.length>0 ? intersection(samples[1],getSamplesFromSelectedSubCohorts(selectedCohorts[1])) : samples[1] ; // mutation

            return Rx.Observable.zip(
                sparseData(selectedCohorts[0].host, selectedCohorts[0].mutationDataSetId, samplesA, geneList),
                datasetFetch(selectedCohorts[0].host, selectedCohorts[0].copyNumberDataSetId, samplesA, geneList),
                datasetFetch(selectedCohorts[0].genomeBackgroundMutation.host, selectedCohorts[0].genomeBackgroundMutation.dataset, samplesA, [selectedCohorts[0].genomeBackgroundMutation.feature_event_K, selectedCohorts[0].genomeBackgroundMutation.feature_total_pop_N]),
                datasetFetch(selectedCohorts[0].genomeBackgroundCopyNumber.host, selectedCohorts[0].genomeBackgroundCopyNumber.dataset, samplesA, [selectedCohorts[0].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[0].genomeBackgroundCopyNumber.feature_total_pop_N]),
                sparseData(selectedCohorts[1].host, selectedCohorts[1].mutationDataSetId, samplesB, geneList),
                datasetFetch(selectedCohorts[1].host, selectedCohorts[1].copyNumberDataSetId, samplesB, geneList),
                datasetFetch(selectedCohorts[1].genomeBackgroundMutation.host, selectedCohorts[1].genomeBackgroundMutation.dataset, samplesB, [selectedCohorts[1].genomeBackgroundMutation.feature_event_K, selectedCohorts[1].genomeBackgroundMutation.feature_total_pop_N]),
                datasetFetch(selectedCohorts[1].genomeBackgroundCopyNumber.host, selectedCohorts[1].genomeBackgroundCopyNumber.dataset, samplesB, [selectedCohorts[1].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[1].genomeBackgroundCopyNumber.feature_total_pop_N]),
                (
                    mutationsA, copyNumberA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
                    mutationsB, copyNumberB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB
                ) => ({
                    samplesA,
                    mutationsA,
                    copyNumberA,
                    genomeBackgroundMutationA,
                    genomeBackgroundCopyNumberA,
                    samplesB,
                    mutationsB,
                    copyNumberB,
                    genomeBackgroundMutationB,
                    genomeBackgroundCopyNumberB,
                }))
        })
        .subscribe(({
                        samplesA, mutationsA, copyNumberA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
                        samplesB, mutationsB, copyNumberB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB
                    }) => {
            combinationHandler({
                geneList,
                pathways,
                samplesA,
                mutationsA,
                copyNumberA,
                genomeBackgroundMutationA,
                genomeBackgroundCopyNumberA,
                samplesB,
                mutationsB,
                copyNumberB,
                genomeBackgroundMutationB,
                genomeBackgroundCopyNumberB,
                selectedCohorts,
            });
        });
};
