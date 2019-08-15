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
import {fetchCohortData, getCohortDetails, getSubCohortsOnlyForCohort} from "../functions/CohortFunctions";
import {isEqual} from "underscore";
import update from "immutability-helper";
import {SortType} from "../functions/SortFunctions";



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
let showClusterSort = AppStorageHandler.getSortState()===SortType.CLUSTER;
export const COHORT_DATA = fetchCohortData();

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {


    constructor(props) {
        super(props);

        const pathways = AppStorageHandler.getPathways();
        // TODO: this should get subcohorts here, really
        let selectedCohortA = AppStorageHandler.getCohortState(0);
        let selectedCohortB = AppStorageHandler.getCohortState(1);

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

        this.state = {
            // TODO: this should use the full cohort Data, not just the top-level
            selectedCohort:[
                cohortDataA,
                cohortDataB,
            ],
            view: XENA_VIEW,
            fetch: false,
            loading:LOAD_STATE.UNLOADED,
            showColorEditor: false,
            showDetailLayer: true,
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

        pathways = calculateAllPathways([pathwayDataA,pathwayDataB]);

        pathwayDataA.pathways = pathways ;
        pathwayDataB.pathways = pathways ;

        AppStorageHandler.storePathways(pathways);


        let selection = AppStorageHandler.getPathwaySelection();
        let geneData = generateScoredData(selection,[pathwayDataA,pathwayDataB],pathways,this.state.filter,showClusterSort);

        currentLoadState = LOAD_STATE.LOADED;
        this.setState({
            pathwaySelection: selection,
            geneList,
            pathways,
            geneData,
            pathwayData: [pathwayDataA,pathwayDataB],
            loading: LOAD_STATE.LOADED,
            currentLoadState: LOAD_STATE.LOADED,
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
        if(geneHover){

            // TODO: this needs to be taken from the more global data
            let genericHoverData = {
                tissue: geneHover.tissue,
                pathway: geneHover.pathway,
                // expression : geneHover.pathway,// not sure why it was this way?
                expression : geneHover.expression,
            };

            const geneHoverData0 = geneHover.cohortIndex === 0 ? geneHover : genericHoverData;
            const geneHoverData1 = geneHover.cohortIndex === 1 ? geneHover : genericHoverData;

            const geneHoverData = [ geneHoverData0,geneHoverData1 ];
            this.setState({
                geneHoverData
            });
        }
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

        this.setState({
            hoveredPathway,
            geneHoverData
        });
    };

    globalPathwaySelect = (pathwaySelection) => {

        let {pathwayData,filter} = this.state;

        if (pathwaySelection.gene.length === 0) {
            return;
        }
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
        let geneData = generateScoredData(pathwayClickData,pathwayData,geneSetPathways,filter,showClusterSort);

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
        showClusterSort = !showClusterSort;
        AppStorageHandler.storeSortState(showClusterSort ? SortType.CLUSTER : SortType.DIFF)
        this.globalPathwaySelect(this.state.pathwaySelection.pathway)
    };

    setCollapsed = (collapsed) => {
        this.setState({
            collapsed: collapsed
        })
    };

    doRefetch(){

        if(this.state.fetch && currentLoadState!==LOAD_STATE.LOADING){
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
       AppStorageHandler.storeCohortState(selectedCohort, cohortIndex);
       // let subCohortsA = getSubCohortsOnlyForCohort(this.state.selectedCohortA) ;
        const cohortDetails = getCohortDetails({name: selectedCohort});

        const newCohortState = [
            cohortIndex === 0 ?  cohortDetails : this.state.selectedCohort[0]   ,
            cohortIndex === 1 ?  cohortDetails  : this.state.selectedCohort[1]   ,
        ];

        this.setState( {selectedCohort: newCohortState,fetch: true,currentLoadState: LOAD_STATE.LOADING});
    };

    changeSubCohort = (selectedCohort,cohortIndex) => {
        console.log('changing sub cohort with ',selectedCohort,JSON.stringify(cohortIndex))

        // AppStorageHandler.storeCohortState(selectedCohort, cohortIndex);
        // let subCohorts = getSubCohortsOnlyForCohort(selectedCohort) ;
        // let newAppState = update(this.state,{
        //     apps: {
        //         [cohortIndex]: {
        //             name:  { $set: selectedCohort.name},
        //             subCohorts:  { $set: selectedCohort.subCohorts}
        //         }
        //     },
        //     fetch: {$set: true}
        // });
        // this.setState( newAppState );
    };

    changeFilter = (newFilter,cohortIndex) => {
        AppStorageHandler.storeFilterState(newFilter, cohortIndex);
        let {pathwayData,pathwaySelection,filter} = this.state;
        let filterState = [
           cohortIndex===0 ? newFilter : filter[0]  ,
           cohortIndex===1 ? newFilter : filter[1]  ,
        ];

        let newPathwayData = update(pathwayData,{
            [cohortIndex]: {
                filter: { $set: newFilter},
            }
        });

        let pathwayClickData = {
            pathway: pathwaySelection.pathway
        };

        // console.log(JSON.stringify('calculating filter with '),newPathwayData)
        // const geneSetPathways = AppStorageHandler.getPathways();
        let newPathways = calculateAllPathways(newPathwayData);
        let geneData = generateScoredData(pathwayClickData,newPathwayData,newPathways,filterState,showClusterSort);
        this.setState({ filter:filterState ,geneData,pathways:newPathways,pathwayData:newPathwayData});
    };

    render() {
        let activeApp = this.getActiveApp();
        let pathways = activeApp.pathways;


        let leftPadding = this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH - ARROW_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH;

        if(this.doRefetch()){
            currentLoadState = LOAD_STATE.LOADING;
            fetchCombinedCohorts(this.state.selectedCohort[0],this.state.selectedCohort[1],pathways,this.handleCombinedCohortData);
        }
        // else{
        //     console.log('not refetching',JSON.stringify(this.state.selectedCohort),JSON.stringify(this.state.fetch))
        // }

        return (
            <div>

                <NavigationBar showPathways={this.showPathways}
                               showXena={this.showXena}
                               editGeneSetColors={this.editGeneSetColors}
                               view={this.state.view}
                               searchHandler={this.searchHandler}
                               geneOptions={this.state.geneHits}
                               acceptGeneHandler={this.acceptGeneHandler}
                               toggleShowDiffLayer={this.toggleShowDiffLayer}
                               toggleShowDetailLayer={this.toggleShowDetailLayer}
                               toggleShowClusterSort={this.toggleShowClusterSort}
                               showDiffLayer={this.state.showDiffLayer}
                               showDetailLayer={this.state.showDetailLayer}
                               showClusterSort={showClusterSort}
                />

                <div>
                    <Dialog
                        active={this.state.currentLoadState === LOAD_STATE.LOADING}
                        title="Loading"
                        style={{width:400}}
                    >
                        <p>
                            {this.state.selectedCohort[0].name} ...
                            <br/>
                            {this.state.selectedCohort[1].name} ...
                        </p>
                    </Dialog>
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
                                            {this.state.pathways &&
                                            <GeneSetSelector pathways={this.state.pathways}
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
                                            }
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
                                    selectedCohort={this.state.selectedCohort[0]}
                                    geneDataStats={this.state.geneData[0]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[0] : {}}

                                    // maybe state?
                                    pathways={pathways}
                                    highlightedGene={this.state.highlightedGene}
                                    filter={this.state.filter[0]}

                                    // new pathway data
                                    pathwayData={this.state.pathwayData[0]}
                                    pathwaySelection={this.state.pathwaySelection}


                                   // functions
                                    geneHover={this.geneHover}
                                    setCollapsed={this.setCollapsed}
                                    changeCohort={this.changeCohort}
                                    changeSubCohort={this.changeSubCohort}
                                    changeFilter={this.changeFilter}

                                    // state
                                    colorSettings={this.state.geneStateColors}
                                    collapsed={this.state.collapsed}
                                    showDiffLayer={this.state.showDiffLayer}
                                    showDetailLayer={this.state.showDetailLayer}
                                />
                                <XenaGoViewer
                                    // reference
                                    cohortIndex={1}
                                    cohortLabel={LABEL_B}

                                    // view
                                    renderHeight={VIEWER_HEIGHT}
                                    renderOffset={VIEWER_HEIGHT - 3}

                                    // data
                                    selectedCohort={this.state.selectedCohort[1]}
                                    geneDataStats={this.state.geneData[1]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[1] : {}}

                                    // maybe state?
                                    pathways={pathways}
                                    highlightedGene={this.state.highlightedGene}
                                    filter={this.state.filter[1]}

                                    // new pathway data
                                    pathwayData={this.state.pathwayData[1]}
                                    pathwaySelection={this.state.pathwaySelection}

                                    // functions
                                    geneHover={this.geneHover}
                                    setCollapsed={this.setCollapsed}
                                    changeCohort={this.changeCohort}
                                    changeSubCohort={this.changeSubCohort}
                                    changeFilter={this.changeFilter}

                                    // state
                                    colorSettings={this.state.geneStateColors}
                                    collapsed={this.state.collapsed}
                                    showDiffLayer={this.state.showDiffLayer}
                                    showDetailLayer={this.state.showDetailLayer}
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
