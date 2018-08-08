import React from 'react'
import PureComponent from './PureComponent';
// import PropTypes from 'prop-types';
// import BaseStyle from '../../src/base.css';


// synchronizing gene sorts between pathways
const LOCAL_APP_STORAGE = "xena-app-storage";
const LOCAL_STATE_STORAGE = "xena-selection-storage";
import DefaultPathWays from "../../tests/data/tgac";
/**
 * This is just for handling memory.
 */
export class AppStorageHandler extends PureComponent {

    static getDefaultSelectionPathway() {
        return {selection: {pathway: DefaultPathWays[21], tissue: 'Header'}};
    }

    static getAppState() {
        let storedPathwaySelection = JSON.parse(localStorage.getItem(LOCAL_STATE_STORAGE));
        let finalSelection = storedPathwaySelection ? storedPathwaySelection : AppStorageHandler.getDefaultSelectionPathway();
        return finalSelection;
    }

    static getPathwaySelection() {
        let pathwaySelection = AppStorageHandler.getAppState().selection;
        console.log('AppStorage: pathway selection',pathwaySelection);
        return pathwaySelection;
    }

    static storeAppState(selection) {
        if (selection) {
            localStorage.setItem(LOCAL_STATE_STORAGE, JSON.stringify(selection));
        }
        else {
            console.log('storing empty pathway')
        }
    }

    static storePathwaySelection(pathway,selectedPathways) {
        let appState = AppStorageHandler.getAppState();
        appState.selection = pathway;
        appState.selection.selectedPathways = selectedPathways;
        AppStorageHandler.storeAppState(appState);
    }


    static getCohortState(cohortIndex){
        let appState = AppStorageHandler.getAppState();
        if(appState && appState.cohortState && appState.cohortState[cohortIndex]){
            let returnValue = appState.cohortState[cohortIndex];
            if(returnValue && returnValue.selected) {
                return returnValue ;
            }
        }
        console.log('no cohort index found',cohortIndex);
        return 'TCGA Ovarian Cancer (OV)'
    }

    static storeFilterState(selected,cohortIndex){
        if(!selected) return ;
        let appState = AppStorageHandler.getAppState();
        if(!appState.filterState){
            appState.filterState = [];
        }
        // TODO: remove this hack
        let selectedValue = selected.selected ? selected.selected : selected ;
        appState.filterState[cohortIndex] = { selected:selectedValue};
        console.log('STORING filter state',appState);
        AppStorageHandler.storeAppState(appState);
    }


    static getFilterState(cohortIndex){
        let appState = AppStorageHandler.getAppState();
        if(appState && appState.filterState && appState.filterState[cohortIndex]){
            let returnValue = appState.filterState[cohortIndex];
            if(returnValue && returnValue.selected) {
                return returnValue.selected ;
            }
        }
        console.log('no cohort index found',cohortIndex);
        return 'All'
    }

    static storeSortState(selected,cohortIndex){
        if(!selected) return ;
        let appState = AppStorageHandler.getAppState();
        if(!appState.sortState){
            appState.sortState = [];
        }
        // TODO: remove this hack
        let selectedValue = selected.selected ? selected.selected : selected ;
        appState.sortState[cohortIndex] = { selected:selectedValue};
        console.log('STORING sort state',appState);
        AppStorageHandler.storeAppState(appState);
    }

    static getSortState(cohortIndex){
        let appState = AppStorageHandler.getAppState();
        if(appState && appState.sortState && appState.sortState[cohortIndex]){
            let returnValue = appState.sortState[cohortIndex];
            if(returnValue && returnValue.selected) {
                return returnValue.selected ;
            }
        }
        console.log('no cohort index found',cohortIndex);
        return 'Cluster'
    }

    static storeCohortState(selected, cohortIndex) {
        if(!selected) return ;
        let appState = AppStorageHandler.getAppState();
        if(!appState.cohortState){
            appState.cohortState = [];
        }
        // TODO: remove this hack
        let selectedValue = selected.selected ? selected.selected : selected ;
        appState.cohortState[cohortIndex] = { selected:selectedValue};
        console.log('STORING cohort state',appState);
        AppStorageHandler.storeAppState(appState);
    }

    static storeAppData(pathway) {
        if (pathway) {
            localStorage.setItem(LOCAL_APP_STORAGE, JSON.stringify(pathway));
        }
    }

    static getAppData(props) {
        let storedPathway = JSON.parse(localStorage.getItem(LOCAL_APP_STORAGE));
        if (storedPathway) {
            // console.log('retrived storage',storedPathway);
            return storedPathway
        }
        else {
            // console.log('retrieving default app');
            return [
                {
                    key: 0,
                    renderHeight: props.renderHeight,
                    renderOffset: 5,
                    selectedTissueSort: 'Cluster',
                    selectedGeneSort: 'Cluster',
                    selectedPathways: [],
                    sortTypes: ['Cluster', 'Hierarchical'],
                    pathwayData: {
                        cohort: 'TCGA Ovarian Cancer (OV)',
                        copyNumber: [],
                        expression: [],
                        pathways: props.pathways,
                        samples: [],
                    },
                    loadState: 'loading',
                    selectedCohort: 'TCGA Ovarian Cancer (OV)',
                    cohortData: {},
                    tissueExpressionFilter: 'All',
                    geneExpressionFilter: 'All',
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
                    },
                },
            ];
        }
    }
}
