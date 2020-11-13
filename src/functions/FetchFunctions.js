import {
  getGenesForPathways,
  getSamplesFromSelectedSubCohorts,
  getSubCohortsForCohort
} from './CohortFunctions'
import { intersection} from './MathFunctions'

const Rx = require('ucsc-xena-client/dist/rx')
const xenaQuery = require('ucsc-xena-client/dist/xenaQuery')
import {VIEW_ENUM} from '../data/ViewEnum'
import {UNASSIGNED_SUBTYPE} from '../components/SubCohortSelector'
import BpaPathways from '../data/genesets/BpaGeneExpressionGeneDataSet'
import ParadigmPathways from '../data/genesets/ParadigmGeneDataSet'
import FlybasePathways from '../data/genesets/FlyBaseGoPanCanGeneSets'
import RegulonPathways from '../data/genesets/LuadRegulonGeneSets'

// eslint-disable-next-line no-unused-vars
const { sparseDataMatchPartialField, refGene, datasetSamples, datasetFetch, sparseData , datasetProbeValues , xenaPost } = xenaQuery
const REFERENCE = refGene['hg38']

export function getSamplesForCohortAndView(cohort, view) {
  // scrunches the two
  // TODO: will have to handle multiple lists at some point
  switch (view) {
  case VIEW_ENUM.CNV_MUTATION:
    return Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
      datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
      intersection)
  case VIEW_ENUM.COPY_NUMBER:
    return datasetSamples(cohort.host, cohort.copyNumberDataSetId, null)
  case VIEW_ENUM.MUTATION:
    return datasetSamples(cohort.host, cohort.mutationDataSetId, null)
  case VIEW_ENUM.REGULON:
  case VIEW_ENUM.GENE_EXPRESSION:
    return datasetSamples(cohort.geneExpression.host, cohort.geneExpression.dataset, null)
  case VIEW_ENUM.PARADIGM:
    return datasetSamples(cohort.paradigm.host, cohort.paradigm.dataset, null)
  default:
    // eslint-disable-next-line no-console
    console.error('filter is not defined',view)
  }
}

export function calculateSubCohortCounts(availableSamples, cohort) {
  const subCohorts = getSubCohortsForCohort(cohort.name)
  if(subCohorts && Object.keys(subCohorts).length > 0){
    const allSubCohortSamples = intersection(Object.values(subCohorts).flat(),availableSamples)
    let returnObject = Object.entries(subCohorts).map( c => {
      return {
        name: c[0],
        count: intersection(c[1],availableSamples).length
      }
    })
    // if it contains a final object, then great . . .
    returnObject[Object.keys(subCohorts).length] = {
      name: UNASSIGNED_SUBTYPE.key,
      count: availableSamples.length - allSubCohortSamples.length
    }
    return returnObject
  }
  else{
    return [
      {
        name: UNASSIGNED_SUBTYPE.key,
        count: availableSamples.length,
      }
    ]
  }
}
export function createFilterCountForView(samples, cohort,view){

  let filterCounts = {}
  for( let viewEnum in VIEW_ENUM){
    filterCounts[viewEnum] = {}
  }

  const subCohortSamples = calculateSelectedSubCohortSamples(samples,cohort)
  filterCounts[view] = {
    available: samples.length,
    current:subCohortSamples.length,
    subCohortCounts : calculateSubCohortCounts(samples,cohort),
    unassigned: samples.filter( s => subCohortSamples.indexOf(s)<0).length,
  }
  return filterCounts
}

