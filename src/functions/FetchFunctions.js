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
  case FILTER_ENUM.ALL:
    return Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
      datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
      intersection);
  case FILTER_ENUM.COPY_NUMBER:
    return datasetSamples(cohort.host, cohort.copyNumberDataSetId, null);
  case FILTER_ENUM.MUTATION:
    return datasetSamples(cohort.host, cohort.mutationDataSetId, null);
  case FILTER_ENUM.GENE_EXPRESSION:
    return datasetSamples(cohort.geneExpression.host, cohort.geneExpression.dataset, null);
  default:
    // eslint-disable-next-line no-console
    console.error('filter is not defined',filter);
  }
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
    getSamplesForCohort(selectedCohorts[0],filter[0]),
    getSamplesForCohort(selectedCohorts[1],filter[1]),
  ).flatMap((availableSamples) => {
    const samplesA = calculateSamples(availableSamples[0],selectedCohorts[0]);
    const samplesB = calculateSamples(availableSamples[1],selectedCohorts[1]);

    // TODO: make this a testable function
    return Rx.Observable.zip(
      sparseData(selectedCohorts[0].host, selectedCohorts[0].mutationDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].host, selectedCohorts[0].copyNumberDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].geneExpression.host, selectedCohorts[0].geneExpression.dataset, samplesA, geneList),
      datasetFetch(selectedCohorts[0].genomeBackgroundMutation.host, selectedCohorts[0].genomeBackgroundMutation.dataset, samplesA, [selectedCohorts[0].genomeBackgroundMutation.feature_event_K, selectedCohorts[0].genomeBackgroundMutation.feature_total_pop_N]),
      datasetFetch(selectedCohorts[0].genomeBackgroundCopyNumber.host, selectedCohorts[0].genomeBackgroundCopyNumber.dataset, samplesA, [selectedCohorts[0].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[0].genomeBackgroundCopyNumber.feature_total_pop_N]),
      sparseData(selectedCohorts[1].host, selectedCohorts[1].mutationDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].host, selectedCohorts[1].copyNumberDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].geneExpression.host, selectedCohorts[1].geneExpression.dataset, samplesB, geneList),
      datasetFetch(selectedCohorts[1].genomeBackgroundMutation.host, selectedCohorts[1].genomeBackgroundMutation.dataset, samplesB, [selectedCohorts[1].genomeBackgroundMutation.feature_event_K, selectedCohorts[1].genomeBackgroundMutation.feature_total_pop_N]),
      datasetFetch(selectedCohorts[1].genomeBackgroundCopyNumber.host, selectedCohorts[1].genomeBackgroundCopyNumber.dataset, samplesB, [selectedCohorts[1].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[1].genomeBackgroundCopyNumber.feature_total_pop_N]),
      (
        mutationsA, copyNumberA, geneExpressionA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
        mutationsB, copyNumberB, geneExpressionB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
      ) => ({
        samplesA,
        mutationsA,
        copyNumberA,
        geneExpressionA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        geneExpressionB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
      }),
    );
  })
    .subscribe(({
      samplesA, mutationsA, copyNumberA, geneExpressionA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
      samplesB, mutationsB, copyNumberB, geneExpressionB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
    }) => {
      combinationHandler({
        geneList,
        pathways,
        samplesA,
        mutationsA,
        copyNumberA,
        geneExpressionA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        geneExpressionB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
        selectedCohorts,
      });
    });
}
