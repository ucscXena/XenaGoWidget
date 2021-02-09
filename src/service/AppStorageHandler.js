import update from 'immutability-helper'
import DefaultPathWays from '../data/genesets/tgac'
import {fetchCohortData, getSubCohortsOnlyForCohort} from '../functions/CohortFunctions'
import {VIEW_ENUM} from '../data/ViewEnum'
import {exception} from 'react-ga'


// synchronizing gene sorts between pathways
const LOCAL_APP_STORAGE = 'xena-app-storage'
const LOCAL_STATE_STORAGE = 'xena-selection-storage'
// const LOCAL_CUSTOM_PATHWAYS_STORAGE = 'xena-custom-pathways-storage'
// const LOCAL_PATHWAY_STORAGE = 'default-xena-pathways'
const LOCAL_SUBCOHORT_STORAGE = 'default-subcohort-storage'
const LOCAL_GENESETS_STORAGE = 'default-genesets-storage'

const DefaultAppA = {
  renderOffset: 5,
  pathwayData: {
    cohort: 'TCGA Breast Cancer (BRCA)',
    copyNumber: [],
    expression: [],
    samples: [],
  },
  loadState: 'loading',
  selectedCohort: 'TCGA Breast Cancer (BRCA)',
  cohortData: {},
  minFilter: 2,
  filterPercentage: 0.005,
  geneData: {
    copyNumber: [],
    expression: [],
    pathways: [],
    samples: [],
  },
  pathwayHoverData: {
    tissue: null,
    pathway: null,
    score: null,
  },
  pathwayClickData: {
    tissue: null,
    pathway: null,
    score: null,
  },
  geneHoverData: {
    tissue: null,
    gene: null,
    score: null,
  },
  geneClickData: {
    tissue: null,
    pathway: null,
    score: null,
  },
}

const DefaultAppB = update(DefaultAppA, {
  selectedCohort: { $set: 'TCGA Lung Adenocarcinoma (LUAD)' },
  pathwayData: { cohort: { $set: 'TCGA Lung Adenocarcinoma (LUAD)' } },
})


/**
 * This is just for handling memory.
 */
export class AppStorageHandler {


  static resetSessionStorage() {
    sessionStorage.removeItem(LOCAL_APP_STORAGE)
    // sessionStorage.removeItem(LOCAL_PATHWAY_STORAGE)
    sessionStorage.removeItem(LOCAL_STATE_STORAGE)
    sessionStorage.removeItem(LOCAL_SUBCOHORT_STORAGE)
    // sessionStorage.removeItem(LOCAL_CUSTOM_PATHWAYS_STORAGE)
    sessionStorage.removeItem(LOCAL_GENESETS_STORAGE)
  }

  static storeGeneSets(geneSets) {
    if (geneSets) {
      sessionStorage.setItem(LOCAL_GENESETS_STORAGE, JSON.stringify(geneSets))
      return true
    }
    return false
  }

  static storeGeneSetsForView(newGeneSets,view) {
    let geneSets = AppStorageHandler.getCustomInternalGeneSets()
    if (geneSets) {
      geneSets[view] = newGeneSets
      sessionStorage.setItem(LOCAL_GENESETS_STORAGE, JSON.stringify(geneSets))
      return true
    }
    return false
  }

  static checkGeneSets() {
    try {
      const results = JSON.parse(sessionStorage.getItem(LOCAL_GENESETS_STORAGE))
      if( results[VIEW_ENUM.GENE_EXPRESSION]){
        return true
      }
      else{
        return AppStorageHandler.createGeneSets()
      }
    } catch (e) {
      return AppStorageHandler.createGeneSets()
    }
  }

  static createGeneSets() {
    // Object.values(VIEW_ENUM).map(v => defaultCustomGeneSet[v] = {})
    let geneSetObject = {}
    Object.values(VIEW_ENUM).forEach( (v) => {
      geneSetObject[v] = {}
    })
    console.log('gene sets',geneSetObject)
    return this.storeGeneSets(geneSetObject)
  }

  static getCustomInternalGeneSets() {
    this.checkGeneSets()
    return JSON.parse(sessionStorage.getItem(LOCAL_GENESETS_STORAGE))
  }

  // static storePathways(pathways) {
  //   if (pathways) {
  //     sessionStorage.setItem(LOCAL_PATHWAY_STORAGE, JSON.stringify(pathways))
  //   }
  // }

  // static getCustomPathways() {
  //   const storage = sessionStorage.getItem(LOCAL_CUSTOM_PATHWAYS_STORAGE)
  //   let DEFAULT_PATHWAYS = {}
  //   Object.values(VIEW_ENUM).forEach( v => DEFAULT_PATHWAYS[v] = {} )
  //   return storage ? JSON.parse(storage) : DEFAULT_PATHWAYS
  // }
  //
  // static storeCustomPathways(pathways) {
  //   sessionStorage.setItem(LOCAL_CUSTOM_PATHWAYS_STORAGE,JSON.stringify(pathways))
  // }

  /**
   * For some reason not working locally
   * @returns {({goid: string, gene: string[], golabel: string}|{goid: string, gene: string[], golabel: string}|{goid: string, gene: string[], golabel: string}|{goid: string, gene: string[], golabel: string}|{goid: string, gene: [string, string, string], golabel: string})[]}
   */
  static getDefaultPathways() {
    // const storedPathway = JSON.parse(sessionStorage.getItem(LOCAL_PATHWAY_STORAGE))
    // return storedPathway || DefaultPathWays
    return DefaultPathWays
  }

