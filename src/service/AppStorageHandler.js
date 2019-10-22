import update from 'immutability-helper';
import PureComponent from '../components/PureComponent';
import DefaultPathWays from '../data/genesets/tgac';
import { SortType } from '../functions/SortFunctions';
import {fetchCohortData, getSubCohortsOnlyForCohort} from '../functions/CohortFunctions';
import {FILTER_ENUM} from '../components/FilterSelector';
import {exception} from 'react-ga';


// synchronizing gene sorts between pathways
const LOCAL_APP_STORAGE = 'xena-app-storage';
const LOCAL_STATE_STORAGE = 'xena-selection-storage';
const LOCAL_PATHWAY_STORAGE = 'default-xena-pathways';

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
};

const DefaultAppB = update(DefaultAppA, {
  selectedCohort: { $set: 'TCGA Lung Adenocarcinoma (LUAD)' },
  pathwayData: { cohort: { $set: 'TCGA Lung Adenocarcinoma (LUAD)' } },
});


/**
 * This is just for handling memory.
 */
export class AppStorageHandler extends PureComponent {
  static storePathways(pathways) {
    if (pathways) {
      sessionStorage.setItem(LOCAL_PATHWAY_STORAGE, JSON.stringify(pathways));
    }
  }

  static getPathways() {
    const storedPathway = JSON.parse(sessionStorage.getItem(LOCAL_PATHWAY_STORAGE));
    return storedPathway || DefaultPathWays;
  }

  static getDefaultSelectionPathway() {
    return { selection: { pathway: DefaultPathWays[21], tissue: 'Header' } };
  }

  static getAppState() {
    const storedPathwaySelection = JSON.parse(sessionStorage.getItem(LOCAL_STATE_STORAGE));
    return storedPathwaySelection || AppStorageHandler.getDefaultSelectionPathway();
  }

  static getPathwaySelection() {
    return AppStorageHandler.getAppState().selection;
  }

  static storeAppState(selection) {
    if (selection) {
      sessionStorage.setItem(LOCAL_STATE_STORAGE, JSON.stringify(selection));
    } else {
      // eslint-disable-next-line no-console
      console.warn('storing empty pathway');
    }
  }

  static storePathwaySelection(pathway) {
    const appState = AppStorageHandler.getAppState();
    appState.selection = pathway;
    AppStorageHandler.storeAppState(appState);
  }

  static generateCohortState(name) {
    const returnValue = fetchCohortData().find((c) => c.name === name);

    const subCohorts = getSubCohortsOnlyForCohort(name);
    if (subCohorts) {
      returnValue.subCohorts = subCohorts;
      returnValue.selectedSubCohorts = subCohorts;
    }
    return returnValue;
  }

  static getCohortState(cohortIndex) {
    const appState = AppStorageHandler.getAppState();
    if (appState && appState.cohortState && appState.cohortState[cohortIndex] && AppStorageHandler.isValidCohortState(appState.cohortState[cohortIndex])) {
      return appState.cohortState[cohortIndex];
    }

    const defaultCohortState = cohortIndex === 0 ? this.generateCohortState('TCGA Ovarian Cancer (OV)') : this.generateCohortState('TCGA Prostate Cancer (PRAD)');
    AppStorageHandler.storeCohortState(defaultCohortState,cohortIndex);

    return defaultCohortState;
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
    ;
  }

  static isValidFilterState(filterState) {
    switch (filterState) {
    case FILTER_ENUM.COPY_NUMBER:
    case FILTER_ENUM.MUTATION:
    case FILTER_ENUM.CNV_MUTATION:
    case FILTER_ENUM.GENE_EXPRESSION:
      return true;
    }
    return false ;
  }

  static storeFilterState(selected, cohortIndex) {
    if (!selected) return;
    const appState = AppStorageHandler.getAppState();
    if (!appState.filterState) {
      appState.filterState = [];
    }
    // TODO: remove this hack
    appState.filterState[cohortIndex] = selected;
    AppStorageHandler.storeAppState(appState);
  }

  static storeFilterStateArray(array){
    if(array.length!==2) {
      throw new exception('Must be an array of size two');
    }
    this.storeFilterState(array[0],0);
    this.storeFilterState(array[1],1);
  }

  static getFilterState(cohortIndex) {
    const appState = AppStorageHandler.getAppState();
    if (appState && appState.filterState && appState.filterState[cohortIndex] && this.isValidFilterState(appState.filterState[cohortIndex])) {
      return appState.filterState[cohortIndex];
    }
    return FILTER_ENUM.GENE_EXPRESSION;
  }

  static getSortState() {
    const appState = AppStorageHandler.getAppState();
    // diff or cluster
    if (!appState.sortState) {
      appState.sortState = SortType.DIFF;
      AppStorageHandler.storeAppState(appState);
    }
    // TODO: remove this hack
    return appState.sortState;
  }

  static storeSortState(sortState) {
    const appState = AppStorageHandler.getAppState();
    appState.sortState = sortState;
    AppStorageHandler.storeAppState(appState);
  }

  static storeCohortStateArray(array){
    if(array.length!==2) {
      throw new exception('Must be an array of size two');
    }
    this.storeCohortState(array[0],0);
    this.storeCohortState(array[1],1);
  }

  static storeCohortState(selected, cohortIndex) {
    // console.log('storing cohort state',selected,cohortIndex)
    if (!selected) return;
    const appState = AppStorageHandler.getAppState();
    // console.log('RETR storing cohort state',appState)
    if (!appState.cohortState) {
      appState.cohortState = [];
    }
    appState.cohortState[cohortIndex] = selected;
    AppStorageHandler.storeAppState(appState);
  }

  static storeAppData(pathway) {
    if (pathway) {
      sessionStorage.setItem(LOCAL_APP_STORAGE, JSON.stringify(pathway));
    }
  }


  static getAppData(pathways) {
    const storedPathway = JSON.parse(sessionStorage.getItem(LOCAL_APP_STORAGE));
    if (storedPathway) {
      return storedPathway;
    }

    // DefaultApp.renderHeight = renderHeight ;
    DefaultAppA.pathwayData.pathways = pathways;
    DefaultAppB.pathwayData.pathways = pathways;
    const app1 = { ...DefaultAppA };
    app1.key = 0;
    const app2 = { ...DefaultAppB };
    app2.key = 1;
    return [app1, app2];
  }
}