export function calculateSelectedSubCohortSamples(availableSamples, cohort){
  // if UNASSIGNED is the only available sub cohort, then there are none really
  if(cohort.subCohorts && cohort.subCohorts.length > 1 && cohort.selectedSubCohorts.length > 0){
    const results = intersection(availableSamples, getSamplesFromSelectedSubCohorts(cohort,availableSamples))
    if(results.length===0){
      // eslint-disable-next-line no-console
      console.error(`NOTE: no samples are available for the selected sub cohort(s) ${cohort.name} / ${cohort.selectedSubCohorts} so returning all available samples`)
      // alert(`NOTE: no samples are available for the selected sub cohort(s) ${cohort.name} / ${cohort.selectedSubCohorts} so returning all available samples`)
      return availableSamples
    }
    return results
  }
  else{
    return availableSamples
  }
}

export const getGeneSetsForView = (view) => {

  switch (view) {
  case VIEW_ENUM.PARADIGM:
    return ParadigmPathways
  case VIEW_ENUM.GENE_EXPRESSION:
    return BpaPathways
  case VIEW_ENUM.REGULON:
    return RegulonPathways
  default:
    return FlybasePathways
  }
}

export const convertPathwaysToGeneSetLabel = (pathways) => {
  return pathways.map( p => {
    if(p.goid){
      return p.golabel +' ('+p.goid+')'
    }
    else{
      return p.golabel
    }
  } )
}

export function getHostForGeneData(cohort, view) {
  switch (view) {
  case VIEW_ENUM.PARADIGM:
  case VIEW_ENUM.GENE_EXPRESSION:
  case VIEW_ENUM.REGULON:
    return cohort.geneExpression
  case VIEW_ENUM.COPY_NUMBER:
    return cohort.copyNumber
  case VIEW_ENUM.MUTATION:
    return cohort.copyNumber
  default:
    // eslint-disable-next-line no-console
    console.error('can not get host data for ',cohort,view)
  }
}

export function getHostGeneSetData(cohort, view) {
  switch (view) {
  case VIEW_ENUM.PARADIGM:
    return cohort.paradigmPathwayActivity
  case VIEW_ENUM.GENE_EXPRESSION:
    return cohort.geneExpressionPathwayActivity
  case VIEW_ENUM.REGULON:
    return cohort.regulonPathwayActivity ? cohort.regulonPathwayActivity : undefined
  default:
    // eslint-disable-next-line no-console
    console.error('can not get host data for ',cohort,view)
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
    '   :mean (map car (mean data 1))}))'
  const quote = x => '"' + x + '"'
  const { dataset, host} = getHostGeneSetData(cohort,view)
  const query = `(${allFieldMeanQuery} ${quote(dataset)}  [${samples.map(quote).join(' ')}])`
  return Rx.Observable.ajax(xenaPost(host, query)).map(xhr => JSON.parse(xhr.response))
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
      dataHandler(output)
    })

}

export function lookupGeneByName(geneQuery,callback){
  let subscriber = sparseDataMatchPartialField(REFERENCE.host, 'name2', REFERENCE.name, geneQuery, REFERENCE.limit)
  subscriber.subscribe(matches => {
    callback(matches)
  })
}

export function getCohortDataForGeneExpressionView(selectedCohorts, view){
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
    ]
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
    ]
  default:
    return null
  }

}

export function fetchBestPathways(selectedCohorts,view,dataHandler){


  const cohortData = getCohortDataForGeneExpressionView(selectedCohorts,view)
  Rx.Observable.zip(
    datasetSamples(cohortData[0].host, cohortData[0].dataset, null),
    datasetSamples(cohortData[1].host, cohortData[1].dataset, null),
  )
    .flatMap((unfilteredSamples) => {

      const availableSamples = [
        calculateSelectedSubCohortSamples(unfilteredSamples[0],selectedCohorts[0]),
        calculateSelectedSubCohortSamples(unfilteredSamples[1],selectedCohorts[1]),
      ]

      return Rx.Observable.zip(
        allFieldMean(selectedCohorts[0], availableSamples[0],view),
        allFieldMean(selectedCohorts[1], availableSamples[1],view),
        (
          geneExpressionPathwayActivityA, geneExpressionPathwayActivityB
        ) => ({
          geneExpressionPathwayActivityA,
          geneExpressionPathwayActivityB,
        }),
      )
    })
    .subscribe( (output ) => {
      // get the average activity for each
      dataHandler(output)
    })
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
      dataHandler(output)
    })
}

