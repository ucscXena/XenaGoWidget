import {
  getGenesForPathways,
  getSamplesFromSelectedSubCohorts,
  getSubCohortsForCohort
} from './CohortFunctions';
import { intersection} from './MathFunctions';

const Rx = require('ucsc-xena-client/dist/rx');
const xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
import { uniq} from 'underscore';
import {VIEW_ENUM} from '../data/ViewEnum';
import {UNASSIGNED_SUBTYPE} from '../components/SubCohortSelector';
import BpaPathways from '../data/genesets/BpaGeneExpressionGeneDataSet';
import ParadigmPathways from '../data/genesets/ParadigmGeneDataSet';
import FlybasePathways from '../data/genesets/FlyBaseGoPanCanGeneSets';
import RegulonPathways from '../data/genesets/LuadRegulonGeneSets';

const { sparseDataMatchPartialField, refGene, datasetSamples, datasetFetch, sparseData , datasetProbeValues , xenaPost } = xenaQuery;
const REFERENCE = refGene['hg38'];

export function getSamplesForCohort(cohort,filter) {
  // scrunches the two
  // TODO: will have to handle multiple lists at some point
  switch (filter) {
  case VIEW_ENUM.CNV_MUTATION:
    return Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
      datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
      intersection);
  case VIEW_ENUM.COPY_NUMBER:
    return datasetSamples(cohort.host, cohort.copyNumberDataSetId, null);
  case VIEW_ENUM.MUTATION:
    return datasetSamples(cohort.host, cohort.mutationDataSetId, null);
  case VIEW_ENUM.GENE_EXPRESSION:
    return datasetSamples(cohort.geneExpression.host, cohort.geneExpression.dataset, null);
  case VIEW_ENUM.PARADIGM:
    return datasetSamples(cohort.paradigm.host, cohort.paradigm.dataset, null);
  default:
    // eslint-disable-next-line no-console
    console.error('filter is not defined',filter);
  }
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

