import React from 'react'
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import {sum} from 'underscore';
import {Avatar, Chip, Button, AppBar, Link, Navigation, BrowseButton} from "react-toolbox";
import {Checkbox, Switch, IconMenu, MenuItem, MenuDivider} from "react-toolbox";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import DefaultPathWays from "../data/tgac";
import PathwayEditor from "./pathwayEditor/PathwayEditor";
import {AppStorageHandler} from "./AppStorageHandler";
import NavigationBar from "./NavigationBar";
import {GeneSetSvgSelector} from "./GeneSetSvgSelector";
import {findAssociatedData, findPruneData} from '../functions/DataFunctions';
import FaArrowLeft from 'react-icons/lib/fa/arrow-left';
import FaArrowRight from 'react-icons/lib/fa/arrow-right';
import BaseStyle from '../../src/base.css';
import {sumInstances} from '../functions/util';
import {LabelTop} from "./LabelTop";
import VerticalPathwaySetScoresView from "./VerticalPathwaySetScoresView";


const EXPAND_HEIGHT = 800;
const COMPACT_HEIGHT = 500;
const COMPACT_VIEW_DEFAULT = false;
// export const FILTER_PERCENTAGE = 0.005;
export const FILTER_PERCENTAGE = 0;
export const MIN_FILTER = 2 ;


export const LABEL_A = 'A';
export const LABEL_B = 'B';

