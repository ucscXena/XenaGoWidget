import {AppStorageHandler} from "../service/AppStorageHandler";
import {getSubCohortsOnlyForCohort} from "./CohortFunctions";
let Rx = require('ucsc-xena-client/dist/rx');
let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, sparseDataMatchPartialField, refGene, datasetFetch, sparseData} = xenaQuery;

function intersection(a, b) {
    let sa = new Set(a);
    return b.filter(x => sa.has(x));
}

export function fetchCohorts(selectedCohortA,selectedCohortB,pathways){
    if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
    let cohortA = this.state.cohortData.find(c => c.name === selectedCohortA);
    let cohortB = this.state.cohortData.find(c => c.name === selectedCohortB);

    // let selectedObjectA = {
    //     selected: selectedCohortA,
    //     selectedSubCohorts: getSubCohortsOnlyForCohort(selectedCohortA),
    // };
    // AppStorageHandler.storeCohortState(selectedObjectA, this.state.key);
    // this.setState({
    //     selectedCohort: selectedCohortA,
    //     selectedCohortData: cohortA,
    //     processing: true,
    // });
    let geneList = this.getGenesForPathways(pathways);


    Rx.Observable.zip(datasetSamples(cohortA.host, cohortA.mutationDataSetId, null),
        datasetSamples(cohortA.host, cohortA.copyNumberDataSetId, null),
        intersection)
        .flatMap((samples) => {
            return Rx.Observable.zip(
                sparseData(cohortA.host, cohortA.mutationDataSetId, samples, geneList),
                datasetFetch(cohortA.host, cohortA.copyNumberDataSetId, samples, geneList),
                datasetFetch(cohortA.genomeBackgroundMutation.host, cohortA.genomeBackgroundMutation.dataset, samples, [cohortA.genomeBackgroundMutation.feature_event_K, cohortA.genomeBackgroundMutation.feature_total_pop_N]),
                datasetFetch(cohortA.genomeBackgroundCopyNumber.host, cohortA.genomeBackgroundCopyNumber.dataset, samples, [cohortA.genomeBackgroundCopyNumber.feature_event_K, cohortA.genomeBackgroundCopyNumber.feature_total_pop_N]),
                (mutations, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber) => ({
                    mutations,
                    samples,
                    copyNumber,
                    genomeBackgroundMutation,
                    genomeBackgroundCopyNumber
                }))
        })
        .subscribe(({mutations, samples, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber}) => {
            this.handleCohortData({
                mutations,
                samples,
                copyNumber,
                genomeBackgroundMutation,
                genomeBackgroundCopyNumber,
                geneList,
                cohort: cohortA
            });
        });

}

// TODO: move into a service as an async method
export function fetchCombinedCohorts(selectedCohortA,selectedCohortB){
    if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
    let cohortA = this.state.cohortData.find(c => c.name === selectedCohortA);
    let cohortB = this.state.cohortData.find(c => c.name === selectedCohortB);

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
    let pathways = this.getActiveApp().pathway;
    let geneList = this.getGenesForPathways(pathways);

    // this selects cohorts, not sub-cohorts
    // TODO: get working
    // TODO: extend to get subcohorts

    Rx.Observable.zip(datasetSamples(cohortA.host, cohortA.mutationDataSetId, null),
        datasetSamples(cohortA.host, cohortA.copyNumberDataSetId, null),
        intersection)
        .flatMap((samples) => {
            return Rx.Observable.zip(
                sparseData(cohortA.host, cohortA.mutationDataSetId, samples, geneList),
                datasetFetch(cohortA.host, cohortA.copyNumberDataSetId, samples, geneList),
                datasetFetch(cohortA.genomeBackgroundMutation.host, cohortA.genomeBackgroundMutation.dataset, samples, [cohortA.genomeBackgroundMutation.feature_event_K, cohortA.genomeBackgroundMutation.feature_total_pop_N]),
                datasetFetch(cohortA.genomeBackgroundCopyNumber.host, cohortA.genomeBackgroundCopyNumber.dataset, samples, [cohortA.genomeBackgroundCopyNumber.feature_event_K, cohortA.genomeBackgroundCopyNumber.feature_total_pop_N]),


                (
                    mutationsA, copyNumberA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
                    mutationsB, copyNumberB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB
                ) => ({
                    samples,
                    mutationsA,
                    copyNumberA,
                    genomeBackgroundMutationA,
                    genomeBackgroundCopyNumberA,
                    mutationsB,
                    copyNumberB,
                    genomeBackgroundMutationB,
                    genomeBackgroundCopyNumberB,

                }))
        })
        .subscribe(({
                        samples,
                        mutationsA, copyNumberA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
                        mutationsB, copyNumberB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB
                    }) => {

            this.handleCombinedCohortData({
                samples,
                geneList,

                mutationsA,
                copyNumberA,
                genomeBackgroundMutationA,
                genomeBackgroundCopyNumberA,
                cohortA,
                mutationsB,
                copyNumberB,
                genomeBackgroundMutationB,
                genomeBackgroundCopyNumberB,
                cohortB,
            });
        });
};
