import React from 'react'
import PureComponent from './PureComponent';
// import PropTypes from 'prop-types';
// import BaseStyle from '../../src/base.css';


// synchronizing gene sorts between pathways
const LOCAL_APP_STORAGE = "xena-app-storage";
const LOCAL_STATE_STORAGE = "xena-selection-storage";
/**
 * This is just for handling memory.
 */
export class AppStorageHandler extends PureComponent {

    static getDefaultSelectionPathway() {
        return {selection: {pathway: this.props.pathways[21], tissue: 'Header'}};
    }

    static getAppState() {
        let storedPathwaySelection = JSON.parse(localStorage.getItem(LOCAL_STATE_STORAGE));
        console.log('got pathway seleciton', storedPathwaySelection);
        let finalSelection = storedPathwaySelection ? storedPathwaySelection : AppStorageHandler.getDefaultSelectionPathway();
        console.log('got final seleciton', finalSelection);
        return finalSelection;
    }

    static getPathwaySelection() {
        let pathwaySelection = AppStorageHandler.getAppState().selection;
        console.log('pathway selection',pathwaySelection)
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

    static storePathwaySelection(pathway) {
        let selection = AppStorageHandler.getAppState();
        selection.selection = pathway;
        AppStorageHandler.storeAppState(selection);
    }

    static storeCohortState(selected, cohortIndex) {
        let appState = AppStorageHandler.getAppState();
        if(!appState.cohortState){
            appState.cohortState = {};
        }
        appState.cohortState[cohortIndex] = { selected:selected };
        AppStorageHandler.storeAppState(appState);
    }

    static storeApp(pathway) {
        if (pathway) {
            localStorage.setItem(LOCAL_APP_STORAGE, JSON.stringify(pathway));
        }
    }

    static getApp(props) {
        let storedPathway = JSON.parse(localStorage.getItem(LOCAL_APP_STORAGE));
        if (storedPathway) {
            console.log(storedPathway)
            return storedPathway
        }
        else {
            alert('getting default app')
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