export function createFilterCounts(mutationSamples,copyNumberSamples,geneExpressionSamples,paradigmSamples, cohort){
  const intersectedCnvMutation = uniq(intersection(copyNumberSamples,mutationSamples));
  const intersectedCnvMutationSubCohortSamples = calculateSelectedSubCohortSamples(intersectedCnvMutation,cohort);
  const mutationSubCohortSamples = calculateSelectedSubCohortSamples(mutationSamples,cohort);
  const copyNumberSubCohortSamples = calculateSelectedSubCohortSamples(copyNumberSamples,cohort);
  const geneExpressionSubCohortSamples = calculateSelectedSubCohortSamples(geneExpressionSamples,cohort);
  const paradigmSubCohortSamples = calculateSelectedSubCohortSamples(paradigmSamples,cohort);
  let filterCounts = {};
  // calculate mutations per subfilter
  filterCounts[VIEW_ENUM.MUTATION] =  {
    available: mutationSamples.length,
    current:mutationSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(mutationSamples,cohort),
    unassigned: mutationSamples.filter( s => mutationSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[VIEW_ENUM.COPY_NUMBER] =  {
    available: copyNumberSamples.length,
    current: copyNumberSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(copyNumberSamples,cohort),
    unassigned: copyNumberSamples.filter( s => copyNumberSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[VIEW_ENUM.CNV_MUTATION] =  {
    available: intersectedCnvMutation.length,
    current: intersectedCnvMutationSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(intersectedCnvMutation,cohort),
    unassigned: copyNumberSamples.filter( s => intersectedCnvMutationSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[VIEW_ENUM.GENE_EXPRESSION] =  {
    available: geneExpressionSamples.length,
    current: geneExpressionSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(geneExpressionSamples,cohort),
    unassigned: geneExpressionSamples.filter( s => geneExpressionSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[VIEW_ENUM.PARADIGM] =  {
    available: paradigmSamples.length,
    current: paradigmSubCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(paradigmSamples,cohort),
    unassigned: paradigmSamples.filter( s => paradigmSubCohortSamples.indexOf(s)<0).length,
  };
  filterCounts[VIEW_ENUM.REGULON] =  {
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

function getSamplesForFilter( mutationSamples,copyNumberSamples,geneExpressionSamples, paradigmSamples, filter){
  switch (filter) {
  case VIEW_ENUM.CNV_MUTATION:
    return uniq(intersection(mutationSamples, copyNumberSamples));
  case VIEW_ENUM.MUTATION:
    return mutationSamples;
  case VIEW_ENUM.COPY_NUMBER:
    return copyNumberSamples;
  case VIEW_ENUM.GENE_EXPRESSION:
    return geneExpressionSamples;
  case VIEW_ENUM.PARADIGM:
    return paradigmSamples;
  case VIEW_ENUM.REGULON:
    return geneExpressionSamples;
  default:
    // eslint-disable-next-line no-console
    console.error('invalid filter', filter);
    return [];
  }
}

export const getGeneSetsForView = (view) => {
  console.log('getting gene sets for',view);
  switch (view) {
  case VIEW_ENUM.PARADIGM:
    return ParadigmPathways;
  case VIEW_ENUM.GENE_EXPRESSION:
    return BpaPathways;
  case VIEW_ENUM.REGULON:
    console.log('loaded regulon');
    return RegulonPathways;
  default:
    return FlybasePathways;
  }
};

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

function getHostData(cohort,view) {
  switch (view) {
  case VIEW_ENUM.PARADIGM:
    return cohort.paradigmPathwayActivity;
  case VIEW_ENUM.GENE_EXPRESSION:
    return cohort.paradigmPathwayActivity;
  case VIEW_ENUM.REGULON:
    return cohort.regulonPathwayActivity;
  default:
    console.error('can not get host data for ',cohort,view);
  }
}

export function allFieldMean(cohort, samples,view) {

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
  const { dataset, host} = getHostData(cohort,view) ;
  const query = `(${allFieldMeanQuery} ${quote(dataset)}  [${samples.map(quote).join(' ')}])`;
  return Rx.Observable.ajax(xenaPost(host, query)).map(xhr => JSON.parse(xhr.response));
}

export function fetchPathwayActivityBulk(selectedCohorts,samples,geneSetLabels,dataHandler){
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

export function lookupGeneByName(geneQuery,callback){
  let subscriber = sparseDataMatchPartialField(REFERENCE.host, 'name2', REFERENCE.name, geneQuery, REFERENCE.limit);
  subscriber.subscribe(matches => {
    callback(matches);
  });
}

export function getCohortDataForView(selectedCohorts,view){
  switch(view){
  case VIEW_ENUM.REGULON:
  case VIEW_ENUM.GENE_EXPRESSION:
    return [
      {
        host: selectedCohorts[0].geneExpression.host,
        dataset: selectedCohorts[0].geneExpression.dataset
      },
      {
        host: selectedCohorts[1].geneExpression.host,
        dataset: selectedCohorts[1].geneExpression.dataset
      },
    ];
  case VIEW_ENUM.PARADIGM:
    return [
      {
        host: selectedCohorts[0].paradigm.host,
        dataset: selectedCohorts[0].paradigm.dataset
      },
      {
        host: selectedCohorts[1].paradigm.host,
        dataset: selectedCohorts[1].paradigm.dataset
      },
    ];
  default:
    return null ;
  }

}

export function fetchBestPathways(selectedCohorts,view,dataHandler){

  const cohortData = getCohortDataForView(selectedCohorts,view);

  Rx.Observable.zip(
    datasetSamples(cohortData[0].host, cohortData[0].dataset, null),
    datasetSamples(cohortData[1].host, cohortData[1].dataset, null),
  )
    .flatMap((unfilteredSamples) => {
      const availableSamples = [
        calculateSelectedSubCohortSamples(unfilteredSamples[0],selectedCohorts[0]),
        calculateSelectedSubCohortSamples(unfilteredSamples[1],selectedCohorts[1]),
      ];

      return Rx.Observable.zip(
        allFieldMean(selectedCohorts[0], availableSamples[0],view),
        allFieldMean(selectedCohorts[1], availableSamples[1],view),
        (
          geneExpressionPathwayActivityA, geneExpressionPathwayActivityB
        ) => ({
          geneExpressionPathwayActivityA,
          geneExpressionPathwayActivityB,
        }),
      );
    })
    .subscribe( (output ) => {
      // get the average activity for each
      console.log('fetch best pathways',output);
      dataHandler(output);
    });
}

export function fetchPathwayActivityMeans(selectedCohorts,samples,view,dataHandler){

  Rx.Observable.zip(
    allFieldMean(selectedCohorts[0], samples[0],view),
    allFieldMean(selectedCohorts[1], samples[1],view),
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
    datasetSamples(selectedCohorts[0].paradigm.host, selectedCohorts[0].paradigm.dataset, null),
    // TODO: add gene expression 0
    datasetSamples(selectedCohorts[1].host, selectedCohorts[1].mutationDataSetId, null),
    datasetSamples(selectedCohorts[1].host, selectedCohorts[1].copyNumberDataSetId, null),
    datasetSamples(selectedCohorts[1].geneExpression.host, selectedCohorts[1].geneExpression.dataset, null),
    datasetSamples(selectedCohorts[1].paradigm.host, selectedCohorts[1].paradigm.dataset, null),
    // TODO: add gene expression 1
  ).flatMap((unfilteredSamples) => {

    // TODO: add gene expression with the second one
    filterCounts = [createFilterCounts(unfilteredSamples[0],
      unfilteredSamples[1],
      unfilteredSamples[2],
      unfilteredSamples[3],
      selectedCohorts[0]),
    createFilterCounts(unfilteredSamples[4],
      unfilteredSamples[5],
      unfilteredSamples[6],
      unfilteredSamples[7],
      selectedCohorts[1])];
    // with all of the samples, we can now provide accurate numbers, maybe better to store on the server, though
    // merge based on filter
    const availableSamples = [
      calculateSelectedSubCohortSamples(unfilteredSamples[0],selectedCohorts[0]),
      calculateSelectedSubCohortSamples(unfilteredSamples[1],selectedCohorts[0]),
      calculateSelectedSubCohortSamples(unfilteredSamples[2],selectedCohorts[0]),
      calculateSelectedSubCohortSamples(unfilteredSamples[3],selectedCohorts[0]),
      // TODO: add gene expression 0

      calculateSelectedSubCohortSamples(unfilteredSamples[4],selectedCohorts[1]),
      calculateSelectedSubCohortSamples(unfilteredSamples[5],selectedCohorts[1]),
      calculateSelectedSubCohortSamples(unfilteredSamples[6],selectedCohorts[1]),
      calculateSelectedSubCohortSamples(unfilteredSamples[7],selectedCohorts[1]),
      // TODO: add gene expression 1
    ];

    // calculate samples for what samples we will actually fetch
    const samplesA = getSamplesForFilter(availableSamples[0],availableSamples[1],availableSamples[2],availableSamples[3],filter);
    const samplesB = getSamplesForFilter(availableSamples[4],availableSamples[5],availableSamples[6],availableSamples[7],filter);

    // const geneSetLabels = convertPathwaysToGeneSetLabel(DefaultPathWays);
    const geneSetLabels = convertPathwaysToGeneSetLabel(pathways);

    function getRegulonFetch(selectedCohort,samples,geneSetLabels){
      if(selectedCohort.regulonPathwayActivity){
        console.log('returning a regulon ');
        return datasetProbeValues(selectedCohort.regulonPathwayActivity.host, selectedCohort.regulonPathwayActivity.dataset, samples, geneSetLabels) ;
      }
      else{
        return datasetProbeValues(selectedCohort.geneExpressionPathwayActivity.host, selectedCohort.geneExpressionPathwayActivity.dataset, samples, geneSetLabels);
      }
    }

    // TODO: make this a testable function
    // TODO: minimize fetches based on the filter
    console.log('selected cohorts',selectedCohorts);
    console.log('available samples',availableSamples);
    return Rx.Observable.zip(
      sparseData(selectedCohorts[0].host, selectedCohorts[0].mutationDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].host, selectedCohorts[0].copyNumberDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].geneExpression.host, selectedCohorts[0].geneExpression.dataset, samplesA, geneList),
      datasetProbeValues(selectedCohorts[0].geneExpressionPathwayActivity.host, selectedCohorts[0].geneExpressionPathwayActivity.dataset, samplesA, geneSetLabels),
      datasetProbeValues(selectedCohorts[0].paradigm.host, selectedCohorts[0].paradigm.dataset, samplesA, geneList),
      datasetProbeValues(selectedCohorts[0].paradigmPathwayActivity.host, selectedCohorts[0].paradigmPathwayActivity.dataset, samplesA, geneSetLabels),
      getRegulonFetch(selectedCohorts[0],samplesA,geneSetLabels),
      datasetFetch(selectedCohorts[0].genomeBackgroundMutation.host, selectedCohorts[0].genomeBackgroundMutation.dataset, samplesA, [selectedCohorts[0].genomeBackgroundMutation.feature_event_K, selectedCohorts[0].genomeBackgroundMutation.feature_total_pop_N]),
      datasetFetch(selectedCohorts[0].genomeBackgroundCopyNumber.host, selectedCohorts[0].genomeBackgroundCopyNumber.dataset, samplesA, [selectedCohorts[0].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[0].genomeBackgroundCopyNumber.feature_total_pop_N]),
      sparseData(selectedCohorts[1].host, selectedCohorts[1].mutationDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].host, selectedCohorts[1].copyNumberDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].geneExpression.host, selectedCohorts[1].geneExpression.dataset, samplesB, geneList),
      datasetProbeValues(selectedCohorts[1].geneExpressionPathwayActivity.host, selectedCohorts[1].geneExpressionPathwayActivity.dataset, samplesB, geneSetLabels),
      datasetProbeValues(selectedCohorts[1].paradigm.host, selectedCohorts[1].paradigm.dataset, samplesB, geneList),
      datasetProbeValues(selectedCohorts[1].paradigmPathwayActivity.host, selectedCohorts[1].paradigmPathwayActivity.dataset, samplesB, geneSetLabels),
      getRegulonFetch(selectedCohorts[1],samplesB,geneSetLabels),
      datasetFetch(selectedCohorts[1].genomeBackgroundMutation.host, selectedCohorts[1].genomeBackgroundMutation.dataset, samplesB, [selectedCohorts[1].genomeBackgroundMutation.feature_event_K, selectedCohorts[1].genomeBackgroundMutation.feature_total_pop_N]),
      datasetFetch(selectedCohorts[1].genomeBackgroundCopyNumber.host, selectedCohorts[1].genomeBackgroundCopyNumber.dataset, samplesB, [selectedCohorts[1].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[1].genomeBackgroundCopyNumber.feature_total_pop_N]),
      (
        mutationsA, copyNumberA, geneExpressionA, geneExpressionPathwayActivityA, paradigmA, paradigmPathwayActivityA, regulonPathwayActivityA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
        mutationsB, copyNumberB, geneExpressionB, geneExpressionPathwayActivityB, paradigmB, paradigmPathwayActivityB, regulonPathwayActivityB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
      ) => ({
        samplesA,
        mutationsA,
        copyNumberA,
        geneExpressionA,
        geneExpressionPathwayActivityA,
        paradigmA,
        paradigmPathwayActivityA,
        regulonPathwayActivityA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        geneExpressionB,
        geneExpressionPathwayActivityB,
        paradigmB,
        paradigmPathwayActivityB,
        regulonPathwayActivityB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
      }),
    );
  })
    .subscribe(({
      samplesA, mutationsA, copyNumberA, geneExpressionA, geneExpressionPathwayActivityA, paradigmA, paradigmPathwayActivityA, regulonPathwayActivityA, genomeBackgroundMutationA, genomeBackgroundCopyNumberA,
      samplesB, mutationsB, copyNumberB, geneExpressionB, geneExpressionPathwayActivityB, paradigmB, paradigmPathwayActivityB, regulonPathwayActivityB, genomeBackgroundMutationB, genomeBackgroundCopyNumberB,
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
        paradigmA,
        paradigmPathwayActivityA,
        regulonPathwayActivityA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        geneExpressionB,
        geneExpressionPathwayActivityB,
        paradigmB,
        paradigmPathwayActivityB,
        regulonPathwayActivityB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
        selectedCohorts,
      });
    });
}
