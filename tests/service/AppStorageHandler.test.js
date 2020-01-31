import expect from 'expect';
import {AppStorageHandler} from '../../src/service/AppStorageHandler';

const addedCohort1 = [{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort1','samples':'TCGA-BR-8384-01,TCGA-BR-4371-01'},{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort2','samples':'TCGA-D7-6822-01,TCGA-BR-8485-01'}];
const addedCohort2 = [{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort2','samples':'TCGA-D7-6822-01,TCGA-BR-8485-01,TCGA-BR-4371-01'}];

const updatedCohort2 = [{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort1','samples':'TCGA-BR-8384-01,TCGA-BR-4371-01'},{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort2','samples':'TCGA-D7-6822-01,TCGA-BR-8485-01,TCGA-BR-4371-01'}];

const COHORT_1 = 'TCGA Stomach Cancer (STAD)';
const COHORT_2 = 'some other cohort';

describe('App Storage Handler', () => {

  beforeEach(function(done) {
    sessionStorage.clear();
    window.setTimeout(function() {
      done();
    }, 0);
  });

  it('Adding a stored returns a stored', () => {
    console.log('0')
    expect(null).toEqual(AppStorageHandler.getSubCohorts());
    expect([]).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1));

    console.log('1')
    // store one and confirm that it works
    expect(addedCohort1).toEqual(AppStorageHandler.storeSubCohorts(addedCohort1));
    console.log('2')
    expect(addedCohort1).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1));

    // should overwrite
    console.log('A')
    AppStorageHandler.storeSubCohorts(addedCohort2)
    expect(addedCohort1).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1));
    console.log('A.1')
    expect(updatedCohort2).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1));
    console.log('B')

    // retrieving a null one
    expect([]).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_2));
    console.log('C')


  });


});

