import { uniq, pluck, flatten } from 'underscore';

import SUB_COHORT_LIST from '../data/Subtype_Selected';
import DETAIL_DATASET_FOR_GENESET from '../data/defaultDatasetForGeneset';
import {UNASSIGNED_SUBTYPE} from '../components/SubCohortSelector';
import {intersection} from './MathFunctions';
import {VIEW_ENUM} from '../data/ViewEnum';

const MUTATION_KEY = 'simple somatic mutation';
const GENE_EXPRESSION_PATHWAY_ACTIVITY_KEY = 'gene expression pathway activity';
const PARADIGM_KEY = 'PARADIGM';
const PARADIGM_PATHWAY_ACTIVITY_KEY = 'PARADIGM pathway activity';
const REGULON_PATHWAY_ACTIVITY_KEY = 'Regulon activity'; // also a gene expression
const GENE_EXPRESSION_KEY = 'gene expression';
const COPY_NUMBER_VIEW_KEY = 'copy number for pathway view';
const GENOME_BACKGROUND_VIEW_KEY = 'genome background';
const GENOME_BACKGROUND_COPY_NUMBER_VIEW_KEY = 'copy number';
const GENOME_BACKGROUND_MUTATION_VIEW_KEY = 'mutation';

export const LABEL_A = 'A';
export const LABEL_B = 'B';

function lowerCaseCompareName(a, b) {
  try {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('error evaluating name', a, b);
    return null;
  }
}

export function getViewsForCohort(cohortName){
  let views =[];
  const cohortDetail = DETAIL_DATASET_FOR_GENESET[cohortName];
  if(cohortDetail[COPY_NUMBER_VIEW_KEY]) views.push(VIEW_ENUM.COPY_NUMBER);
  if(cohortDetail[MUTATION_KEY] && cohortDetail[COPY_NUMBER_VIEW_KEY]) views.push(VIEW_ENUM.CNV_MUTATION);
  if(cohortDetail[GENE_EXPRESSION_PATHWAY_ACTIVITY_KEY]) views.push(VIEW_ENUM.GENE_EXPRESSION);
  if(cohortDetail[MUTATION_KEY]) views.push(VIEW_ENUM.MUTATION);
  if(cohortDetail[PARADIGM_PATHWAY_ACTIVITY_KEY]) views.push(VIEW_ENUM.PARADIGM);
  if(cohortDetail[REGULON_PATHWAY_ACTIVITY_KEY]) views.push(VIEW_ENUM.REGULON);
  return views ;
}

export function getCohortsForView(view){
  let cohorts = [];
  for(let cohortName of Object.keys(DETAIL_DATASET_FOR_GENESET)){
    const cohortDetail = DETAIL_DATASET_FOR_GENESET[cohortName];
    // console.log('cohort details', cohortDetail,view,cohortName)
    if(view===VIEW_ENUM.COPY_NUMBER && cohortDetail[COPY_NUMBER_VIEW_KEY]) cohorts.push(VIEW_ENUM.COPY_NUMBER);
    if(view===VIEW_ENUM.CNV_MUTATION && cohortDetail[MUTATION_KEY] && cohortDetail[COPY_NUMBER_VIEW_KEY]) cohorts.push(VIEW_ENUM.CNV_MUTATION);
    if(view===VIEW_ENUM.GENE_EXPRESSION && cohortDetail[GENE_EXPRESSION_KEY]) cohorts.push(VIEW_ENUM.GENE_EXPRESSION);
    if(view===VIEW_ENUM.MUTATION && cohortDetail[MUTATION_KEY]) cohorts.push(VIEW_ENUM.MUTATION);
    if(view===VIEW_ENUM.PARADIGM && cohortDetail[PARADIGM_PATHWAY_ACTIVITY_KEY]) cohorts.push(VIEW_ENUM.PARADIGM);
    if(view===VIEW_ENUM.REGULON && cohortDetail[REGULON_PATHWAY_ACTIVITY_KEY]) cohorts.push(VIEW_ENUM.REGULON);
  }
  return cohorts;
}

export function getSubCohortsForCohort(cohort) {
  return {
    ...SUB_COHORT_LIST[cohort]
  };
}

export function getLabelForIndex(index){
  return index=== 0 ? LABEL_A : LABEL_B;
}

export function getSubCohortsOnlyForCohort(cohort) {
  const subCohortsForCohort = getSubCohortsForCohort(cohort);
  return subCohortsForCohort ? [...Object.entries(subCohortsForCohort).map((c) => c[0]),...UNASSIGNED_SUBTYPE.key] : [];
}