export function fetchSampleData(selectedCohorts,view, handleSampleDataCounts){
  return Rx.Observable.zip(
    getSamplesForCohortAndView(selectedCohorts[0],view),
    getSamplesForCohortAndView(selectedCohorts[1],view),
    ( cohortASamples,cohortBSamples ) => ( {
      cohortACounts: createFilterCountForView(cohortASamples, selectedCohorts[0], view),
      cohortBCounts: createFilterCountForView(cohortBSamples, selectedCohorts[1], view),
    })
  )
    .subscribe( (output) => {
      // console.log('cohorts',JSON.stringify(cohortACounts),JSON.stringify(cohortBCounts),view);
      handleSampleDataCounts(output.cohortACounts[view],output.cohortBCounts[view])
    })
}

// TODO: move into a service as an async method
export function fetchCombinedCohorts(selectedCohorts, pathways,view, combinationHandler) {
  const geneList = getGenesForPathways(pathways)
  console.log('input pathways',pathways)
  console.log('genes for pathways',geneList)
  let filterCounts

  function fetchDataForRegulon(selectedCohorts, samplesA,samplesB, geneList, geneSetLabels) {
    return Rx.Observable.zip(
      datasetFetch(selectedCohorts[0].geneExpression.host, selectedCohorts[0].geneExpression.dataset, samplesA, geneList),
      datasetProbeValues(selectedCohorts[0].regulonPathwayActivity.host, selectedCohorts[0].regulonPathwayActivity.dataset, samplesA, geneSetLabels),
      datasetFetch(selectedCohorts[1].geneExpression.host, selectedCohorts[1].geneExpression.dataset, samplesB, geneList),
      datasetProbeValues(selectedCohorts[1].regulonPathwayActivity.host, selectedCohorts[1].regulonPathwayActivity.dataset, samplesB, geneSetLabels),
      (
        geneExpressionA, geneExpressionPathwayActivityA,
        geneExpressionB, geneExpressionPathwayActivityB,
      ) => ({
        samplesA,
        geneExpressionA,
        geneExpressionPathwayActivityA:geneExpressionPathwayActivityA[1],
        samplesB,
        geneExpressionB,
        geneExpressionPathwayActivityB:geneExpressionPathwayActivityB[1],
      }),
    )

  }

  function fetchDataForParadigm(selectedCohorts, samplesA,samplesB, geneList, geneSetLabels) {
    return Rx.Observable.zip(
      datasetProbeValues(selectedCohorts[0].paradigm.host, selectedCohorts[0].paradigm.dataset, samplesA, geneList),
      datasetProbeValues(selectedCohorts[0].paradigmPathwayActivity.host, selectedCohorts[0].paradigmPathwayActivity.dataset, samplesA, geneSetLabels),
      datasetProbeValues(selectedCohorts[1].paradigm.host, selectedCohorts[1].paradigm.dataset, samplesB, geneList),
      datasetProbeValues(selectedCohorts[1].paradigmPathwayActivity.host, selectedCohorts[1].paradigmPathwayActivity.dataset, samplesB, geneSetLabels),
      (
        geneExpressionA, geneExpressionPathwayActivityA,
        geneExpressionB, geneExpressionPathwayActivityB,
      ) => ({
        samplesA,
        geneExpressionA: geneExpressionA[1],
        geneExpressionPathwayActivityA:geneExpressionPathwayActivityA[1],
        samplesB,
        geneExpressionB: geneExpressionB[1],
        geneExpressionPathwayActivityB:geneExpressionPathwayActivityB[1],
      }),
    )

  }

  function fetchDataForGeneExpression(selectedCohorts, samplesA,samplesB, geneList, geneSetLabels) {
    return Rx.Observable.zip(
      datasetFetch(selectedCohorts[0].geneExpression.host, selectedCohorts[0].geneExpression.dataset, samplesA, geneList),
      datasetProbeValues(selectedCohorts[0].geneExpressionPathwayActivity.host, selectedCohorts[0].geneExpressionPathwayActivity.dataset, samplesA, geneSetLabels),
      datasetFetch(selectedCohorts[1].geneExpression.host, selectedCohorts[1].geneExpression.dataset, samplesB, geneList),
      datasetProbeValues(selectedCohorts[1].geneExpressionPathwayActivity.host, selectedCohorts[1].geneExpressionPathwayActivity.dataset, samplesB, geneSetLabels),
      (
        geneExpressionA, geneExpressionPathwayActivityA,
        geneExpressionB, geneExpressionPathwayActivityB,
      ) => ({
        samplesA,
        geneExpressionA,
        geneExpressionPathwayActivityA:geneExpressionPathwayActivityA[1],
        samplesB,
        geneExpressionB,
        geneExpressionPathwayActivityB:geneExpressionPathwayActivityB[1],
      }),
    )

  }

  function fetchDataForMutation(selectedCohorts, samplesA,samplesB, geneList) {
    return Rx.Observable.zip(
      sparseData(selectedCohorts[0].host, selectedCohorts[0].mutationDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].genomeBackgroundMutation.host, selectedCohorts[0].genomeBackgroundMutation.dataset, samplesA, [selectedCohorts[0].genomeBackgroundMutation.feature_event_K, selectedCohorts[0].genomeBackgroundMutation.feature_total_pop_N]),
      sparseData(selectedCohorts[1].host, selectedCohorts[1].mutationDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].genomeBackgroundMutation.host, selectedCohorts[1].genomeBackgroundMutation.dataset, samplesB, [selectedCohorts[1].genomeBackgroundMutation.feature_event_K, selectedCohorts[1].genomeBackgroundMutation.feature_total_pop_N]),
      (
        mutationA, genomeBackgroundMutationA,
        mutationB, genomeBackgroundMutationB,
      ) => ({
        samplesA,
        geneExpressionA: mutationA,
        geneExpressionPathwayActivityA: genomeBackgroundMutationA,
        samplesB,
        geneExpressionB: mutationB,
        geneExpressionPathwayActivityB: genomeBackgroundMutationB,
      }),
    )

  }

  function fetchDataForCopyNumber(selectedCohorts, samplesA,samplesB, geneList) {
    return Rx.Observable.zip(
      datasetFetch(selectedCohorts[0].host, selectedCohorts[0].copyNumberDataSetId, samplesA, geneList),
      datasetFetch(selectedCohorts[0].genomeBackgroundCopyNumber.host, selectedCohorts[0].genomeBackgroundCopyNumber.dataset, samplesA, [selectedCohorts[0].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[0].genomeBackgroundCopyNumber.feature_total_pop_N]),
      datasetFetch(selectedCohorts[1].host, selectedCohorts[1].copyNumberDataSetId, samplesB, geneList),
      datasetFetch(selectedCohorts[1].genomeBackgroundCopyNumber.host, selectedCohorts[1].genomeBackgroundCopyNumber.dataset, samplesB, [selectedCohorts[1].genomeBackgroundCopyNumber.feature_event_K, selectedCohorts[1].genomeBackgroundCopyNumber.feature_total_pop_N]),
      (
        copyNumberA, genomeBackgroundCopyNumberA,
        copyNumberB, genomeBackgroundCopyNumberB,
      ) => ({
        samplesA,
        geneExpressionA: copyNumberA,
        geneExpressionPathwayActivityA: genomeBackgroundCopyNumberA,
        samplesB,
        geneExpressionB: copyNumberB,
        geneExpressionPathwayActivityB: genomeBackgroundCopyNumberB,
      }),
    )

  }

  function fetchDataForCnvMutation(selectedCohorts, samplesA,samplesB, geneList) {
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
        // TODO: we actually get two sets of data here
        mutationA,copyNumberA,  genomeBackgroundMutationA, genomeBackgroundCopyNumberA ,
        mutationB,copyNumberB,  genomeBackgroundMutationB, genomeBackgroundCopyNumberB ,
      ) => ({
        samplesA,
        geneExpressionA: [mutationA,copyNumberA],
        geneExpressionPathwayActivityA: [genomeBackgroundMutationA,genomeBackgroundCopyNumberA],
        samplesB,
        geneExpressionB: [mutationB,copyNumberB],
        geneExpressionPathwayActivityB: [genomeBackgroundMutationB,genomeBackgroundCopyNumberB],
      }),
    )

  }

  Rx.Observable.zip(
    getSamplesForCohortAndView(selectedCohorts[0],view),
    getSamplesForCohortAndView(selectedCohorts[1],view),
  ).flatMap( (unfilteredSamples) => {
    console.log('unfiltered samples',unfilteredSamples)
    filterCounts = [
      createFilterCountForView(unfilteredSamples[0], selectedCohorts[0], view),
      createFilterCountForView(unfilteredSamples[1], selectedCohorts[1], view),
    ]

    const samplesA = calculateSelectedSubCohortSamples(unfilteredSamples[0], selectedCohorts[0])
    const samplesB = calculateSelectedSubCohortSamples(unfilteredSamples[1], selectedCohorts[1])
    const geneSetLabels = convertPathwaysToGeneSetLabel(pathways)

    switch (view) {
    case VIEW_ENUM.GENE_EXPRESSION:
      return fetchDataForGeneExpression(selectedCohorts,samplesA,samplesB,geneList,geneSetLabels)
    case VIEW_ENUM.PARADIGM:
      return fetchDataForParadigm(selectedCohorts,samplesA,samplesB,geneList,geneSetLabels)
    case VIEW_ENUM.REGULON:
      return fetchDataForRegulon(selectedCohorts,samplesA,samplesB,geneList,geneSetLabels)
    case VIEW_ENUM.COPY_NUMBER:
      return fetchDataForCopyNumber(selectedCohorts,samplesA,samplesB,geneList,geneSetLabels)
    case VIEW_ENUM.MUTATION:
      return fetchDataForMutation(selectedCohorts,samplesA,samplesB,geneList,geneSetLabels)
      /// TODO: how? , just subscribe to more?
    case VIEW_ENUM.CNV_MUTATION:
      return fetchDataForCnvMutation(selectedCohorts,samplesA,samplesB,geneList,geneSetLabels)
    default:
      // eslint-disable-next-line no-console
      console.error('not sure how we here')
    }

    // TODO: minimize fetches based on the filter

  })
    .subscribe(({
      geneExpressionA, geneExpressionPathwayActivityA,
      geneExpressionB, geneExpressionPathwayActivityB,
      samplesA,samplesB,
    }) => {
      // TODO: should we just make everything there in terms of activty versus?
      combinationHandler({
        geneList,
        pathways,
        filterCounts,
        samplesA,
        mutationsA:[],
        copyNumberA:[],
        geneExpressionA,
        geneExpressionPathwayActivityA,
        // paradigmA:[],
        // paradigmPathwayActivityA:[],
        // regulonPathwayActivityA:[],
        genomeBackgroundMutationA:[],
        genomeBackgroundCopyNumberA:[],
        samplesB,
        mutationsB:[],
        copyNumberB:[],
        geneExpressionB,
        geneExpressionPathwayActivityB,
        // paradigmB:[],
        // paradigmPathwayActivityB:[],
        // regulonPathwayActivityB:[],
        genomeBackgroundMutationB:[],
        genomeBackgroundCopyNumberB:[],
        selectedCohorts,
      })
    })
}
