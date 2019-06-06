import subCohorts from '../data/Subtype_Selected';

function getSubCohortsForCohort(cohort){
    return subCohorts[cohort];
}

export function getSubCohortsOnlyForCohort(cohort){
    const subCohorts = getSubCohortsForCohort(cohort);
    return subCohorts ? Object.entries(subCohorts).map( c => c[0]) : [];
}

export function getSamplesFromSubCohortList(cohort, subCohortArray){
    return subCohortArray.flatMap( sc => {
        return getSamplesFromSubCohort(cohort,sc)
    });
}

export function getSamplesFromSubCohort(cohort,subCohort){
    return  subCohorts[cohort][subCohort];
}
