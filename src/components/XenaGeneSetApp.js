import React from 'react'
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import {sum} from 'underscore';
import {Avatar, Chip, Button, AppBar, Link, Navigation, BrowseButton} from "react-toolbox";
import {Checkbox, Switch, IconMenu, MenuItem, MenuDivider} from "react-toolbox";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import DefaultPathWays from "../data/tgac";
import PathwayEditor from "./pathwayEditor/PathwayEditor";
import {AppStorageHandler} from "../service/AppStorageHandler";
import NavigationBar from "./NavigationBar";
import {GeneSetSelector} from "./GeneSetSelector";
import {findAssociatedData, findPruneData} from '../functions/DataFunctions';
import FaArrowLeft from 'react-icons/lib/fa/arrow-left';
import FaArrowRight from 'react-icons/lib/fa/arrow-right';
import BaseStyle from '../css/base.css';
import {sumInstances} from '../functions/util';
import {LabelTop} from "./LabelTop";
import VerticalGeneSetScoresView from "./VerticalGeneSetScoresView";

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {sparseDataMatchPartialField, refGene} = xenaQuery;


export const XENA_VIEW = 'xena';
export const PATHWAYS_VIEW = 'pathways';
const VIEWER_HEIGHT = 500;

const VERTICAL_SELECTOR_WIDTH = 220;
const VERTICAL_GENESET_DETAIL_WIDTH = 180;
const VERTICAL_GENESET_SUPPRESS_WIDTH = 20;
const ARROW_WIDTH = 20;

export const FILTER_PERCENTAGE = 0;
export const MIN_FILTER = 2;


export const LABEL_A = 'A';
export const LABEL_B = 'B';

