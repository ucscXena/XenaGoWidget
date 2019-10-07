import {
  getGenesForPathways,
  getSamplesFromSelectedSubCohorts,
  getSubCohortsForCohort
} from './CohortFunctions';
import { intersection} from './MathFunctions';

const Rx = require('ucsc-xena-client/dist/rx');
const xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
import { uniq} from 'underscore';
import {FILTER_ENUM} from '../components/FilterSelector';
import {UNASSIGNED_SUBTYPE} from '../components/SubCohortSelector';
// import LargePathways from '../data/genesets/geneExpressionGeneDataSet';
// import DefaultPathWays from '../data/genesets/tgac';

const { datasetSamples, datasetFetch, sparseData , datasetProbeValues , xenaPost } = xenaQuery;

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


export function calculateSubCohortCounts(availableSamples, cohort) {
  const subCohorts = getSubCohortsForCohort(cohort.name);
  if(subCohorts && Object.keys(subCohorts).length > 0){
    const allSubCohortSamples = uniq(intersection(Object.values(subCohorts).flat(),availableSamples));
    let returnObject = Object.entries(subCohorts).map( c => {
      return {
        name: c[0],
        count: uniq(intersection(c[1],availableSamples)).length
      };
    });
    // if it contains a final object, then great . . .
    returnObject[Object.keys(subCohorts).length] = {
      name: UNASSIGNED_SUBTYPE.key,
      count: availableSamples.length - allSubCohortSamples.length
    };
    return returnObject ;
  }
  else{
    return [
      {
        name: UNASSIGNED_SUBTYPE.key,
        count: availableSamples.length,
      }
    ];
  }
}

