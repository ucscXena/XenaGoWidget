import React from 'react'
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import DefaultPathWays from "../data/genesets/tgac";
import PathwayEditor from "./pathwayEditor/PathwayEditor";
import {AppStorageHandler} from "../service/AppStorageHandler";
import NavigationBar from "./NavigationBar";
import {GeneSetSelector} from "./GeneSetSelector";
import {
    calculateAllPathways, calculateDiffs, generateGeneData, generateScoredData, scoreData, scoreGeneData,
} from '../functions/DataFunctions';
import FaArrowLeft from 'react-icons/lib/fa/arrow-left';
import FaArrowRight from 'react-icons/lib/fa/arrow-right';
import BaseStyle from '../css/base.css';
import {LabelTop} from "./LabelTop";
import VerticalGeneSetScoresView from "./VerticalGeneSetScoresView";
import {ColorEditor} from "./ColorEditor";
import {Dialog} from "react-toolbox";
import {fetchCombinedCohorts} from "../functions/FetchFunctions";

// let Rx = require('ucsc-xena-client/dist/rx');

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {sparseDataMatchPartialField, refGene} = xenaQuery;
import CrossHairH from "./CrossHairH";
import CrossHairV from "./CrossHairV";
import {fetchCohortData, getGenesForNamedPathways, getSubCohortsOnlyForCohort} from "../functions/CohortFunctions";
import {isEqual} from "underscore";
import update from "immutability-helper";
import {clusterSort, diffSort, synchronizedSort} from "../functions/SortFunctions";



export const XENA_VIEW = 'xena';
export const PATHWAYS_VIEW = 'pathways';
const VIEWER_HEIGHT = 500;

const VERTICAL_SELECTOR_WIDTH = 220;
const VERTICAL_GENESET_DETAIL_WIDTH = 180;
const VERTICAL_GENESET_SUPPRESS_WIDTH = 20;
const ARROW_WIDTH = 20;
const BORDER_OFFSET = 2;

export const MIN_FILTER = 2;


export const LABEL_A = 'A';
export const LABEL_B = 'B';

export const MIN_GENE_WIDTH_PX = 80;// 8 or less
export const MAX_GENE_WIDTH = 85;
export const MAX_GENE_LAYOUT_WIDTH_PX = 12 * MAX_GENE_WIDTH; // 85 genes

const LOAD_STATE = {
    UNLOADED: 'unloaded',
    LOADING: 'loading',
    LOADED: 'loaded',
};