let mutationKey = 'simple somatic mutation';
let copyNumberViewKey = 'copy number for pathway view';

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {


    constructor(props) {
        super(props);
        let renderHeight = COMPACT_VIEW_DEFAULT ? COMPACT_HEIGHT : EXPAND_HEIGHT;
        this.state = {
            view: 'xena',
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: AppStorageHandler.getPathway(),
                    selected: true
                }
            ],
            compactView: COMPACT_VIEW_DEFAULT,
            renderHeight: renderHeight,
            hoveredPathways: [],
            selectedPathways: [],
            geneData: [{}, {}],
            pathwayData: [{}, {}],
            showPathwayDetails: true,
        };
    }

    loadSelectedState() {
        let pathways = this.getActiveApp().pathway;
        let apps = AppStorageHandler.getAppData(pathways, this.state.renderHeight);
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
        this.loadCohorts();
    }

    componentDidMount() {
        this.loadSelectedState();
        this.makeCompact(true);
    }

    loadCohorts() {
        let cohortPreferredURL = "https://raw.githubusercontent.com/ucscXena/cohortMetaData/master/defaultDataset.json";
        fetch(cohortPreferredURL)
            .then(function (response) {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response;
            })
            .then((response) => {
                response.json().then(data => {
                    let cohortData = Object.keys(data)
                        .filter(cohort => {
                            return (data[cohort].viewInPathway) && data[cohort][mutationKey]
                        })
                        .map(cohort => {
                            let mutation = data[cohort][mutationKey];
                            let copyNumberView = data[cohort][copyNumberViewKey];
                            return {
                                name: cohort,
                                mutationDataSetId: mutation.dataset,
                                copyNumberDataSetId: copyNumberView.dataset,
                                amplificationThreshold: copyNumberView.amplificationThreshold,
                                deletionThreshold: copyNumberView.deletionThreshold,
                                host: mutation.host
                            }
                        });
                    this.setState({
                        cohortData: cohortData
                    });
                    // return data;
                });
            })
            .catch(() => {
                this.setState({
                    loadState: 'error'
                });
            });
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
            view: 'pathways'
        })
    };

    showXena = () => {
        this.setState({
            view: 'xena'
        })
    };


    makeCompact = (value) => {
        this.setState({
            compactView: value,
            renderHeight: value ? COMPACT_HEIGHT : EXPAND_HEIGHT,
        })
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
        console.log('hovering a glo bal path ', pathwayHover);
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

    getSelectedCohort(pathwayData){
        if(this.state.cohortData){
            return this.state.cohortData.find(c => c.name === pathwayData.cohort);
        }
    }

    calculatePathwayDensity(pathwayData, filter, min, cohortIndex) {
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

        return associatedData.map(pathway => {
            return sumInstances(pathway);
        });
    }

    calculatePathwayScore(pathwayData, filter, min, cohortIndex) {
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

        return associatedData.map(pathway => {
            return sum(pathway);
        });
    }

    populateGlobal = (pathwayData, cohortIndex) => {
        let filter = this.state.apps[cohortIndex].tissueExpressionFilter;

        let densities = this.calculatePathwayDensity(pathwayData, filter, 0, cohortIndex);
        let totals = this.calculatePathwayScore(pathwayData, filter, 0, cohortIndex);
        let maxSamplesAffected = pathwayData.samples.length;
        let pathways = this.getActiveApp().pathway.map((p, index) => {
            if (cohortIndex === 0) {
                p.firstDensity = densities[index];
                p.firstTotal = totals[index];
                p.firstNumSamples = maxSamplesAffected;
            }
            else {
                p.secondDensity = densities[index];
                p.secondTotal = totals[index];
                p.secondNumSamples = maxSamplesAffected;
            }
            return p;
        });

        let globalPathwayData0 = cohortIndex === 0 ? pathwayData : this.state.pathwayData[0];
        let globalPathwayData1 = cohortIndex === 1 ? pathwayData : this.state.pathwayData[1];

        this.setState(
            {
                pathwayData: [globalPathwayData0, globalPathwayData1],
                selectedPathways: pathways,
            }
        )
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

    render() {
        let pathways = this.getActiveApp().pathway;
        let localPathways = AppStorageHandler.getPathway();
        const BORDER_OFFSET = 2;

        let leftPadding = this.state.showPathwayDetails ? 180 : 20;

        return (
            <div>

                <NavigationBar pathways={localPathways}
                               makeCompact={this.makeCompact}
                               showPathways={this.showPathways}
                               showXena={this.showXena}
                               compactView={this.state.compactView}
                               view={this.state.view}
                />

                {this.state.view === 'xena' && this.state.apps &&
                <div>
                    <Grid>
                        <Row>
                            <Col md={this.state.showPathwayDetails ? 4 : 2} style={{marginTop: 15}}>
                                <table>
                                    <tbody>
                                    <tr>
                                        <td width={this.state.showPathwayDetails ? 200 : 20} style={{paddingLeft:leftPadding}}>
                                            {this.state.showPathwayDetails &&
                                            <FaArrowRight onClick={this.hideGeneSetDetail} className={BaseStyle.mouseHover}/>
                                            }
                                            {!this.state.showPathwayDetails &&
                                            <FaArrowLeft onClick={this.showGeneSetDetail}  className={BaseStyle.mouseHover}/>
                                            }
                                        </td>
                                        <td>
                                            <LabelTop width={180}/>
                                        </td>
                                        <td width={this.state.showPathwayDetails ? 200 : 20}>
                                            {this.state.showPathwayDetails &&
                                            <FaArrowLeft onClick={this.hideGeneSetDetail} className={BaseStyle.mouseHover}/>
                                            }
                                            {!this.state.showPathwayDetails &&
                                            <FaArrowRight onClick={this.showGeneSetDetail}  className={BaseStyle.mouseHover}/>
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width={this.state.showPathwayDetails ? 200 : 20}>
                                            {this.state.showPathwayDetails &&
                                            <VerticalPathwaySetScoresView
                                                data={this.state.pathwayData[0]}
                                                cohortIndex={0}
                                                width={200}
                                                labelHeight={18 + 2 * BORDER_OFFSET}
                                                selectedCohort = {this.getSelectedCohort(this.state.pathwayData[0])}
                                                onClickMethod={this.globalPathwaySelect}
                                                onHover={this.globalPathwayHover}
                                                onMouseOut={this.globalPathwayHover}
                                            />
                                            }
                                        </td>
                                        <td>
                                            <GeneSetSvgSelector pathways={pathways}
                                                                hoveredPathways={this.state.hoveredPathways}
                                                                selectedPathways={this.state.selectedPathways}
                                                                // onClick={this.globalPathwaySelect}
                                                                onHover={this.globalPathwayHover}
                                                                onMouseOut={this.globalPathwayHover}
                                                                labelHeight={18}
                                                                topOffset={14}
                                                                width={200}/>
                                        </td>
                                        <td width={this.state.showPathwayDetails ? 200 : 20}>
                                            {this.state.showPathwayDetails &&
                                            <VerticalPathwaySetScoresView
                                                data={this.state.pathwayData[1]}
                                                cohortIndex={1}
                                                width={200}
                                                labelHeight={18 + 2 * BORDER_OFFSET}
                                                selectedCohort = {this.getSelectedCohort(this.state.pathwayData[1])}
                                                onHover={this.globalPathwayHover}
                                                onMouseOut={this.globalPathwayHover}
                                            />
                                            }
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                            </Col>
                            <Col md={8}>
                                <XenaGoViewer appData={this.state.apps[0]}
                                              pathwaySelect={this.pathwaySelect}
                                              ref='xena-go-app-0'
                                              renderHeight={this.state.renderHeight}
                                              renderOffset={0}
                                              pathways={pathways}
                                              hoveredPathways={this.state.hoveredPathways}
                                              selectedPathways={this.state.selectedPathways}
                                              geneDataStats={this.state.geneData[0]}
                                              geneHover={this.geneHover}
                                              populateGlobal={this.populateGlobal}
                                              shareGlobalGeneData={this.shareGlobalGeneData}
                                              cohortIndex={0}
                                />
                                <XenaGoViewer appData={this.state.apps[1]}
                                              pathwaySelect={this.pathwaySelect}
                                              ref='xena-go-app-1'
                                              renderHeight={this.state.renderHeight}
                                              renderOffset={(this.state.renderHeight)}
                                              pathways={pathways}
                                              hoveredPathways={this.state.hoveredPathways}
                                              selectedPathways={this.state.selectedPathways}
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
                {this.state.view === 'pathways' &&
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
