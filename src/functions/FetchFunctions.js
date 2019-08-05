import {AppStorageHandler} from "../service/AppStorageHandler";
import {getGenesForPathways, getSubCohortsOnlyForCohort} from "./CohortFunctions";
let Rx = require('ucsc-xena-client/dist/rx');
let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, sparseDataMatchPartialField, refGene, datasetFetch, sparseData} = xenaQuery;

function intersection(a, b) {
    let sa = new Set(a);
    return b.filter(x => sa.has(x));
}

// TODO: move into a service as an async method
export function fetchCombinedCohorts(selectedCohortA,selectedCohortB,cohortData,pathways,combinationHandler){

    console.log('selected  ohort A',selectedCohortA,selectedCohortB)

    // 1. TODO fetch cohort data
    // if (Object.keys(cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
    let cohortA = cohortData.find(c => c.name === selectedCohortA);
    let cohortB = cohortData.find(c => c.name === selectedCohortB);

    let selectedObjectA = {
        selected: selectedCohortA,
        selectedSubCohorts: getSubCohortsOnlyForCohort(selectedCohortA),
    };
    let selectedObjectB = {
        selected: selectedCohortB,
        selectedSubCohorts: getSubCohortsOnlyForCohort(selectedCohortB),
    };
    AppStorageHandler.storeCohortState(selectedObjectA, 0);
    AppStorageHandler.storeCohortState(selectedObjectB, 1);
    // this.setState({
    //     selectedCohort: selectedCohortA,
    //     selectedCohortData: cohortA,
    //     processing: true,
    // });
    // let pathways = this.getActiveApp().pathway;
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

            // console.log('returm  genomeBackgroundMutationA',JSON.stringify(genomeBackgroundMutationA));
            // console.log('returm  genomeBackgroundMutationB',JSON.stringify(genomeBackgroundMutationB));
            // console.log('returm  genomeBackgroundCopyNumberA',JSON.stringify(genomeBackgroundCopyNumberA));
            // console.log('returm  genomeBackgroundCopyNumberB',JSON.stringify(genomeBackgroundCopyNumberB));

            combinationHandler({
                geneList,
                cohortData,
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
                selectedObjectA,
                selectedObjectB,
            });
        });
};
