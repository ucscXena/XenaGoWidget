import update from 'immutability-helper';
import PureComponent from '../components/PureComponent';
import DefaultPathWays from '../data/genesets/tgac';
import { SortType } from '../functions/SortFunctions';
import {fetchCohortData, getSubCohortsOnlyForCohort} from '../functions/CohortFunctions';


// synchronizing gene sorts between pathways
const LOCAL_APP_STORAGE = 'xena-app-storage';
const LOCAL_STATE_STORAGE = 'xena-selection-storage';
const LOCAL_PATHWAY_STORAGE = 'default-xena-pathways';

const DefaultAppA = {
  renderOffset: 5,
  pathwayData: {
    cohort: 'TCGA Ovarian Cancer (OV)',
    copyNumber: [],
    expression: [],
    samples: [],
  },
  loadState: 'loading',
  selectedCohort: 'TCGA Ovarian Cancer (OV)',
  cohortData: {},
  tissueExpressionFilter: 'All',
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
  selectedCohort: { $set: 'TCGA Prostate Cancer (PRAD)' },
  pathwayData: { cohort: { $set: 'TCGA Prostate Cancer (PRAD)' } },
});


/**
 * This is just for handling memory.
 */
export class AppStorageHandler extends PureComponent {
  static storePathways(pathway) {
    if (pathway) {
      localStorage.setItem(LOCAL_PATHWAY_STORAGE, JSON.stringify(pathway));
    }
  }

  static getPathways() {
    const storedPathway = JSON.parse(localStorage.getItem(LOCAL_PATHWAY_STORAGE));
    return storedPathway || DefaultPathWays;
  }

  static getDefaultSelectionPathway() {
    return { selection: { pathway: DefaultPathWays[21], tissue: 'Header' } };
  }

  static getAppState() {
    const storedPathwaySelection = JSON.parse(localStorage.getItem(LOCAL_STATE_STORAGE));
    return storedPathwaySelection || AppStorageHandler.getDefaultSelectionPathway();
  }

  static getPathwaySelection() {
    return AppStorageHandler.getAppState().selection;
  }

  static storeAppState(selection) {
    if (selection) {
      localStorage.setItem(LOCAL_STATE_STORAGE, JSON.stringify(selection));
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
    if (appState && appState.cohortState && appState.cohortState[cohortIndex]) {
      return appState.cohortState[cohortIndex];
    }

    // TODO: is this correct, or should return a json with {name:xxx} ?
    // return cohortIndex === 0 ? 'TCGA Ovarian Cancer (OV)' : 'TCGA Prostate Cancer (PRAD)'
    return cohortIndex === 0 ? this.generateCohortState('TCGA Ovarian Cancer (OV)') : this.generateCohortState('TCGA Prostate Cancer (PRAD)');
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


  static getFilterState(cohortIndex) {
    const appState = AppStorageHandler.getAppState();
    if (appState && appState.filterState && appState.filterState[cohortIndex]) {
      return appState.filterState[cohortIndex];
    }
    return 'All';
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
      localStorage.setItem(LOCAL_APP_STORAGE, JSON.stringify(pathway));
    }
  }


  static getAppData(pathways) {
    const storedPathway = JSON.parse(localStorage.getItem(LOCAL_APP_STORAGE));
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
