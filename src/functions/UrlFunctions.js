import {AppStorageHandler} from '../service/AppStorageHandler';
import {getCohortDetails, getSubCohortsOnlyForCohort} from './CohortFunctions';
import {memoize} from 'underscore';

export function calculateViews(urlVariables){
  // handling filters
  if(urlVariables.view1){
    AppStorageHandler.storeViewState(urlVariables.view1,0);
  }
  if(urlVariables.view2){
    AppStorageHandler.storeViewState(urlVariables.view2,1);
  }
  return [ AppStorageHandler.getViewState(0), AppStorageHandler.getViewState(1)];
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
export const generateUrl = (filter1,filter2,geneset,cohort1,cohort2,selectedSubCohorts1,selectedSubCohorts2) => {
  let generatedUrl = `cohort1=${cohort1}`;
  generatedUrl += `&cohort2=${cohort2}`;
  generatedUrl += `&filter1=${filter1}`;
  generatedUrl += `&filter2=${filter2}`;
  generatedUrl += `&geneset=${geneset}`;
  if( selectedSubCohorts1){
    generatedUrl += `&selectedSubCohorts1=${selectedSubCohorts1}`;
  }
  if( selectedSubCohorts2){
    generatedUrl += `&selectedSubCohorts2=${selectedSubCohorts2}`;
  }
  return generatedUrl;
};

export const generatedUrlFunction = memoize(generateUrl, (filter1,filter2,geneset,cohort1,cohort2,selectedSubCohorts1,selectedSubCohorts2) => JSON.stringify([filter1,filter2,geneset,cohort1,cohort2,selectedSubCohorts1,selectedSubCohorts2]));
