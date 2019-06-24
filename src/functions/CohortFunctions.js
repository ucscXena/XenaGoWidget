import subCohorts from '../data/Subtype_Selected';
import {uniq} from 'underscore';

function getSubCohortsForCohort(cohort){
    return subCohorts[cohort];
}

export function getSubCohortsOnlyForCohort(cohort){
    const subCohorts = getSubCohortsForCohort(cohort);
    return subCohorts ? Object.entries(subCohorts).map( c => c[0]) : [];
}

export function getSamplesFromSubCohortList(cohort, subCohortArray){
    return uniq(subCohortArray.flatMap( sc => {
        return getSamplesFromSubCohort(cohort,sc)
    }));
}

export function getSamplesFromSubCohort(cohort,subCohort){
    return  uniq(subCohorts[cohort][subCohort]);
}