// TODO: remove . . always returns null?
export function getGenesForPathways(pathways) {
  return Array.from(new Set(flatten(pluck(pathways, 'gene'))));
}

export function getGenesForNamedPathways(selectedPathways, pathways) {
  const filteredPathways = pathways.filter((f) => selectedPathways.indexOf(f.golabel) >= 0);
  return Array.from(new Set(flatten(pluck(filteredPathways, 'gene'))));
}

export function getAllSubCohortPossibleSamples(cohort){
  return getSamplesFromSubCohortList(cohort,getSubCohortsOnlyForCohort(cohort));
}

function getUnassignedSamplesForCohort(selectedCohort, availableSamples) {
  const overlapping = intersection(availableSamples,getAllSubCohortPossibleSamples(selectedCohort.name));
  return availableSamples.filter( s => !overlapping.includes(s) );
}

export function getSamplesFromSelectedSubCohorts(selectedCohort,availableSamples) {
  if (selectedCohort.selectedSubCohorts) {
    return uniq(selectedCohort.selectedSubCohorts
      .flatMap((sc) => {
        if(sc===UNASSIGNED_SUBTYPE.key){
          return getUnassignedSamplesForCohort(selectedCohort,availableSamples);
        }
        else{
          return getSamplesFromSubCohort(selectedCohort.name, sc);
        }
      }));
  }
  return null;
}

export function getSamplesFromSubCohortList(cohort, subCohortArray) {
  return uniq(subCohortArray.flatMap((sc) => getSamplesFromSubCohort(cohort, sc)));
}

export function getSamplesFromSubCohort(cohort, subCohort) {
  return uniq(SUB_COHORT_LIST[cohort][subCohort]);
}

export function getCohortDetails(selected) {
  return fetchCohortData().find((c) => c.name === selected.name);
}

// TODO: this feels awkward
let COHORT_DATA;

export function fetchCohortData() {
  if (COHORT_DATA === undefined) {
    COHORT_DATA = Object.keys(DETAIL_DATASET_FOR_GENESET)
      .filter((cohort) => (DETAIL_DATASET_FOR_GENESET[cohort].viewInPathway)
          && DETAIL_DATASET_FOR_GENESET[cohort][MUTATION_KEY]
          && DETAIL_DATASET_FOR_GENESET[cohort][GENE_EXPRESSION_KEY]
      )
      .map((cohort) => {
        const mutation = DETAIL_DATASET_FOR_GENESET[cohort][MUTATION_KEY];
        const copyNumberView = DETAIL_DATASET_FOR_GENESET[cohort][COPY_NUMBER_VIEW_KEY];
        const genomeBackground = DETAIL_DATASET_FOR_GENESET[cohort][GENOME_BACKGROUND_VIEW_KEY];
        const geneExpression = DETAIL_DATASET_FOR_GENESET[cohort][GENE_EXPRESSION_KEY];
        const geneExpressionPathwayActivity  = DETAIL_DATASET_FOR_GENESET[cohort][GENE_EXPRESSION_PATHWAY_ACTIVITY_KEY];
        const paradigm = DETAIL_DATASET_FOR_GENESET[cohort][PARADIGM_KEY];
        const paradigmPathwayActivity  = DETAIL_DATASET_FOR_GENESET[cohort][PARADIGM_PATHWAY_ACTIVITY_KEY];
        const regulonPathwayActivity  = DETAIL_DATASET_FOR_GENESET[cohort][REGULON_PATHWAY_ACTIVITY_KEY];
        return {
          name: cohort,
          mutationDataSetId: mutation.dataset,
          copyNumberDataSetId: copyNumberView.dataset,
          geneExpression,
          geneExpressionPathwayActivity,
          paradigm,
          paradigmPathwayActivity,
          regulonPathwayActivity: regulonPathwayActivity ? regulonPathwayActivity : {} ,
          genomeBackgroundCopyNumber: genomeBackground[GENOME_BACKGROUND_COPY_NUMBER_VIEW_KEY],
          genomeBackgroundMutation: genomeBackground[GENOME_BACKGROUND_MUTATION_VIEW_KEY],
          amplificationThreshold: copyNumberView.amplificationThreshold,
          deletionThreshold: copyNumberView.deletionThreshold,
          host: mutation.host,
        };
      })
      .sort(lowerCaseCompareName);
  }
  return COHORT_DATA;
}