  static getDefaultSelectionPathway() {
    return { selection: { pathway: DefaultPathWays[21], tissue: 'Header' } }
  }

  static getAppState() {
    const storedPathwaySelection = JSON.parse(sessionStorage.getItem(LOCAL_STATE_STORAGE))
    return storedPathwaySelection || AppStorageHandler.getDefaultSelectionPathway()
  }

  static getPathwaySelection() {
    return AppStorageHandler.getAppState().selection
  }

  static storeAppState(selection) {
    if (selection) {
      sessionStorage.setItem(LOCAL_STATE_STORAGE, JSON.stringify(selection))
    } else {
      // eslint-disable-next-line no-console
      console.warn('storing empty pathway')
    }
  }

  static storePathwaySelection(pathway) {
    const appState = AppStorageHandler.getAppState()
    appState.selection = pathway
    AppStorageHandler.storeAppState(appState)
  }


  static storeSubCohorts(addedSubCohorts){
    // TODO: add
    sessionStorage.setItem(LOCAL_SUBCOHORT_STORAGE,JSON.stringify(addedSubCohorts))
    return this.getSubCohorts()
  }

  static getSubCohorts(){
    return JSON.parse(sessionStorage.getItem(LOCAL_SUBCOHORT_STORAGE))
  }

  static clearSubCohorts(){
    sessionStorage.removeItem(LOCAL_SUBCOHORT_STORAGE)
  }

  static getSubCohortsForCohort(cohort){
    // return  addedSubCohorts.filter( sc => sc.cohort === cohort);
    const subCohorts = this.getSubCohorts()
    if( subCohorts && subCohorts.length>0){
      return subCohorts.filter( sc => sc.cohort === cohort)
    }
    else{
      return []
    }
  }

  static generateCohortState(name) {
    const returnValue = fetchCohortData().find((c) => c.name === name)

    const subCohorts = getSubCohortsOnlyForCohort(name)
    if (subCohorts) {
      returnValue.subCohorts = subCohorts
      returnValue.selectedSubCohorts = subCohorts
    }
    return returnValue
  }

  static getCohortState(cohortIndex) {
    const appState = AppStorageHandler.getAppState()
    if (appState && appState.cohortState && appState.cohortState[cohortIndex] && AppStorageHandler.isValidCohortState(appState.cohortState[cohortIndex])) {
      return appState.cohortState[cohortIndex]
    }

    const defaultCohortState = cohortIndex === 0 ? this.generateCohortState('TCGA Ovarian Cancer (OV)') : this.generateCohortState('TCGA Prostate Cancer (PRAD)')
    AppStorageHandler.storeCohortState(defaultCohortState,cohortIndex)

    return defaultCohortState
  }

  static isValidCohortState(cohortState) {
    return cohortState
      && cohortState.host
      && cohortState.mutationDataSetId
      && cohortState.copyNumberDataSetId
      && cohortState.genomeBackgroundMutation
      && cohortState.genomeBackgroundCopyNumber
      && cohortState.geneExpression
      && cohortState.geneExpressionPathwayActivity

  }

  static isValidFilterState(filterState) {
    switch (filterState) {
    case VIEW_ENUM.COPY_NUMBER:
    case VIEW_ENUM.MUTATION:
    case VIEW_ENUM.CNV_MUTATION:
    case VIEW_ENUM.GENE_EXPRESSION:
    case VIEW_ENUM.REGULON:
      return true
    }
    return false
  }

  static storeFilterState(selected) {
    if (!selected) return
    const appState = AppStorageHandler.getAppState()
    if (!appState.filterState) {
      appState.filterState = undefined
    }
    // TODO: remove this hack
    appState.filterState = selected
    AppStorageHandler.storeAppState(appState)
  }

  static getFilterState() {
    const appState = AppStorageHandler.getAppState()
    if (appState && appState.filterState  && this.isValidFilterState(appState.filterState)) {
      return appState.filterState
    }
    return VIEW_ENUM.GENE_EXPRESSION
  }

  static storeSortState(sortState) {
    const appState = AppStorageHandler.getAppState()
    appState.sortState = sortState
    AppStorageHandler.storeAppState(appState)
  }

  static storeCohortStateArray(array){
    if(array.length!==2) {
      throw new exception('Must be an array of size two')
    }
    this.storeCohortState(array[0],0)
    this.storeCohortState(array[1],1)
  }

  static storeCohortState(selected, cohortIndex) {
    // console.log('storing cohort state',selected,cohortIndex)
    if (!selected) return
    const appState = AppStorageHandler.getAppState()
    // console.log('RETR storing cohort state',appState)
    if (!appState.cohortState) {
      appState.cohortState = []
    }
    appState.cohortState[cohortIndex] = selected
    AppStorageHandler.storeAppState(appState)
  }

  static storeAppData(pathway) {
    if (pathway) {
      sessionStorage.setItem(LOCAL_APP_STORAGE, JSON.stringify(pathway))
    }
  }


  static getAppData(pathways) {
    const storedPathway = JSON.parse(sessionStorage.getItem(LOCAL_APP_STORAGE))
    if (storedPathway) {
      return storedPathway
    }

    // DefaultApp.renderHeight = renderHeight ;
    DefaultAppA.pathwayData.pathways = pathways
    DefaultAppB.pathwayData.pathways = pathways
    const app1 = { ...DefaultAppA }
    app1.key = 0
    const app2 = { ...DefaultAppB }
    app2.key = 1
    return [app1, app2]
  }
}
