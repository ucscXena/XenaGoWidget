import { getGenesForPathways, getSamplesFromSelectedSubCohorts } from './CohortFunctions';
import { intersection} from './MathFunctions';

const Rx = require('ucsc-xena-client/dist/rx');
const xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
import { uniq} from 'underscore';
import {FILTER_ENUM} from '../components/FilterSelector';

const { datasetSamples, datasetFetch, sparseData } = xenaQuery;

export function getSamplesForCohort(cohort,filter) {
  // scrunches the two
  // TODO: will have to handle multiple lists at some point
  switch (filter) {
  case FILTER_ENUM.CNV_MUTATION:
    return Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
      datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
      intersection);
  case FILTER_ENUM.COPY_NUMBER:
    return datasetSamples(cohort.host, cohort.copyNumberDataSetId, null);
  case FILTER_ENUM.MUTATION:
    return datasetSamples(cohort.host, cohort.mutationDataSetId, null);
  default:
    // eslint-disable-next-line no-console
    console.error('filter is not defined',filter);
  }
}

export function getAllSamplesForCohorts(cohort){
  return Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
    datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
    cohort.geneExpression ? datasetSamples(cohort.geneExpression.host, cohort.geneExpression.dataset, null): [],
  );
}

export function calculateSamples(availableSamples,cohort){
  if(cohort.selectedSubCohorts.length > 0){
    return uniq(intersection(availableSamples, getSamplesFromSelectedSubCohorts(cohort,availableSamples)));
  }
  else{
    return availableSamples;
  }
}

// TODO: move into a service as an async method
export function fetchCombinedCohorts(selectedCohorts, pathways,filter, combinationHandler) {
  const geneList = getGenesForPathways(pathways);

  Rx.Observable.zip(
    getAllSamplesForCohorts(selectedCohorts[0]),
    getAllSamplesForCohorts(selectedCohorts[1]),
  ).flatMap((availableSamples) => {
    // with all of the samples, we can now provide accurate numbers, maybe better to store on the server, though
    // const geneExpression =


    // calculate samples for what samples we will actually fetch
    const samplesA = calculateSamples(availableSamples[0],selectedCohorts[0]);
    const samplesB = calculateSamples(availableSamples[1],selectedCohorts[1]);

    // TODO: make this a testable function
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
        mutationsB, copyNumberB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
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
      }),
    );
  })
    .subscribe(({
      samplesA, mutationsA, copyNumberA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
      samplesB, mutationsB, copyNumberB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
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
}
