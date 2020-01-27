import {AppStorageHandler} from '../service/AppStorageHandler';
import {getCohortDetails, getSubCohortsOnlyForCohort} from './CohortFunctions';
import {memoize} from 'underscore';

export function calculateFilter(urlVariables){
  // handling filters
  if(urlVariables.filter){
    AppStorageHandler.storeFilterState(urlVariables.filter);
  }
  return AppStorageHandler.getFilterState();
}

export function calculateGeneSet(urlVariables,pathways){
  // handle selected Pathway / GeneSet
  let selectedGeneSet = undefined;
  if(urlVariables.geneset){
    // find a geneset for the name
    const geneset = pathways.find( p => p.golabel === urlVariables.geneset );
    selectedGeneSet = {
      pathway: geneset,
      tissue: 'Header'
    };
    AppStorageHandler.storePathwaySelection(selectedGeneSet);
  }
  return selectedGeneSet;
}

/**
 * For should be:
 * urlVariables = {
 *   subCohort1Samples: ['abc-123','def-567']
 *   subCohort1Name: 'Data from Xena',
 *   },
 *   {
 *    subCohort2Samples: ['abc-789','def-567']
 *    }
 * }
 * @param urlVariables
 * @returns {*[]}
 */
export function calculateSubCohortSamples(urlVariables){


  let addedSubCohorts = [];

  if(urlVariables.subCohort1Samples) {
    const subCohort1Name = urlVariables.subCohort1Name ?urlVariables.subCohort1Name : 'Sub Cohort 1 from URL' ;
    const subCohort1Samples = urlVariables.subCohort1Samples;
    console.log(subCohort1Name,subCohort1Samples);
    // cohort1Details.subCohorts. // add next sub cohorts
    addedSubCohorts[0] = {
      name: subCohort1Name,
      samples: subCohort1Samples,
    };
  }

  if(urlVariables.subCohort2Samples) {
    const subCohort2Name = urlVariables.subCohort2Name ?urlVariables.subCohort2Name : 'Sub Cohort 2 from URL' ;
    const subCohort2Samples = urlVariables.subCohort2Samples;
    console.log(subCohort2Name,subCohort2Samples);
    // cohort2Details.subCohorts. // add next sub cohorts
    // TODO: add to state
    addedSubCohorts[1] = {
      name: subCohort2Name,
      samples: subCohort2Samples,
    };
  }
  console.log('added sub cohorts',addedSubCohorts);

  return addedSubCohorts;

}

export function calculateCohorts(urlVariables){
  // // handle selected cohorts
  if(urlVariables.cohort1){
    let cohort1Details = getCohortDetails({name: urlVariables.cohort1});
    cohort1Details.subCohorts = getSubCohortsOnlyForCohort(urlVariables.cohort1);
    cohort1Details.selectedSubCohorts = urlVariables.selectedSubCohorts1 ? urlVariables.selectedSubCohorts1.split(',') : cohort1Details.subCohorts ;
    AppStorageHandler.storeCohortState(cohort1Details,0);
  }
  if(urlVariables.cohort2){
    const cohort2Details = getCohortDetails({name: urlVariables.cohort2});
    cohort2Details.subCohorts = getSubCohortsOnlyForCohort(urlVariables.cohort2);
    cohort2Details.selectedSubCohorts = urlVariables.selectedSubCohorts2 ? urlVariables.selectedSubCohorts2.split(',') : cohort2Details.subCohorts ;
    AppStorageHandler.storeCohortState(cohort2Details,1);
  }

  // handle selected subCohorts
  return [ AppStorageHandler.getCohortState(0), AppStorageHandler.getCohortState(1)];
}
export const generateUrl = (filter,geneset,cohort1,cohort2,selectedSubCohorts1,selectedSubCohorts2) => {
  let generatedUrl = `cohort1=${cohort1}`;
  generatedUrl += `&cohort2=${cohort2}`;
  generatedUrl += `&filter=${filter}`;
  generatedUrl += `&geneset=${geneset}`;
  if( selectedSubCohorts1){
    generatedUrl += `&selectedSubCohorts1=${selectedSubCohorts1}`;
  }
  if( selectedSubCohorts2){
    generatedUrl += `&selectedSubCohorts2=${selectedSubCohorts2}`;
  }
  return generatedUrl;
};

export const generatedUrlFunction = memoize(generateUrl, (filter,geneset,cohort1,cohort2,selectedSubCohorts1,selectedSubCohorts2) =>
  JSON.stringify([filter,geneset,cohort1,cohort2,selectedSubCohorts1,selectedSubCohorts2]));
