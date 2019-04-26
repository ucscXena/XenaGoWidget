import React from 'react'
import PureComponent from '../components/PureComponent';


// synchronizing gene sorts between pathways
const LOCAL_APP_STORAGE = "xena-app-storage";
const LOCAL_STATE_STORAGE = "xena-selection-storage";
const LOCAL_PATHWAY_STORAGE = "default-xena-pathways";
import DefaultPathWays from "../data/tgac";

const DefaultApp = {
    renderOffset: 5,
    selectedPathways: [],
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
        score: null
    },
    pathwayClickData: {
        tissue: null,
        pathway: null,
        score: null
    },
    geneHoverData: {
        tissue: null,
        gene: null,
        score: null
    },
    geneClickData: {
        tissue: null,
        pathway: null,
        score: null
    }
};

/**
 * This is just for handling memory.
 */
export class AppStorageHandler extends PureComponent {

    static storePathway(pathway) {
        if (pathway) {
            localStorage.setItem(LOCAL_PATHWAY_STORAGE, JSON.stringify(pathway));
        }
    }

    static getPathway() {
        let storedPathway = JSON.parse(localStorage.getItem(LOCAL_PATHWAY_STORAGE));
        return storedPathway ? storedPathway : DefaultPathWays;
    }

    static getDefaultSelectionPathway() {
        return {selection: {pathway: DefaultPathWays[21], tissue: 'Header'}};
    }

    static getAppState() {
        let storedPathwaySelection = JSON.parse(localStorage.getItem(LOCAL_STATE_STORAGE));
        return storedPathwaySelection ? storedPathwaySelection : AppStorageHandler.getDefaultSelectionPathway();
    }

    static getPathwaySelection() {
        return AppStorageHandler.getAppState().selection;
    }

    static storeAppState(selection) {
        if (selection) {
            localStorage.setItem(LOCAL_STATE_STORAGE, JSON.stringify(selection));
        }
        else {
            console.log('storing empty pathway')
        }
    }

    static storePathwaySelection(pathway, selectedPathways) {
        let appState = AppStorageHandler.getAppState();
        appState.selection = pathway;
        appState.selection.selectedPathways = selectedPathways;
        AppStorageHandler.storeAppState(appState);
    }


    static getCohortState(cohortIndex) {
        let appState = AppStorageHandler.getAppState();
        if (appState && appState.cohortState && appState.cohortState[cohortIndex]) {
            let returnValue = appState.cohortState[cohortIndex];
            if (returnValue && returnValue.selected) {
                return returnValue;
            }
        }
        return 'TCGA Ovarian Cancer (OV)'
    }

    static storeFilterState(selected, cohortIndex) {
        if (!selected) return;
        let appState = AppStorageHandler.getAppState();
        if (!appState.filterState) {
            appState.filterState = [];
        }
        // TODO: remove this hack
        let selectedValue = selected.selected ? selected.selected : selected;
        appState.filterState[cohortIndex] = {selected: selectedValue};
        AppStorageHandler.storeAppState(appState);
    }


    static getFilterState(cohortIndex) {
        let appState = AppStorageHandler.getAppState();
        if (appState && appState.filterState && appState.filterState[cohortIndex]) {
            let returnValue = appState.filterState[cohortIndex];
            if (returnValue && returnValue.selected) {
                return returnValue.selected;
            }
        }
        return 'All'
    }

    static storeSortState(selected, cohortIndex) {
        if (!selected) return;
        let appState = AppStorageHandler.getAppState();
        if (!appState.sortState) {
            appState.sortState = [];
        }
        // TODO: remove this hack
        let selectedValue = selected.selected ? selected.selected : selected;
        appState.sortState[cohortIndex] = {selected: selectedValue};
        AppStorageHandler.storeAppState(appState);
    }

    static storeCohortState(selected, cohortIndex) {
        console.log('storing the cohort state',selected,cohortIndex)
        if (!selected) return;
        let appState = AppStorageHandler.getAppState();
        console.log('storing cohort state has app state',appState)
        if (!appState.cohortState) {
            appState.cohortState = [];
        }
        // TODO: remove this hack
        // let selectedValue = selected.selected ? selected.selected : selected;
        // console.log('selected value: ',selectedValue)
        console.log('vs selected : ',selected)
        appState.cohortState[cohortIndex] = selected;
        console.log('storing cohort state final',appState)
        AppStorageHandler.storeAppState(appState);
    }

    static storeAppData(pathway) {
        if (pathway) {
            localStorage.setItem(LOCAL_APP_STORAGE, JSON.stringify(pathway));
        }
    }


    static getAppData(pathways) {
        let storedPathway = JSON.parse(localStorage.getItem(LOCAL_APP_STORAGE));
        if (storedPathway) {
            return storedPathway
        }
        else {
            // DefaultApp.renderHeight = renderHeight ;
            DefaultApp.pathwayData.pathways = pathways ;
            let app1 = Object.assign({}, DefaultApp);
            app1.key = 0 ;
            let app2 = Object.assign({}, DefaultApp);
            app2.key = 1 ;
            return [app1,app2];
        }
    }
}