// let mutationKey = 'simple somatic mutation';
// let copyNumberViewKey = 'copy number for pathway view';
//
/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {


    constructor(props) {
        super(props);
        this.state = {
            view: XENA_VIEW,
            // view: PATHWAYS_VIEW,
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: AppStorageHandler.getPathway(),
                    selected: true
                }
            ],
            hoveredPathways: [],
            selectedPathways: [],
            geneData: [{}, {}],
            pathwayData: [{}, {}],
            showPathwayDetails: true,
            geneHits: [],
            selectedGene: undefined,
            reference: refGene['hg38'],
            limit: 25,
            highlightedGene: undefined,
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

    loadSelectedState() {
        let pathways = this.getActiveApp().pathway;
        let apps = AppStorageHandler.getAppData(pathways);
        this.setState({
            apps: apps
        });
    }

    /**
     * Forces the state of the system once everything is loaded based on the existing pathway selection.
     */
    forceState() {
        let refLoaded = this.refs['xena-go-app-0'] && this.refs['xena-go-app-1'];
        if (refLoaded) {
            let selection = AppStorageHandler.getPathwaySelection();
            let newSelect = [selection.pathway];
            this.setState({
                selectedPathways: newSelect
            });
            if (selection.selectedPathways) {
                for (let index = 0; index < this.state.apps.length; index++) {
                    let ref = this.refs['xena-go-app-' + index];
                    ref.setPathwayState(selection.selectedPathways, selection);
                }
            }
            else {
                refLoaded.clickPathway(selection);
            }
        }
    }

    componentDidUpdate() {
        this.forceState();
    }

    componentDidMount() {
        this.loadSelectedState();
    }


    handleUpload = (file) => {
        AppStorageHandler.storePathway(file);
        this.setState({
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: file,
                    selected: true
                }
            ],
        })
    };

    handleReset = () => {
        AppStorageHandler.storePathway(DefaultPathWays);
        this.setState({
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: DefaultPathWays,
                    selected: true
                }
            ],
        })
    };

    addGeneSet = (selectedPathway) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));
        let selectedPathwaySet = allSets.find(f => f.selected === true);

        let newGeneSetObject = {
            goid: '',
            golabel: selectedPathway,
            gene: []
        };
        selectedPathwaySet.pathway.unshift(newGeneSetObject);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
            selectedPathway: selectedPathwaySet,
        });
    };

    addGene = (selectedPathway, selectedGene) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));

        // get geneset to alter
        let selectedPathwaySet = allSets.find(f => f.selected === true);

        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathway.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathway.find(p => selectedPathway.golabel === p.golabel);

        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene.unshift(selectedGene);

        // add to the existing index
        selectedPathwaySet.pathway.splice(pathwayIndex, 0, newSelectedPathway);
        allSets = allSets.filter(f => (!f || f.selected === false));
        allSets.push(selectedPathwaySet);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
        });

        this.refs['pathway-editor'].selectedPathway(newSelectedPathway);
    };

    removeGene = (selectedPathway, selectedGene) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));

        // get geneset to alter
        let selectedPathwaySet = allSets.find(f => f.selected === true);

        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathway.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathway.find(p => selectedPathway.golabel === p.golabel);
        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene = newSelectedPathway.gene.filter(g => g !== selectedGene);

        // add to the existing index

        selectedPathwaySet.pathway.splice(pathwayIndex, 0, newSelectedPathway);
        allSets = allSets.filter(f => (!f || f.selected === false));
        allSets.push(selectedPathwaySet);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
        });

        this.refs['pathway-editor'].selectedPathway(newSelectedPathway);
    };

    removePathway = (selectedPathway) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));
        let selectedPathwaySet = allSets.find(f => f.selected === true);
        allSets = allSets.filter(f => (!f || f.selected === false));
        // removes selected pathway
        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel)
        allSets.push(selectedPathwaySet);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
            selectedPathway: undefined,
        });
    };

    getActiveApp() {
        return this.state.pathwaySets.find(ps => ps.selected);
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


    geneHighlight = (geneName) => {
        this.setState(
            {
                highlightedGene: geneName
            }
        );
    };

    geneHover = (geneHover) => {
        this.setState(
            {
                hoveredPathways: geneHover ? geneHover.pathway : {}
            }
        );
        if (geneHover) {
            let myIndex = geneHover.cohortIndex;
            this.state.apps.forEach((app, index) => {
                if (index !== myIndex) {
                    this.refs['xena-go-app-' + index].setGeneHover(geneHover.pathway);
                }
            });
        }
    };

    pathwaySelect = (pathwaySelection, selectedPathways) => {
        AppStorageHandler.storePathwaySelection(pathwaySelection, selectedPathways);
        let myIndex = pathwaySelection.key;
        pathwaySelection.propagate = false;
        //  TODO: implement empty correlation, for some reason this is necessary for proper select behavior
        if (selectedPathways.length === 0) {
            this.setState({
                selectedPathways: selectedPathways
            });
        }
        this.state.apps.forEach((app, index) => {
            if (index !== myIndex) {
                if (selectedPathways) {
                    this.refs['xena-go-app-' + index].setPathwayState(selectedPathways, pathwaySelection);
                }
                else {
                    this.refs['xena-go-app-' + index].clickPathway(pathwaySelection);
                }
            }
        });
    };

    globalPathwayHover = (pathwayHover) => {
        this.setState({
            hoveredPathways: pathwayHover
        });

        this.state.apps.forEach((app, index) => {
            this.refs['xena-go-app-' + index].setPathwayHover(pathwayHover);
        });
    };

// populates back to the top
    shareGlobalGeneData = (geneData, cohortIndex) => {
        let geneData0 = cohortIndex === 0 ? geneData : this.state.geneData[0];
        let geneData1 = cohortIndex === 1 ? geneData : this.state.geneData[1];

        this.setState({
            geneData: [
                geneData0, geneData1
            ]
        });
    };

    globalPathwaySelect = (pathwaySelection) => {
        let selectedPathways = [pathwaySelection.golabel];
        let pathwayClickData = {
            pathway: pathwaySelection
        };

        let newSelect = [pathwaySelection];
        this.setState({
            selectedPathways: newSelect
        });

        pathwaySelection.propagate = false;
        this.state.apps.forEach((app, index) => {
            if (this.state.selectedPathways) {
                this.refs['xena-go-app-' + index].setPathwayState(selectedPathways, pathwayClickData);
            }
            else {
                this.refs['xena-go-app-' + index].clickPathway(pathwayClickData);
            }
        });
    };

    getSelectedCohort(pathwayData) {
        if (this.state.cohortData) {
            return this.state.cohortData.find(c => c.name === pathwayData.cohort);
        }
    }

    calculateAssociatedData(pathwayData, filter, min, cohortIndex) {
        // console.log('input puathway data',pathwayData)
        let hashAssociation = JSON.parse(JSON.stringify(pathwayData));
        hashAssociation.filter = filter;
        hashAssociation.min = min;
        hashAssociation.cohortIndex = cohortIndex;

        hashAssociation.selectedCohort = this.getSelectedCohort(pathwayData);
        let associatedData = findAssociatedData(hashAssociation);
        let filterMin = Math.trunc(FILTER_PERCENTAGE * hashAssociation.samples.length);

        let hashForPrune = {
            associatedData,
            pathways: hashAssociation.pathways,
            filterMin
        };
        let prunedColumns = findPruneData(hashForPrune);
        prunedColumns.samples = pathwayData.samples;
        // console.log('output data',associatedData)
        return associatedData;
    }

    calculateObserved(pathwayData, filter, min, cohortIndex) {
        return this.calculateAssociatedData(pathwayData, filter, min, cohortIndex).map(pathway => {
            return sumInstances(pathway);
        });
    }

    calculatePathwayScore(pathwayData, filter, min, cohortIndex) {
        return this.calculateAssociatedData(pathwayData, filter, min, cohortIndex).map(pathway => {
            return sum(pathway);
        });
    }


    /**
     * Converts per-sample pathway data to
     * @param pathwayData
     */
    calculateGeneSetExpected(pathwayData, filter) {

        // a list for each sample  [0] = expected_N, vs [1] total_pop_N
        let genomeBackgroundCopyNumber = pathwayData.genomeBackgroundCopyNumber;
        let genomeBackgroundMutation = pathwayData.genomeBackgroundMutation;

        // let's assume they are the same order for now since they were fetched with the same sample data

        // // initiate to 0
        let pathwayExpected = {};

        for (let sampleIndex in pathwayData.samples) {

            // TODO: if filter is all or copy number, or SNV . . etc.
            let copyNumberBackgroundExpected = genomeBackgroundMutation[0][sampleIndex];
            let copyNumberBackgroundTotal = genomeBackgroundMutation[1][sampleIndex];
            let mutationBackgroundExpected = genomeBackgroundCopyNumber[0][sampleIndex];
            let mutationBackgroundTotal = genomeBackgroundCopyNumber[1][sampleIndex];


            // TODO: add the combined filter: https://github.com/jingchunzhu/wrangle/blob/master/xenaGo/mergeExpectedHypergeometric.py#L17
            for (let pathway of pathwayData.pathways) {
                let prob = 1.0;
                let genesInPathway = pathway.gene.length;
                for (let i = 0; i < genesInPathway; i++) {
                    prob = prob * (copyNumberBackgroundTotal - copyNumberBackgroundExpected - i) / (copyNumberBackgroundTotal - i);
                }
                prob = 1 - prob;
                pathwayExpected[pathway.golabel] = (pathwayExpected[pathway.golabel] ? pathwayExpected[pathway.golabel]: 0) + prob;
            }
        }

        // TODO we have an expected for the sample
        return pathwayExpected;
    }

    populateGlobal = (pathwayData, cohortIndex, appliedFilter) => {
        let filter = appliedFilter ? appliedFilter : this.state.apps[cohortIndex].tissueExpressionFilter;

        let observations = this.calculateObserved(pathwayData, filter, MIN_FILTER, cohortIndex);
        let totals = this.calculatePathwayScore(pathwayData, filter, MIN_FILTER, cohortIndex);
        let expected = this.calculateGeneSetExpected(pathwayData, filter);


        // console.log('pathways',pathwayData)
        let maxSamplesAffected = pathwayData.samples.length;
        let pathways = this.getActiveApp().pathway.map((p, index) => {
            if (cohortIndex === 0) {
                p.firstObserved = observations[index];
                p.firstTotal = totals[index];
                p.firstNumSamples = maxSamplesAffected;
                p.firstExpected = expected[p.golabel];
            }
            else {
                p.secondObserved = observations[index];
                p.secondTotal = totals[index];
                p.secondNumSamples = maxSamplesAffected;
                p.secondExpected = expected[p.golabel];
            }
            return p;
        });
        console.log('pathways',pathways)

        let globalPathwayData0 = cohortIndex === 0 ? pathwayData : this.state.pathwayData[0];
        let globalPathwayData1 = cohortIndex === 1 ? pathwayData : this.state.pathwayData[1];

        this.setState(
            {
                pathwayData: [globalPathwayData0, globalPathwayData1],
                selectedPathways: pathways,
            }
        );
        if (appliedFilter) {
            let newApps = JSON.parse(JSON.stringify(this.state.apps));
            newApps[cohortIndex].tissueExpressionFilter = appliedFilter;
            this.setState({apps: newApps});
        }

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
        }
        else if (this.state.view === PATHWAYS_VIEW) {
            this.pathwayEditorGeneHandler(geneName)
        }
    };

    pathwayEditorGeneHandler = (geneName) => {
        this.refs['pathway-editor'].highlightGenes(geneName)
    };

    render() {
        let pathways = this.getActiveApp().pathway;
        const BORDER_OFFSET = 2;

        let leftPadding = this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH - ARROW_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH;

        return (
            <div>

                <NavigationBar showPathways={this.showPathways}
                               showXena={this.showXena}
                               view={this.state.view}
                               searchHandler={this.searchHandler}
                               geneOptions={this.state.geneHits}
                               acceptGeneHandler={this.acceptGeneHandler}
                />

                {this.state.view === XENA_VIEW && this.state.apps &&
                <div>
                    <Grid>
                        <Row>
                            <Col md={this.state.showPathwayDetails ? 5 : 2} style={{marginTop: 15}}>
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
                                                filter={this.state.apps[0].tissueExpressionFilter}
                                                width={VERTICAL_GENESET_DETAIL_WIDTH}
                                                labelHeight={18 + 2 * BORDER_OFFSET}
                                                selectedCohort={this.getSelectedCohort(this.state.pathwayData[0])}
                                                onClick={this.globalPathwaySelect}
                                                onHover={this.globalPathwayHover}
                                                onMouseOut={this.globalPathwayHover}
                                            />
                                            }
                                        </td>
                                        <td width={VERTICAL_SELECTOR_WIDTH - 20}>
                                            <GeneSetSelector pathways={pathways}
                                                             hoveredPathways={this.state.hoveredPathways}
                                                             selectedPathways={this.state.selectedPathways}
                                                             highlightedGene={this.state.highlightedGene}
                                                             onClick={this.globalPathwaySelect}
                                                             onHover={this.globalPathwayHover}
                                                             onMouseOut={this.globalPathwayHover}
                                                             labelHeight={18}
                                                             topOffset={14}
                                                             width={VERTICAL_SELECTOR_WIDTH}/>
                                        </td>
                                        <td width={this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}>
                                            {this.state.showPathwayDetails &&
                                            <VerticalGeneSetScoresView
                                                data={this.state.pathwayData[1]}
                                                cohortIndex={1}
                                                filter={this.state.apps[1].tissueExpressionFilter}
                                                width={200}
                                                labelHeight={18 + 2 * BORDER_OFFSET}
                                                selectedCohort={this.getSelectedCohort(this.state.pathwayData[1])}
                                                onClick={this.globalPathwaySelect}
                                                onHover={this.globalPathwayHover}
                                                onMouseOut={this.globalPathwayHover}
                                            />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                            </Col>
                            <Col md={7}>
                                <XenaGoViewer appData={this.state.apps[0]}
                                              pathwaySelect={this.pathwaySelect}
                                              ref='xena-go-app-0'
                                              renderHeight={VIEWER_HEIGHT}
                                              renderOffset={0}
                                              pathways={pathways}
                                              highlightedGene={this.state.highlightedGene}
                                              geneDataStats={this.state.geneData[0]}
                                              geneHover={this.geneHover}
                                              populateGlobal={this.populateGlobal}
                                              shareGlobalGeneData={this.shareGlobalGeneData}
                                              cohortIndex={0}
                                />
                                <XenaGoViewer appData={this.state.apps[1]}
                                              pathwaySelect={this.pathwaySelect}
                                              ref='xena-go-app-1'
                                              renderHeight={VIEWER_HEIGHT}
                                              renderOffset={VIEWER_HEIGHT}
                                              pathways={pathways}
                                              highlightedGene={this.state.highlightedGene}
                                              geneDataStats={this.state.geneData[1]}
                                              geneHover={this.geneHover}
                                              populateGlobal={this.populateGlobal}
                                              shareGlobalGeneData={this.shareGlobalGeneData}
                                              cohortIndex={1}
                                />
                            </Col>
                        </Row>
                    </Grid>
                </div>
                }
                {this.state.view === PATHWAYS_VIEW &&
                <PathwayEditor ref='pathway-editor' pathwaySets={this.state.pathwaySets}
                               selectedPathway={this.state.selectedPathway}
                               removeGeneHandler={this.removeGene}
                               removePathwayHandler={this.removePathway}
                               addGeneHandler={this.addGene}
                               addGeneSetHandler={this.addGeneSet}
                               uploadHandler={this.handleUpload}
                               resetHandler={this.handleReset}
                />
                }
            </div>);
    }
}