let currentLoadState = LOAD_STATE.UNLOADED ;
export const COHORT_DATA = fetchCohortData();

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {


    constructor(props) {
        super(props);

        // let pathways = this.getActiveApp().pathway;
        const pathways = AppStorageHandler.getPathways();
        // const apps = AppStorageHandler.getAppData(pathways);

        // TODO: this should get subcohorts here, really
        let selectedCohortA = AppStorageHandler.getCohortState(0);
        selectedCohortA =  selectedCohortA.selected ? selectedCohortA.selected : selectedCohortA;

        let selectedCohortB = AppStorageHandler.getCohortState(1);
        selectedCohortB =  selectedCohortB.selected ? selectedCohortB.selected : selectedCohortB;


        const selectedSubCohortsA = getSubCohortsOnlyForCohort(selectedCohortA);
        const selectedSubCohortsB = getSubCohortsOnlyForCohort(selectedCohortB);


        const cohortDataA = {
            name: selectedCohortA,
            subCohorts: selectedSubCohortsA,
        };
        const cohortDataB = {
            name: selectedCohortB,
            subCohorts: selectedSubCohortsB,
        };

        // console.log('selected cohorts',selectedCohortA,selectedCohortB,cohortDataA,cohortDataB)

        this.state = {
            // TODO: this should use the full cohort Data, not just the top-level
            selectedCohort:[
                cohortDataA,
                cohortDataB,
            ],
            view: XENA_VIEW,
            loading:LOAD_STATE.UNLOADED,
            showColorEditor: false,
            showDetailLayer: true,
            showClusterSort: false,
            showDiffLayer: true,
            pathwaySet: {
                name: 'Default Pathway',
                pathways,
                selected: true
            },
            filter:[
                AppStorageHandler.getFilterState(0)  ,
                AppStorageHandler.getFilterState(1)  ,
            ],
            hoveredPathway: undefined,
            geneData: [{}, {}],
            pathwayData: [{}, {}],
            showPathwayDetails: false,
            geneHits: [],
            selectedGene: undefined,
            reference: refGene['hg38'],
            limit: 25,
            highlightedGene: undefined,
            collapsed: true,
            mousing: false,
            x:-1,
            y:-1,
            geneStateColors: {
                highDomain: 100,
                midDomain: 0,
                lowDomain: -100,
                lowColor: '#0000ff',
                midColor: '#ffffff',
                highColor: '#ff0000',
                gamma: 1.0,
                geneGamma: 1.0,
                linkDomains: true,
                shadingValue: 10,
            }
        };
    }

    queryGenes = (geneQuery) => {
        let {reference: {host, name}, limit} = this.state;
        if (geneQuery.trim().length === 0) {
            this.setState({
                geneHits: []
            });
            return;
        }
        let subscriber = sparseDataMatchPartialField(host, 'name2', name, geneQuery, limit);
        subscriber.subscribe(matches => {
                this.setState({
                    geneHits: matches
                })
            }
        )
    };


    handleUpload = (file) => {
        AppStorageHandler.storePathways(file);
        this.setState({
            pathwaySet: {
                name: 'Default Pathway',
                pathways: file,
                selected: true
            }
        })
    };

    handleReset = () => {
        AppStorageHandler.storePathways(DefaultPathWays);
        this.setState({
            pathwaySet: {
                name: 'Default Pathway',
                pathways: DefaultPathWays,
                selected: true
            }
        })
    };


    handleCombinedCohortData = (input) => {
        let {
            pathways,
            geneList,
            cohortData,

            samplesA,
            mutationsA,
            copyNumberA,
            genomeBackgroundMutationA,
            genomeBackgroundCopyNumberA,
            cohortA,
            selectedObjectA,
            samplesB,
            mutationsB,
            copyNumberB,
            genomeBackgroundMutationB,
            genomeBackgroundCopyNumberB,
            cohortB,
            selectedObjectB,
        } = input;

        // TODO: calculate Diff!
        // TODO: update Xena Go Viewers

        let pathwayDataA = {
            geneList,
            pathways,
            cohortData,
            cohort: cohortA,
            filter: this.state.filter[0],

            copyNumber: copyNumberA,
            expression: mutationsA,
            samples: samplesA,
            genomeBackgroundMutation: genomeBackgroundMutationA,
            genomeBackgroundCopyNumber: genomeBackgroundCopyNumberA,
            selectedObject: selectedObjectA
        };


        let pathwayDataB = {
            geneList,
            pathways,
            cohortData,
            cohort: cohortB,
            filter: this.state.filter[1],

            copyNumber: copyNumberB,
            expression: mutationsB,
            samples: samplesB,
            genomeBackgroundMutation: genomeBackgroundMutationB,
            genomeBackgroundCopyNumber: genomeBackgroundCopyNumberB,
            selectedObject: selectedObjectB
        };

        pathways = calculateAllPathways(pathwayDataA,pathwayDataB);

        pathwayDataA.pathways = pathways ;
        pathwayDataB.pathways = pathways ;

        AppStorageHandler.storePathways(pathways);


        let selection = AppStorageHandler.getPathwaySelection();
        let geneData = generateScoredData(selection,pathwayDataA,pathwayDataB,pathways,this.state.filter);

        if (this.state.showClusterSort) {
            // if (cohortIndex === 0) {
            //     returnedValue = clusterSort(returnedValue);
            //     PathwayScoresView.synchronizedGeneList = returnedValue.pathways.map(g => g.gene[0]);
            // } else {
            //     PathwayScoresView.synchronizedGeneList = PathwayScoresView.synchronizedGeneList ? PathwayScoresView.synchronizedGeneList : [];
            //     returnedValue = synchronizedSort(returnedValue, PathwayScoresView.synchronizedGeneList);
            // }
        }
        else{
            // geneData[0] = diffSort(geneData[0]);
            // geneData[1] = diffSort(geneData[1]);
        }

        currentLoadState = LOAD_STATE.LOADED;
        this.setState({
            pathwaySelection: selection,
            geneList,
            pathways,
            geneData,
            pathwayData: [pathwayDataA,pathwayDataB],
            loading: LOAD_STATE.LOADED,
            processing: false,
            fetch: false,
        });


    };

    addGeneSet = (selectedPathway) => {
        let selectedPathwaySet = JSON.parse(JSON.stringify(this.state.pathwaySet));
        let newGeneSetObject = {
            goid: '',
            golabel: selectedPathway,
            gene: []
        };
        selectedPathwaySet.pathways.unshift(newGeneSetObject);
        AppStorageHandler.storePathways(selectedPathwaySet.pathways);

        this.setState({
            pathwaySet: selectedPathwaySet
        });
    };

    addGene = (selectedPathway, selectedGene) => {

        // get geneset to alter
        let selectedPathwaySet = JSON.parse(JSON.stringify(this.state.pathwaySet));

        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathways.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathways.find(p => selectedPathway.golabel === p.golabel);

        selectedPathwaySet.pathways = selectedPathwaySet.pathways.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene.unshift(selectedGene);

        // add to the existing index
        selectedPathwaySet.pathways.splice(pathwayIndex, 0, newSelectedPathway);

        AppStorageHandler.storePathways(selectedPathwaySet.pathways);
        this.setState({
            pathwaySet: selectedPathwaySet,
        });

        // TODO: this could be done via a global variable, but specific to the PathwayEditor
        this.refs['pathway-editor'].selectedPathway(newSelectedPathway);
    };

    removeGene = (selectedPathway, selectedGene) => {
        let selectedPathwaySet = JSON.parse(JSON.stringify(this.state.pathwaySet));
        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathways.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathways.find(p => selectedPathway.golabel === p.golabel);
        selectedPathwaySet.pathways = selectedPathwaySet.pathways.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene = newSelectedPathway.gene.filter(g => g !== selectedGene);

        // add to the existing index
        selectedPathwaySet.pathways.splice(pathwayIndex, 0, newSelectedPathway);
        AppStorageHandler.storePathways(selectedPathwaySet.pathways);
        this.setState({
            pathwaySet: selectedPathwaySet,
        });

        // TODO: this could be done via a global variable, but specific to the PathwayEditor
        this.refs['pathway-editor'].selectedPathway(newSelectedPathway);
    };

    removeGeneSet = (selectedPathway) => {
        let selectedPathwaySet = JSON.parse(JSON.stringify(this.state.pathwaySet));
        // removes selected pathway
        selectedPathwaySet.pathways = selectedPathwaySet.pathways.filter(p => selectedPathway.golabel !== p.golabel)
        AppStorageHandler.storePathways(selectedPathwaySet.pathways);
        this.setState({
            pathwaySet: selectedPathwaySet,
            selectedPathway: undefined,
        });
    };

    getActiveApp() {
        return this.state.pathwaySet;
    }

    showPathways = () => {
        this.setState({
            view: PATHWAYS_VIEW
        })
    };

    showXena = () => {
        this.setState({
            view: XENA_VIEW
        })
    };

    editGeneSetColors = () => {
        // alert('configuring xena')
        this.handleColorToggle();
        // this.setState({
        //     view: XENA_VIEW
        // })
    };

    geneHighlight = (geneName) => {
        this.setState(
            {
                highlightedGene: geneName
            }
        );
    };

    geneHover = (geneHover) => {



        // this.setState(
        //     {
        //         hoveredPathway: geneHover ? geneHover.pathway : {}
        //     }
        // );
        // console.log('gene hover',JSON.stringify(geneHover))


        if(geneHover){
            // TODO: this needs to be taken from the more global data
            let genericHoverData = {
                tissue: geneHover.tissue,
                pathway: geneHover.pathway,
                expression : geneHover.pathway,
            };

            const geneHoverData0 = geneHover.cohortIndex === 0 ? geneHover : genericHoverData;
            const geneHoverData1 = geneHover.cohortIndex === 1 ? geneHover : genericHoverData;

            const geneHoverData = [ geneHoverData0,geneHoverData1 ];
            this.setState({
                geneHoverData
            });
        }
        else{

        }

        // if (geneHover) {
        //     let myIndex = geneHover.cohortIndex;
        //     this.state.apps.forEach((app, index) => {
        //         if (index !== myIndex) {
        //             this.refs['xena-go-app-' + index].setGeneHover(geneHover.pathway);
        //         }
        //     });
        // }
        // const geneHoverData = geneHover ? [
        //     {
        //         tissue: 'Header',
        //         pathway: geneHover,
        //         expression: {
        //             affected: geneHover.firstObserved,
        //             samplesAffected: geneHover.firstObserved,
        //             allGeneAffected: geneHover.firstTotal,
        //             total: geneHover.firstNumSamples,
        //         }
        //     },
        //     {
        //
        //         tissue: 'Header',
        //         pathway: geneHover,
        //         expression: {
        //             affected: geneHover.secondObserved,
        //             samplesAffected: geneHover.secondObserved,
        //             allGeneAffected: geneHover.secondTotal,
        //             total: geneHover.secondNumSamples,
        //         }
        //     }
        // ] : this.state.geneHoverData;
        //
        // // if(hoveredPathway){
        // //     console.log('setting new hovered pathway',JSON.stringify(geneHoverData))
        // // }
        //
        //
    };


    globalPathwayHover = (hoveredPathway) => {

        const geneHoverData = hoveredPathway ? [
            {
                tissue: 'Header',
                pathway: hoveredPathway,
                expression: {
                    affected: hoveredPathway.firstObserved,
                    samplesAffected: hoveredPathway.firstObserved,
                    allGeneAffected: hoveredPathway.firstTotal,
                    total: hoveredPathway.firstNumSamples,
                }
            },
            {

                tissue: 'Header',
                pathway: hoveredPathway,
                expression: {
                    affected: hoveredPathway.secondObserved,
                    samplesAffected: hoveredPathway.secondObserved,
                    allGeneAffected: hoveredPathway.secondTotal,
                    total: hoveredPathway.secondNumSamples,
                }
            }
        ] : this.state.geneHoverData;

        // if(hoveredPathway){
        //     console.log('setting new hovered pathway',JSON.stringify(geneHoverData))
        // }


        this.setState({
            hoveredPathway,
            geneHoverData
        });
        // console.log('pathway hover',JSON.stringify(hoveredPathway))

        // this.state.apps.forEach((app, index) => {
        //     if(pathwayHover){
        //         pathwayHover.samplesAffected = index === 0 ? pathwayHover.firstObserved : pathwayHover.secondObserved;
        //     }
        //     this.refs['xena-go-app-' + index].setPathwayHover(pathwayHover);
        // });
    };

// populates back to the top
//     shareGlobalGeneData = (geneData, cohortIndex) => {
//         const isChange = (cohortIndex === 0 && geneData.length!==this.state.geneData[0].length) || (cohortIndex === 1 && geneData.length!==this.state.geneData[1].length);
//
//         let geneData0 = cohortIndex === 0 ? geneData : this.state.geneData[0];
//         let geneData1 = cohortIndex === 1 ? geneData : this.state.geneData[1];
//         let finalGeneData = calculateDiffs(geneData0, geneData1);
//
//         if(isChange){
//             if(geneData0.length>0){
//                 this.geneHover({
//                     pathway:geneData0[0],
//                     cohortIndex
//                 });
//             }
//             if(geneData1.length>0){
//                 this.geneHover({
//                     pathway:geneData1[0],
//                     cohortIndex
//                 });
//             }
//         }
//         this.setState({
//             geneData: finalGeneData
//         });
//     };

    downloadData = (cohortIndex) => {
        console.log('trying to download with ',cohortIndex)
        if (!internalData) {
            alert('No Data Available');
            return;
        }
        let {selectedCohort, selectedPathway} = this.props;

        let filename = selectedCohort.replace(/ /g, '_') + '_' + selectedPathway[0] + '_' + cohortIndex + '.json';
        // let filename = "export.json";
        let contentType = "application/json;charset=utf-8;";
        // a hacky way to do this
        let a = document.createElement('a');
        a.download = filename;
        a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(internalData));
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    globalPathwaySelect = (pathwaySelection) => {

        console.log('pathway selection',JSON.stringify(pathwaySelection),pathwaySelection)
        let {showClusterSort,pathwayData,filter} = this.state;

        if (pathwaySelection.gene.length === 0) {
            return;
        }
        // let selectedPathways = [pathwaySelection.golabel];
        let pathwayClickData = {
            pathway: pathwaySelection
        };

        let pathwaySelectionWrapper = {
            pathway:pathwaySelection,
            tissue: 'Header'
        };
        this.setState({
            pathwaySelection: pathwaySelectionWrapper
        });
        AppStorageHandler.storePathwaySelection(pathwaySelectionWrapper);

        const geneSetPathways = AppStorageHandler.getPathways();
        let geneData = generateScoredData(pathwayClickData,pathwayData[0],pathwayData[1],geneSetPathways,filter);

        this.setState({geneData});
    };


    hideGeneSetDetail = () => {
        this.setState({
            showPathwayDetails: false
        })
    };

    showGeneSetDetail = () => {
        this.setState({
            showPathwayDetails: true
        })
    };

    searchHandler = (geneQuery) => {
        this.queryGenes(geneQuery);
    };

    acceptGeneHandler = (geneName) => {
        if (this.state.view === XENA_VIEW) {
            this.geneHighlight(geneName);
        } else if (this.state.view === PATHWAYS_VIEW) {
            this.pathwayEditorGeneHandler(geneName)
        }
    };

    pathwayEditorGeneHandler = (geneName) => {
        this.refs['pathway-editor'].highlightGenes(geneName)
    };

    handleColorToggle = () => {
        this.setState({showColorEditor: !this.state.showColorEditor});
    };

    handleColorChange = (name, value) => {
        let newArray = JSON.parse(JSON.stringify(this.state.geneStateColors));
        newArray[name] = value;
        this.setState({
            geneStateColors: newArray
        })

    };

    toggleShowDiffLayer = () => {
        this.setState({
            showDiffLayer: !this.state.showDiffLayer
        })
    };

    toggleShowDetailLayer = () => {
        this.setState({
            showDetailLayer: !this.state.showDetailLayer
        })
    };

    toggleShowClusterSort = () => {
        this.setState({
            showClusterSort: !this.state.showClusterSort
        })
    };

    // callDownload = (cohortIndex) => {
    //     this.refs['xena-go-app-' + cohortIndex].callDownload();
    // };

    setCollapsed = (collapsed) => {
        this.setState({
            collapsed: collapsed
        })
    };


    doRefetch(){

        if(this.state.fetch ){
            return true ;
        }

        switch (currentLoadState) {
            case LOAD_STATE.LOADING:
                return false ;
            case LOAD_STATE.UNLOADED:
                return true ;

                // TODO: this should be calculated below depending on the state of gene data and if the selected cohort changed
            case LOAD_STATE.LOADED:
                return false ;

        }

        if(isEqual(this.state.geneData,[{},{}])) return true ;
        if(isEqual(this.state.pathwayData,[{},{}])) return true ;

        if(!isEqual(this.state.selectedCohort[0], this.state.selectedCohort[1])) return true ;
        // if(!isEqual(this.state.selectedSubCohortsA, this.state.selectedSubCohortsB)) return true ;

        return false;
    }

    changeCohort = (selectedCohort,cohortIndex) => {
        console.log('changing cohort with ',selectedCohort,cohortIndex)
        // I think we just set the state

        // fetchCombinedCohorts(this.state.apps[0].selectedCohort,this.state.apps[1].selectedCohort,this.state.cohortData,pathways,this.handleCombinedCohortData);
        // fetchCombinedCohorts(this.state.apps[0].selectedCohort,this.state.apps[1].selectedCohort,this.state.cohortData,pathways,this.handleCombinedCohortData);

       AppStorageHandler.storeCohortState(selectedCohort, cohortIndex);
       // let subCohortsA = getSubCohortsOnlyForCohort(this.state.selectedCohortA) ;
        // console.log('SELECTED cohort A',this.state.selectedCohortA,selectedCohort,cohortIndex,subCohortsA)

        const newCohortState = [
            cohortIndex === 0 ?  selectedCohort : this.state.selectedCohort[0]   ,
            cohortIndex === 1 ?  selectedCohort : this.state.selectedCohort[1]   ,
        ];
        console.log('NEW COHORT STATE A',newCohortState)

        // let newAppState = update(this.state,{
        //
        //     // apps: {
        //     //     [cohortIndex]: {
        //     //         selectedCohort:  { $set: selectedCohort},
        //     //         selectedSubCohorts:  { $set: subCohorts}
        //     //     }
        //     // },
        //     fetch: {$set: true}
        // });
        // this.setState( {selectedCohort: newCohortState});
        let newAppState = update(this.state,{
            selectedCohort: {
                [cohortIndex]: {
                    selectedCohort:  { $set: selectedCohort},
                }
            },
            fetch: {$set: true}
        });
        console.log('newAppState',newAppState)
        console.log('newCohrot state',newCohortState)
        this.setState( {selectedCohort: newCohortState});
    };

    changeSubCohort = (selectedCohort,cohortIndex) => {
        console.log('changing sub cohort with ',selectedCohort,cohortIndex)
        AppStorageHandler.storeCohortState(selectedCohort, cohortIndex);

        // let subCohorts = getSubCohortsOnlyForCohort(selectedCohort) ;
        let newAppState = update(this.state,{
            apps: {
                [cohortIndex]: {
                    name:  { $set: selectedCohort.name},
                    subCohorts:  { $set: selectedCohort.subCohorts}
                }
            },
            fetch: {$set: true}
        });
        this.setState( newAppState );
    };

    changeFilter = (filter,cohortIndex) => {
        // console.log('changing filter with ',filter,cohortIndex,this.state.filter)
        AppStorageHandler.storeFilterState(filter, cohortIndex);
        let filterState = [
           cohortIndex===0 ? filter : this.state.filter[0]  ,
            cohortIndex===1 ? filter : this.state.filter[1]  ,
        ];

        // TODO: recalculate gene data

        this.setState({filter:filterState })
    };

    render() {
        let activeApp = this.getActiveApp();
        let pathways = activeApp.pathways;

        let leftPadding = this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH - ARROW_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH;

        // TODO: returned should do rendering
        // console.log('A FETCHING new ',this.state.selectedCohort[0],this.state.selectedCohort[1]);

        if(this.doRefetch()){
            currentLoadState = LOAD_STATE.LOADING;

            // console.log('FETCHING',this.state.selectedCohortA,this.state.selectedCohortB);
            // console.log('FETCHING new ',this.state.selectedCohort[0],this.state.selectedCohort[1]);
            fetchCombinedCohorts(this.state.selectedCohort[0],this.state.selectedCohort[1],pathways,this.handleCombinedCohortData);
        }
        // else{
        //     console.log('not refetching ')
        // }


        // TODO: assess subCohortSelected from selectedCohorts.selectedSubCohorts . . . if it exists
        // fetchCombinedSubCohorts(this.state.apps[0].selectedCohort,this.state.apps[1].selectedCohort,this.state.cohortData)
        // TODO: remove componentDidUpdate

        // console.log('GENE DAta Stats',JSON.stringify(this.state.geneData));

        // console.log('cohort data',this.state.cohortData)

        // 2. based on cohortData, fetch cohorts with subCohorts


        return (
            <div>

                <NavigationBar showPathways={this.showPathways}
                               showXena={this.showXena}
                               editGeneSetColors={this.editGeneSetColors}
                               view={this.state.view}
                               searchHandler={this.searchHandler}
                               geneOptions={this.state.geneHits}
                               acceptGeneHandler={this.acceptGeneHandler}
                               downloadRawHandler={this.downloadData}
                               toggleShowDiffLayer={this.toggleShowDiffLayer}
                               toggleShowDetailLayer={this.toggleShowDetailLayer}
                               toggleShowClusterSort={this.toggleShowClusterSort}
                               showDiffLayer={this.state.showDiffLayer}
                               showDetailLayer={this.state.showDetailLayer}
                               showClusterSort={this.state.showClusterSort}
                />

                <div>
                    <ColorEditor active={this.state.showColorEditor}
                                 handleToggle={this.handleColorToggle}
                                 handleColorChange={this.handleColorChange}
                                 colorSettings={this.state.geneStateColors}
                    />
                    <Dialog
                        active={this.state.view === PATHWAYS_VIEW }
                        onEscKeyDown={this.showXena}
                        onOverlayClick={this.showXena}
                        title='Edit Pathways'
                    >
                        <PathwayEditor ref='pathway-editor'
                                       pathwaySet={this.state.pathwaySet}
                                       removeGeneHandler={this.removeGene}
                                       removeGeneSetHandler={this.removeGeneSet}
                                       addGeneSetHandler={this.addGeneSet}
                                       addGeneHandler={this.addGene}
                                       uploadHandler={this.handleUpload}
                                       resetHandler={this.handleReset}
                                       closeHandler={this.showXena}
                        />
                    </Dialog>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <table>
                                    <tbody>
                                    <tr>
                                        <td width={this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}
                                        >
                                            {this.state.showPathwayDetails &&
                                            <div style={{paddingLeft: leftPadding}}>
                                                <FaArrowRight onClick={this.hideGeneSetDetail}
                                                              className={BaseStyle.mouseHover}/>
                                             </div>
                                            }
                                            {!this.state.showPathwayDetails &&
                                            <FaArrowLeft onClick={this.showGeneSetDetail}
                                                         className={BaseStyle.mouseHover}/>
                                            }
                                        </td>
                                        <td width={VERTICAL_SELECTOR_WIDTH - 20}>
                                            <LabelTop width={VERTICAL_SELECTOR_WIDTH - 20}/>
                                        </td>
                                        <td width={this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}>
                                            {this.state.showPathwayDetails &&
                                            <FaArrowLeft onClick={this.hideGeneSetDetail}
                                                         className={BaseStyle.mouseHover}/>
                                            }
                                            {!this.state.showPathwayDetails &&
                                            <FaArrowRight onClick={this.showGeneSetDetail}
                                                          className={BaseStyle.mouseHover}/>
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width={this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}>
                                            {this.state.showPathwayDetails &&
                                            <VerticalGeneSetScoresView
                                                data={this.state.pathwayData[0]}
                                                cohortIndex={0}
                                                cohortLabel={LABEL_A}
                                                pathways={pathways}
                                                filter={this.state.filter[0]}
                                                width={VERTICAL_GENESET_DETAIL_WIDTH}
                                                labelHeight={18 + 2 * BORDER_OFFSET}
                                                selectedCohort={this.state.selectedCohort[0]}
                                                onClick={this.globalPathwaySelect}
                                                onHover={this.globalPathwayHover}
                                                onMouseOut={this.globalPathwayHover}
                                            />
                                            }
                                        </td>
                                        <td width={VERTICAL_SELECTOR_WIDTH - 20}>
                                            <GeneSetSelector pathways={pathways}
                                                             hoveredPathway={this.state.hoveredPathway}
                                                             selectedPathway={this.state.pathwaySelection}
                                                             highlightedGene={this.state.highlightedGene}
                                                             onClick={this.globalPathwaySelect}
                                                             onHover={this.globalPathwayHover}
                                                             onMouseOut={this.globalPathwayHover}
                                                             labelHeight={18}
                                                             topOffset={14}
                                                             width={VERTICAL_SELECTOR_WIDTH}
                                                             geneStateColors={this.state.geneStateColors}
                                            />
                                        </td>
                                        <td width={this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}>
                                            {this.state.showPathwayDetails &&
                                            <VerticalGeneSetScoresView
                                                data={this.state.pathwayData[1]}
                                                cohortIndex={1}
                                                cohortLabel={LABEL_B}
                                                filter={this.state.filter[1]}
                                                width={200}
                                                pathways={pathways}
                                                labelHeight={18 + 2 * BORDER_OFFSET}
                                                selectedCohort={this.state.selectedCohort[1]}
                                                onClick={this.globalPathwaySelect}
                                                onHover={this.globalPathwayHover}
                                                onMouseOut={this.globalPathwayHover}
                                            />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </td>

                            {this.state.loading===LOAD_STATE.LOADED &&
                                <td valign="top" className="map_wrapper"
                                onMouseMove={(ev) => {
                                // const x = ev.clientX - ev.currentTarget.getBoundingClientRect().left + 295;
                                const x = ev.clientX + 8;
                                const y = ev.clientY + 8;
                                this.setState({mousing: true, x, y});
                            }}
                                onMouseOut = {() => {
                                this.setState({mousing: false});
                            }}
                                >
                                <CrossHairH mousing={this.state.mousing} y={this.state.y}/>
                                <CrossHairV mousing={this.state.mousing} x={this.state.x} height={VIEWER_HEIGHT * 2}/>
                                <XenaGoViewer
                                    // reference
                                    cohortIndex={0}
                                    cohortLabel={LABEL_A}

                                    // view
                                    renderOffset={0}
                                    renderHeight={VIEWER_HEIGHT}

                                    // data
                                    // appData={this.state.apps[0]}
                                    selectedCohort={this.state.selectedCohort[0]}
                                    geneDataStats={this.state.geneData[0]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[0] : {}}

                                    // maybe state?
                                    pathways={pathways}
                                    highlightedGene={this.state.highlightedGene}
                                    // filter={AppStorageHandler.getFilterState(0)}
                                    // filter={AppStorageHandler.getFilterState(0)}
                                    filter={this.state.filter[0]}

                                    // new pathway data
                                    pathwayData={this.state.pathwayData[0]}
                                    pathwaySelection={this.state.pathwaySelection}


                                   // functions
                                    geneHover={this.geneHover}
                                    // shareGlobalGeneData={this.shareGlobalGeneData}
                                    setCollapsed={this.setCollapsed}
                                    changeCohort={this.changeCohort}
                                    changeSubCohort={this.changeSubCohort}
                                    changeFilter={this.changeFilter}

                                    // state
                                    colorSettings={this.state.geneStateColors}
                                    collapsed={this.state.collapsed}
                                    showDiffLayer={this.state.showDiffLayer}
                                    showDetailLayer={this.state.showDetailLayer}
                                    showClusterSort={this.state.showClusterSort}
                                />
                                <XenaGoViewer
                                    // reference
                                    cohortIndex={1}
                                    cohortLabel={LABEL_B}

                                    // view
                                    renderHeight={VIEWER_HEIGHT}
                                    renderOffset={VIEWER_HEIGHT - 3}

                                    // data
                                    // appData={this.state.apps[1]}
                                    selectedCohort={this.state.selectedCohort[1]}
                                    geneDataStats={this.state.geneData[1]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[1] : {}}

                                    // maybe state?
                                    pathways={pathways}
                                    highlightedGene={this.state.highlightedGene}
                                    // filter={AppStorageHandler.getFilterState(1)}
                                    filter={this.state.filter[1]}

                                    // new pathway data
                                    pathwayData={this.state.pathwayData[1]}
                                    pathwaySelection={this.state.pathwaySelection}

                                    // functions
                                    geneHover={this.geneHover}
                                    // shareGlobalGeneData={this.shareGlobalGeneData}
                                    setCollapsed={this.setCollapsed}
                                    changeCohort={this.changeCohort}
                                    changeSubCohort={this.changeSubCohort}
                                    changeFilter={this.changeFilter}

                                    // state
                                    colorSettings={this.state.geneStateColors}
                                    collapsed={this.state.collapsed}
                                    showDiffLayer={this.state.showDiffLayer}
                                    showDetailLayer={this.state.showDetailLayer}
                                    showClusterSort={this.state.showClusterSort}
                                />
                                </td>
                            }
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>);
    }

}