export function createFilterCounts(mutationSamples,copyNumberSamples,geneExpressionSamples,cohort){
  const intersectedCnvMutation = uniq(intersection(copyNumberSamples,mutationSamples));
  const intersectedCnvMutationSubCohortSamples = calculateSelectedSubCohortSamples(intersectedCnvMutation,cohort);
  const mutationSubCohortSamples = calculateSelectedSubCohortSamples(mutationSamples,cohort);
  const copyNumberSubCohortSamples = calculateSelectedSubCohortSamples(copyNumberSamples,cohort);
  const geneExpressionSubCohortSamples = calculateSelectedSubCohortSamples(geneExpressionSamples,cohort);
  let filterCounts = {};
  // calculate mutations per subfilter
  filterCounts[FILTER_ENUM.MUTATION] =  {
    available: mutationSamples.length,
    current:mutationSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(mutationSamples,cohort),
    unassigned: mutationSamples.filter( s => mutationSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[FILTER_ENUM.COPY_NUMBER] =  {
    available: copyNumberSamples.length,
    current: copyNumberSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(copyNumberSamples,cohort),
    unassigned: copyNumberSamples.filter( s => copyNumberSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[FILTER_ENUM.CNV_MUTATION] =  {
    available: intersectedCnvMutation.length,
    current: intersectedCnvMutationSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(intersectedCnvMutation,cohort),
    unassigned: copyNumberSamples.filter( s => intersectedCnvMutationSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[FILTER_ENUM.GENE_EXPRESSION] =  {
    available: geneExpressionSamples.length,
    current: geneExpressionSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(geneExpressionSamples,cohort),
    unassigned: geneExpressionSamples.filter( s => geneExpressionSubCohortSamples.indexOf(s)<0).length,
  };
  return filterCounts;
}


export function calculateSelectedSubCohortSamples(availableSamples, cohort){
  // if UNASSIGNED is the only available sub cohort, then there are none really
  if(cohort.subCohorts && cohort.subCohorts.length > 1 && cohort.selectedSubCohorts.length > 0){
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

export const convertPathwaysToGeneSetLabel = (pathways) => {
  return pathways.map( p => {
    if(p.goid){
      return p.golabel +' ('+p.goid+')';
    }
    else{
      return p.golabel;
    }
  } );
};

const demoAllFieldMeanQuery =
  '; allFieldMean\n' +
  '(fn [dataset samples]\n' +
  '  (let [fields (map :name (query {:select [:field.name]\n' +
  '                                  :from [:field]\n' +
  '                                  :join [:dataset [:= :dataset.id :dataset_id]]\n' +
  '                                  :where [:and [:= :dataset.name dataset] [:<> :field.name "sampleID"]]}))\n' +
  '        data (fetch [{:table dataset\n' +
  '                      :columns fields\n' +
  '                      :samples samples}])]\n' +
  '  {:field fields\n' +
  '   :mean (map car (mean data 1))}))';

const quote = x => '"' + x + '"';

export function demoAllFieldMean(host, dataset, samples) {
  const query = `(${demoAllFieldMeanQuery} ${quote(dataset)} [${samples.map(quote).join(' ')}])`;
  return Rx.Observable.ajax(xenaPost(host, query)).map(xhr => JSON.parse(xhr.response));
}

/////// demo
const demoSamples = [
  'TCGA-AB-2815-03',
  'TCGA-AB-2817-03',
  'TCGA-AB-2818-03',
  'TCGA-AB-2819-03',
  'TCGA-AB-2820-03',
  'TCGA-AB-2821-03',
  'TCGA-AB-2822-03',
  'TCGA-AB-2823-03',
  'TCGA-AB-2825-03',
  'TCGA-AB-2826-03',
  'TCGA-AB-2828-03',
  'TCGA-AB-2830-03',
  'TCGA-AB-2834-03',
  'TCGA-AB-2835-03',
  'TCGA-AB-2836-03',
  'TCGA-AB-2839-03',
  'TCGA-AB-2840-03',
  'TCGA-AB-2841-03',
  'TCGA-AB-2842-03',
  'TCGA-AB-2843-03'
];

export function demoAllFieldMeanRunner(){


  demoAllFieldMean('https://xenago.xenahubs.net', 'expr_tpm/TCGA-LAML_tpm_tab.tsv', demoSamples).subscribe(data => {
    console.log('demo data');
    console.log(data);
  });

}

export function allFieldMean(cohort, samples) {

  const allFieldMeanQuery =
    '; allFieldMean\n' +
    '(fn [dataset samples]\n' +
    '  (let [fields (map :name (query {:select [:field.name]\n' +
    '                                  :from [:field]\n' +
    '                                  :join [:dataset [:= :dataset.id :dataset_id]]\n' +
    '                                  :where [:and [:= :dataset.name dataset] [:<> :field.name "sampleID"]]}))\n' +
    '        data (fetch [{:table dataset\n' +
    '                      :columns fields\n' +
    '                      :samples samples}])]\n' +
    '  {:field fields\n' +
    '   :mean (map car (mean data 1))}))';
  const quote = x => '"' + x + '"';
  const { dataset, host} = cohort.geneExpressionPathwayActivity;
  const query = `(${allFieldMeanQuery} ${quote(dataset)}  [${samples.map(quote).join(' ')}])`;
  return Rx.Observable.ajax(xenaPost(host, query)).map(xhr => JSON.parse(xhr.response));
}

export function fetchPathwayActivityMeans(selectedCohorts,samples,geneSetLabels,dataHandler){

  // demoAllFieldMeanRunner();

  allFieldMean(selectedCohorts[0], samples[0],geneSetLabels).subscribe(data => {
    console.log('demo data');
    console.log(data);
  });


  Rx.Observable.zip(
    datasetProbeValues(selectedCohorts[0].geneExpressionPathwayActivity.host, selectedCohorts[0].geneExpressionPathwayActivity.dataset, samples[0], geneSetLabels),
    datasetProbeValues(selectedCohorts[1].geneExpressionPathwayActivity.host, selectedCohorts[1].geneExpressionPathwayActivity.dataset, samples[1], geneSetLabels),
    (
      geneExpressionPathwayActivityA, geneExpressionPathwayActivityB
    ) => ({
      geneExpressionPathwayActivityA,
      geneExpressionPathwayActivityB,
    }),
  )
    .subscribe( (output ) => {
      // get the average activity for each
      dataHandler(output);
    });
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
    filterCounts = [createFilterCounts(unfilteredSamples[0],unfilteredSamples[1],unfilteredSamples[2],selectedCohorts[0]),createFilterCounts(unfilteredSamples[3],unfilteredSamples[4],unfilteredSamples[5],selectedCohorts[1])];
    // with all of the samples, we can now provide accurate numbers, maybe better to store on the server, though
    // merge based on filter
    const availableSamples = [
      calculateSelectedSubCohortSamples(unfilteredSamples[0],selectedCohorts[0]),
      calculateSelectedSubCohortSamples(unfilteredSamples[1],selectedCohorts[0]),
      calculateSelectedSubCohortSamples(unfilteredSamples[2],selectedCohorts[0]),
      // TODO: add gene expression 0

      calculateSelectedSubCohortSamples(unfilteredSamples[3],selectedCohorts[1]),
      calculateSelectedSubCohortSamples(unfilteredSamples[4],selectedCohorts[1]),
      calculateSelectedSubCohortSamples(unfilteredSamples[5],selectedCohorts[1]),
      // TODO: add gene expression 1
    ];

    // calculate samples for what samples we will actually fetch
    const samplesA = getSamplesForFilter(availableSamples[0],availableSamples[1],availableSamples[2],filter[0]);
    const samplesB = getSamplesForFilter(availableSamples[3],availableSamples[4],availableSamples[5],filter[1]);

    // const geneSetLabels = convertPathwaysToGeneSetLabel(DefaultPathWays);
    const geneSetLabels = convertPathwaysToGeneSetLabel(pathways);

    // TODO: make this a testable function
    // TODO: minimize fetches based on the filter
    return Rx.Observable.zip(
      sparseData(selectedCohorts[0].host, selectedCohorts[0].mutationDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].host, selectedCohorts[0].copyNumberDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].geneExpression.host, selectedCohorts[0].geneExpression.dataset, samplesA, geneList),
      datasetProbeValues(selectedCohorts[0].geneExpressionPathwayActivity.host, selectedCohorts[0].geneExpressionPathwayActivity.dataset, samplesA, geneSetLabels),
      datasetFetch(selectedCohorts[0].genomeBackgroundMutation.host, selectedCohorts[0].genomeBackgroundMutation.dataset, samplesA, [selectedCohorts[0].genomeBackgroundMutation.feature_event_K, selectedCohorts[0].genomeBackgroundMutation.feature_total_pop_N]),
      datasetFetch(selectedCohorts[0].genomeBackgroundCopyNumber.host, selectedCohorts[0].genomeBackgroundCopyNumber.dataset, samplesA, [selectedCohorts[0].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[0].genomeBackgroundCopyNumber.feature_total_pop_N]),
      sparseData(selectedCohorts[1].host, selectedCohorts[1].mutationDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].host, selectedCohorts[1].copyNumberDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].geneExpression.host, selectedCohorts[1].geneExpression.dataset, samplesB, geneList),
      datasetProbeValues(selectedCohorts[1].geneExpressionPathwayActivity.host, selectedCohorts[1].geneExpressionPathwayActivity.dataset, samplesB, geneSetLabels),
      datasetFetch(selectedCohorts[1].genomeBackgroundMutation.host, selectedCohorts[1].genomeBackgroundMutation.dataset, samplesB, [selectedCohorts[1].genomeBackgroundMutation.feature_event_K, selectedCohorts[1].genomeBackgroundMutation.feature_total_pop_N]),
      datasetFetch(selectedCohorts[1].genomeBackgroundCopyNumber.host, selectedCohorts[1].genomeBackgroundCopyNumber.dataset, samplesB, [selectedCohorts[1].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[1].genomeBackgroundCopyNumber.feature_total_pop_N]),
      (
        mutationsA, copyNumberA, geneExpressionA,geneExpressionPathwayActivityA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
        mutationsB, copyNumberB, geneExpressionB, geneExpressionPathwayActivityB,genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
      ) => ({
        samplesA,
        mutationsA,
        copyNumberA,
        geneExpressionA,
        geneExpressionPathwayActivityA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        geneExpressionB,
        geneExpressionPathwayActivityB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
      }),
    );
  })
    .subscribe(({
      samplesA, mutationsA, copyNumberA, geneExpressionA, geneExpressionPathwayActivityA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
      samplesB, mutationsB, copyNumberB, geneExpressionB, geneExpressionPathwayActivityB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
    }) => {
      combinationHandler({
        geneList,
        pathways,
        filterCounts,
        samplesA,
        mutationsA,
        copyNumberA,
        geneExpressionA,
        geneExpressionPathwayActivityA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        geneExpressionB,
        geneExpressionPathwayActivityB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
        selectedCohorts,
      });
    });
}
