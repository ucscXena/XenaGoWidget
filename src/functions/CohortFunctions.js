import { uniq, pluck, flatten } from 'underscore';

import subCohorts from '../data/Subtype_Selected';
import DefaultDatasetForGeneset from '../data/defaultDatasetForGeneset';

const MUTATION_KEY = 'simple somatic mutation';
const COPY_NUMBER_VIEW_KEY = 'copy number for pathway view';
const GENOME_BACKGROUND_VIEW_KEY = 'genome background';
const GENOME_BACKGROUND_COPY_NUMBER_VIEW_KEY = 'copy number';
const GENOME_BACKGROUND_MUTATION_VIEW_KEY = 'mutation';

function lowerCaseCompareName(a, b) {
  try {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  } catch (e) {
    console.error('error evaluating name', a, b);
    return null;
  }
}

function getSubCohortsForCohort(cohort) {
  return subCohorts[cohort];
}

export function getSubCohortsOnlyForCohort(cohort) {
  const subCohorts = getSubCohortsForCohort(cohort);
  return subCohorts ? Object.entries(subCohorts).map((c) => c[0]) : [];
}

// TODO: remove . . always returns null?
export function getGenesForPathways(pathways) {
  return Array.from(new Set(flatten(pluck(pathways, 'gene'))));
}

export function getGenesForNamedPathways(selectedPathways, pathways) {
  const filteredPathways = pathways.filter((f) => selectedPathways.indexOf(f.golabel) >= 0);
  return Array.from(new Set(flatten(pluck(filteredPathways, 'gene'))));
}

export function getSamplesFromSelectedSubCohorts(selectedCohort) {
  if (selectedCohort.selectedSubCohorts) {
    return uniq(selectedCohort.selectedSubCohorts.flatMap((sc) => getSamplesFromSubCohort(selectedCohort.name, sc)));
  }
  return null;
}

export function getSamplesFromSubCohortList(cohort, subCohortArray) {
  return uniq(subCohortArray.flatMap((sc) => getSamplesFromSubCohort(cohort, sc)));
}

export function getSamplesFromSubCohort(cohort, subCohort) {
  return uniq(subCohorts[cohort][subCohort]);
}

export function getCohortDetails(selected) {
  return fetchCohortData().find((c) => c.name === selected.name);
}

let COHORT_DATA = undefined;

export function fetchCohortData() {
  if(COHORT_DATA===undefined) {
    COHORT_DATA = Object.keys(DefaultDatasetForGeneset)
      .filter((cohort) => {
        console.log('cohort', JSON.stringify(cohort));
        // console.log('cohort entry',JSON.stringify(DefaultDatasetForGeneset[cohort]))
        return (DefaultDatasetForGeneset[cohort].viewInPathway) && DefaultDatasetForGeneset[cohort][MUTATION_KEY];
      })
      .map((cohort) => {
        console.log('mapping cohort', JSON.stringify(cohort));
        const mutation = DefaultDatasetForGeneset[cohort][MUTATION_KEY];
        // console.log('mutation',JSON.stringify(mutation))
        const copyNumberView = DefaultDatasetForGeneset[cohort][COPY_NUMBER_VIEW_KEY];
        // console.log('CNV',JSON.stringify(copyNumberView))
        const genomeBackground = DefaultDatasetForGeneset[cohort][GENOME_BACKGROUND_VIEW_KEY];
        // console.log('genome backgorund',JSON.stringify(genomeBackground))
        return {
          name: cohort,
          mutationDataSetId: mutation.dataset,
          copyNumberDataSetId: copyNumberView.dataset,
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
