import expect from 'expect'
import {AppStorageHandler} from '../../src/service/AppStorageHandler'

const addedCohort1 = [{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort1','samples':'TCGA-BR-8384-01,TCGA-BR-4371-01'},{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort2','samples':'TCGA-D7-6822-01,TCGA-BR-8485-01'}]
const addedCohort2 = [{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort2','samples':'TCGA-D7-6822-01,TCGA-BR-8485-01,TCGA-BR-4371-01'}]

const updatedCohort2ForCohort1  = [{'cohort':'TCGA Stomach Cancer (STAD)','subCohortName':'From_Xena_Cohort2','samples':'TCGA-D7-6822-01,TCGA-BR-8485-01,TCGA-BR-4371-01'}]

const COHORT_1 = 'TCGA Stomach Cancer (STAD)'
const COHORT_2 = 'some other cohort'

describe('App Storage Handler', () => {

  beforeEach(function(done) {
    sessionStorage.clear()
    window.setTimeout(function() {
      done()
    }, 0)
  })

  it('Adding a stored returns a stored', () => {
    expect(null).toEqual(AppStorageHandler.getSubCohorts())
    expect([]).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1))

    // store one and confirm that it works
    expect(addedCohort1).toEqual(AppStorageHandler.storeSubCohorts(addedCohort1))
    expect(addedCohort1).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1))

    // should overwrite
    AppStorageHandler.storeSubCohorts(addedCohort2)
    expect(updatedCohort2ForCohort1).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1))

    // retrieving a null one
    expect([]).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_2))

  })

  it('Adding a custom gene sets stored', () => {
    expect(true).toBe(AppStorageHandler.checkGeneSets())
    expect(null).toNotBe(AppStorageHandler.getCustomInternalGeneSets())
  //   // expect({}).toEqual(AppStorageHandler.getCustomInternalGeneSets(VIEW_ENUM.GENE_EXPRESSION))
  //
  //   // // store one and confirm that it works
  //   // expect(addedCohort1).toEqual(AppStorageHandler.storeSubCohorts(addedCohort1))
  //   // expect(addedCohort1).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1))
  //   //
  //   // // should overwrite
  //   // AppStorageHandler.storeSubCohorts(addedCohort2)
  //   // expect(updatedCohort2ForCohort1).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_1))
  //   //
  //   // // retrieving a null one
  //   // expect([]).toEqual(AppStorageHandler.getSubCohortsForCohort(COHORT_2))
  //
  })

})

