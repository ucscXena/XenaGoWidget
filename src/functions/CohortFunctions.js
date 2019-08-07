import subCohorts from '../data/Subtype_Selected';
import {uniq} from 'underscore';
import DefaultDatasetForGeneset from "../data/defaultDatasetForGeneset";

const MUTATION_KEY = 'simple somatic mutation';
const COPY_NUMBER_VIEW_KEY = 'copy number for pathway view';
const GENOME_BACKGROUND_VIEW_KEY = 'genome background';
const GENOME_BACKGROUND_COPY_NUMBER_VIEW_KEY = 'copy number';
const GENOME_BACKGROUND_MUTATION_VIEW_KEY = 'mutation';
import {pluck, flatten} from 'underscore';
import {COHORT_DATA} from "../components/XenaGeneSetApp";

function lowerCaseCompareName(a, b) {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

function getSubCohortsForCohort(cohort){
    return subCohorts[cohort];
}

export function getSubCohortsOnlyForCohort(cohort){
    const subCohorts = getSubCohortsForCohort(cohort);
    return subCohorts ? Object.entries(subCohorts).map( c => c[0]) : [];
}

// TODO: remove . . always returns null?
export function getGenesForPathways(pathways) {
    return Array.from(new Set(flatten(pluck(pathways, 'gene'))));
}

export function getGenesForNamedPathways(selectedPathways, pathways) {
    let filteredPathways = pathways.filter(f => selectedPathways.indexOf(f.golabel) >= 0)
    return Array.from(new Set(flatten(pluck(filteredPathways, 'gene'))));
}

export function getSamplesFromSubCohortList(cohort, subCohortArray){
    return uniq(subCohortArray.flatMap( sc => {
        return getSamplesFromSubCohort(cohort,sc)
    }));
}

export function getSamplesFromSubCohort(cohort,subCohort){
    return  uniq(subCohorts[cohort][subCohort]);
}

export function getCohortDetails(selected,cohortData){
    if (Object.keys(cohortData).length === 0 && cohortData.constructor === Object) return null ;
    return cohortData.find(c => c.name === selected);
}

export function fetchCohortData(){
    return Object.keys(DefaultDatasetForGeneset)
        .filter(cohort => {
            return (DefaultDatasetForGeneset[cohort].viewInPathway) && DefaultDatasetForGeneset[cohort][MUTATION_KEY]
        })
        .map(cohort => {
            let mutation = DefaultDatasetForGeneset[cohort][MUTATION_KEY];
            let copyNumberView = DefaultDatasetForGeneset[cohort][COPY_NUMBER_VIEW_KEY];
            let genomeBackground = DefaultDatasetForGeneset[cohort][GENOME_BACKGROUND_VIEW_KEY];
            return {
                name: cohort,
                mutationDataSetId: mutation.dataset,
                copyNumberDataSetId: copyNumberView.dataset,
                genomeBackgroundCopyNumber: genomeBackground[GENOME_BACKGROUND_COPY_NUMBER_VIEW_KEY],
                genomeBackgroundMutation: genomeBackground[GENOME_BACKGROUND_MUTATION_VIEW_KEY],
                amplificationThreshold: copyNumberView.amplificationThreshold,
                deletionThreshold: copyNumberView.deletionThreshold,
                host: mutation.host
            }
        })
        .sort(lowerCaseCompareName);

}

export function getSelectedCohort(pathwayData){
    COHORT_DATA.find(c => c.name === pathwayData.cohort);
}
