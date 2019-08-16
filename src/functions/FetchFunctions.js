import {getGenesForPathways, getSubCohortsOnlyForCohort} from "./CohortFunctions";
import {COHORT_DATA} from "../components/XenaGeneSetApp";
let Rx = require('ucsc-xena-client/dist/rx');
let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, datasetFetch, sparseData} = xenaQuery;

function intersection(a, b) {
    let sa = new Set(a);
    return b.filter(x => sa.has(x));
}

// TODO: move into a service as an async method
export function fetchCombinedCohorts(selectedCohorts,pathways,combinationHandler){

    // 1. TODO fetch cohort data
    // if (Object.keys(cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
    let cohortA = COHORT_DATA.find(c => c.name === selectedCohorts[0].name);
    let cohortB = COHORT_DATA.find(c => c.name === selectedCohorts[1].name);

    // console.log('fetching with ',JSON.stringify(selectedCohorts),selectedCohorts)
    let geneList = getGenesForPathways(pathways);

    // this selects cohorts, not sub-cohorts
    // TODO: get working
    // TODO: extend to get subcohorts
    Rx.Observable.zip(
        Rx.Observable.zip(datasetSamples(cohortA.host, cohortA.mutationDataSetId, null),
            datasetSamples(cohortA.host, cohortA.copyNumberDataSetId, null),
            intersection),
        Rx.Observable.zip(datasetSamples(cohortB.host, cohortB.mutationDataSetId, null),
            datasetSamples(cohortB.host, cohortB.copyNumberDataSetId, null),
            intersection)
    ).flatMap((samples) => {
        const samplesA = samples[0];
        const samplesB = samples[1];
            return Rx.Observable.zip(
                sparseData(cohortA.host, cohortA.mutationDataSetId, samplesA, geneList),
                datasetFetch(cohortA.host, cohortA.copyNumberDataSetId, samplesA, geneList),
                datasetFetch(cohortA.genomeBackgroundMutation.host, cohortA.genomeBackgroundMutation.dataset, samplesA, [cohortA.genomeBackgroundMutation.feature_event_K, cohortA.genomeBackgroundMutation.feature_total_pop_N]),
                datasetFetch(cohortA.genomeBackgroundCopyNumber.host, cohortA.genomeBackgroundCopyNumber.dataset, samplesA, [cohortA.genomeBackgroundCopyNumber.feature_event_K, cohortA.genomeBackgroundCopyNumber.feature_total_pop_N]),
                sparseData(cohortB.host, cohortB.mutationDataSetId, samplesB, geneList),
                datasetFetch(cohortB.host, cohortB.copyNumberDataSetId, samplesB, geneList),
                datasetFetch(cohortB.genomeBackgroundMutation.host, cohortB.genomeBackgroundMutation.dataset, samplesB, [cohortB.genomeBackgroundMutation.feature_event_K, cohortB.genomeBackgroundMutation.feature_total_pop_N]),
                datasetFetch(cohortB.genomeBackgroundCopyNumber.host, cohortB.genomeBackgroundCopyNumber.dataset, samplesB, [cohortB.genomeBackgroundCopyNumber.feature_event_K, cohortB.genomeBackgroundCopyNumber.feature_total_pop_N]),
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
                cohortA,
                samplesB,
                mutationsB,
                copyNumberB,
                genomeBackgroundMutationB,
                genomeBackgroundCopyNumberB,
                cohortB,
                selectedCohorts,
            });
        });
};
