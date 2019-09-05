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
  case FILTER_ENUM.GENE_EXPRESSION:
    return datasetSamples(cohort.geneExpression.host, cohort.geneExpression.dataset, null);
  default:
    // eslint-disable-next-line no-console
    console.error('filter is not defined',filter);
  }
}

export function getAllSamplesForCohorts(cohort){
  return Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
    datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
    intersection
  );
}


export function createFilterCounts(mutationSamples,copyNumberSamples){
  let filterCounts = {};
  filterCounts[FILTER_ENUM.MUTATION] =  mutationSamples.length;
  filterCounts[FILTER_ENUM.COPY_NUMBER] =  copyNumberSamples.length;
  filterCounts[FILTER_ENUM.CNV_MUTATION] =  uniq(intersection(copyNumberSamples,mutationSamples)).length;
  return filterCounts;
}


export function calculateSubCohortSamples(availableSamples, cohort){
  if(cohort.selectedSubCohorts.length > 0){
    return uniq(intersection(availableSamples, getSamplesFromSelectedSubCohorts(cohort,availableSamples)));
  }
  else{
    return availableSamples;
  }
}

function getSamplesForFilter( mutationSamples,copyNumberSamples,geneExpressionSamples, filter){
  switch (filter) {
  case FILTER_ENUM.CNV_MUTATION:
    return uniq(intersection(mutationSamples, copyNumberSamples));
  case FILTER_ENUM.MUTATION:
    return mutationSamples;
  case FILTER_ENUM.COPY_NUMBER:
    return copyNumberSamples;
  case FILTER_ENUM.GENE_EXPRESSION:
    return geneExpressionSamples;
  default:
    // eslint-disable-next-line no-console
    console.error('invalid filter', filter);
    return [];
  }
}

// TODO: move into a service as an async method
export function fetchCombinedCohorts(selectedCohorts, pathways,filter, combinationHandler) {
  const geneList = getGenesForPathways(pathways);
  let filterCounts ;

  Rx.Observable.zip(
    datasetSamples(selectedCohorts[0].host, selectedCohorts[0].mutationDataSetId, null),
    datasetSamples(selectedCohorts[0].host, selectedCohorts[0].copyNumberDataSetId, null),
    datasetSamples(selectedCohorts[0].geneExpression.host, selectedCohorts[0].geneExpression.dataset, null),
    // TODO: add gene expression 0
    datasetSamples(selectedCohorts[1].host, selectedCohorts[1].mutationDataSetId, null),
    datasetSamples(selectedCohorts[1].host, selectedCohorts[1].copyNumberDataSetId, null),
    datasetSamples(selectedCohorts[1].geneExpression.host, selectedCohorts[1].geneExpression.dataset, null),
    // TODO: add gene expression 1
  ). flatMap((unfilteredSamples) => {
    // TODO: add gene expression with the second one
    filterCounts = [createFilterCounts(unfilteredSamples[0],unfilteredSamples[1]),createFilterCounts(unfilteredSamples[2],unfilteredSamples[3])];
    // with all of the samples, we can now provide accurate numbers, maybe better to store on the server, though
    // merge based on filter
    const availableSamples = [
      calculateSubCohortSamples(unfilteredSamples[0],selectedCohorts[0]),
      calculateSubCohortSamples(unfilteredSamples[1],selectedCohorts[0]),
      calculateSubCohortSamples(unfilteredSamples[2],selectedCohorts[0]),
      // TODO: add gene expression 0

      calculateSubCohortSamples(unfilteredSamples[3],selectedCohorts[1]),
      calculateSubCohortSamples(unfilteredSamples[4],selectedCohorts[1]),
      calculateSubCohortSamples(unfilteredSamples[5],selectedCohorts[1]),
      // TODO: add gene expression 1
    ];

    // calculate samples for what samples we will actually fetch
    // TODO: add gene expression
    const samplesA = getSamplesForFilter(availableSamples[0],availableSamples[1],availableSamples[2],filter[0]);
    const samplesB = getSamplesForFilter(availableSamples[2],availableSamples[3],availableSamples[4],filter[1]);

    // TODO: make this a testable function
    // TODO: minimize fetches based on the filter
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
        filterCounts,
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
