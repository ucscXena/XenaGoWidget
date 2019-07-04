import React from 'react'
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import DefaultPathWays from "../data/tgac";
import PathwayEditor from "./pathwayEditor/PathwayEditor";
import {AppStorageHandler} from "../service/AppStorageHandler";
import NavigationBar from "./NavigationBar";
import {GeneSetSelector} from "./GeneSetSelector";
import {addIndepProb, createAssociatedDataKey, findAssociatedData, findPruneData} from '../functions/DataFunctions';
import FaArrowLeft from 'react-icons/lib/fa/arrow-left';
import FaArrowRight from 'react-icons/lib/fa/arrow-right';
import BaseStyle from '../css/base.css';
import {sumInstances, sumTotals} from '../functions/util';
import {LabelTop} from "./LabelTop";
import VerticalGeneSetScoresView from "./VerticalGeneSetScoresView";
import {scoreChiSquaredData, scoreChiSquareTwoByTwo} from "../functions/ColorFunctions";
import {ColorEditor} from "./ColorEditor";
import update from "immutability-helper";
import {Dialog} from "react-toolbox";
let Rx = require('ucsc-xena-client/dist/rx');

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, sparseDataMatchPartialField, refGene, datasetFetch, sparseData} = xenaQuery;
import CrossHairH from "./CrossHairH";
import CrossHairV from "./CrossHairV";
import {getSubCohortsOnlyForCohort} from "../functions/CohortFunctions";

function intersection(a, b) {
    let sa = new Set(a);
    return b.filter(x => sa.has(x));
}


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

export const MIN_GENE_WIDTH_PX = 80;// 8 or less
export const MAX_GENE_WIDTH = 85;
export const MAX_GENE_LAYOUT_WIDTH_PX = 12 * MAX_GENE_WIDTH; // 85 genes

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {


    constructor(props) {
        super(props);
        this.state = {
            view: XENA_VIEW,
            // view: PATHWAYS_VIEW,
            showColorEditor: false,
            showColorByType: false,
            showColorByTypeDetail: true,
            showColorTotal: false,
            showDetailLayer: true,
            showClusterSort: false,
            showDiffLayer: true,
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
                // let {pathway: {golabel}} = selection;
                // ref.setPathwayState([golabel], selection);
                console.log('ref loaded',refLoaded)
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
            selectedPathway: selectedPathwaySet,
            pathwaySets: allSets,
        });
    };

    addGene = (selectedPathway, selectedGene) => {

        // get geneset to alter
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));
        let selectedPathwaySet = allSets.find(f => f.selected === true);

        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathway.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathway.find(p => selectedPathway.golabel === p.golabel);

        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene.unshift(selectedGene);

        // add to the existing index
        selectedPathwaySet.pathway.splice(pathwayIndex, 0, newSelectedPathway);

        // let allSets = this.state.pathwaySets.filter(f => (!f || f.selected === false));
        allSets.push(selectedPathwaySet);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
        });

        this.refs['pathway-editor'].selectedPathway(newSelectedPathway);
    };

    removeGene = (selectedPathway, selectedGene) => {
        // get geneset to alter
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));
        let selectedPathwaySet = allSets.find(f => f.selected === true);
        // let selectedPathwaySet = this.state.pathwaySets.find(f => f.selected === true);

        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathway.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathway.find(p => selectedPathway.golabel === p.golabel);
        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene = newSelectedPathway.gene.filter(g => g !== selectedGene);

        // add to the existing index

        selectedPathwaySet.pathway.splice(pathwayIndex, 0, newSelectedPathway);
        // let allSets = this.state.pathwaySets.filter(f => (!f || f.selected === false));
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
        // let allSets = this.state.pathwaySets.filter(f => (!f || f.selected === false));
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
                } else {
                    this.refs['xena-go-app-' + index].clickPathway(pathwaySelection);
                }
            }
        });
    };

    globalPathwayHover = (pathwayHover) => {
        // console.log('global hovering',pathwayHover)
        this.setState({
            hoveredPathways: pathwayHover
        });

        this.state.apps.forEach((app, index) => {
            if(pathwayHover){
                pathwayHover.samplesAffected = index === 0 ? pathwayHover.firstObserved : pathwayHover.secondObserved;
            }
            this.refs['xena-go-app-' + index].setPathwayHover(pathwayHover);
        });
    };

    /**
     * this nicely forces synchronization as well
     * @param geneData0
     * @param geneData1
     * @returns {*[]}
     */
    calculateDiffs(geneData0, geneData1) {
        if (geneData0 && geneData1 && geneData0.length === geneData1.length) {
            const gene0List = geneData0.map( g => g.gene[0]);
            const gene1Objects = geneData1.sort( (a,b) => {
                const aGene = a.gene[0];
                const bGene = b.gene[0];
                return gene0List.indexOf(aGene)-gene0List.indexOf(bGene);
            });

            for (let geneIndex in geneData0) {
                let chiSquareValue = scoreChiSquareTwoByTwo (
                        geneData0[geneIndex].samplesAffected,
                        geneData0[geneIndex].total - geneData0[geneIndex].samplesAffected,
                        gene1Objects[geneIndex].samplesAffected,
                        gene1Objects[geneIndex].total - gene1Objects[geneIndex].samplesAffected),
                    diffScore = geneData0[geneIndex].samplesAffected / geneData0[geneIndex].total > gene1Objects[geneIndex].samplesAffected / gene1Objects[geneIndex].total ?
                        chiSquareValue : -chiSquareValue;
                diffScore = isNaN(diffScore) ? 0 : diffScore;

                geneData0[geneIndex].diffScore = diffScore;
                gene1Objects[geneIndex].diffScore = diffScore;
            }
            return [geneData0, gene1Objects]
        }
        else{
            return [geneData0, geneData1];
        }
    }

// populates back to the top
    shareGlobalGeneData = (geneData, cohortIndex) => {
        const isChange = (cohortIndex === 0 && geneData.length!==this.state.geneData[0].length) || (cohortIndex === 1 && geneData.length!==this.state.geneData[1].length);

        let geneData0 = cohortIndex === 0 ? geneData : this.state.geneData[0];
        let geneData1 = cohortIndex === 1 ? geneData : this.state.geneData[1];
        let finalGeneData = this.calculateDiffs(geneData0, geneData1);

        if(isChange){
            if(geneData0.length>0){
                this.geneHover({
                    pathway:geneData0[0],
                    cohortIndex
                });
            }
            if(geneData1.length>0){
                this.geneHover({
                    pathway:geneData1[0],
                    cohortIndex
                });
            }
        }
        this.setState({
            geneData: finalGeneData
        });
    };

    globalPathwaySelect = (pathwaySelection) => {

        if (pathwaySelection.gene.length === 0) {
            return;
        }
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
            this.refs['xena-go-app-' + index].setPathwayState(selectedPathways, pathwayClickData);
        });
    };

    getSelectedCohort(pathwayData) {
        if (this.state.cohortData) {
            return this.state.cohortData.find(c => c.name === pathwayData.cohort);
        }
    }

    calculateAssociatedData(pathwayData, filter, min) {
        let hashAssociation = update(pathwayData, {
            filter: {$set: filter},
            min: {$set: min},
            selectedCohort: {$set: this.getSelectedCohort(pathwayData)},
        }
        );
        hashAssociation.filter = filter;
        hashAssociation.min = min;
        hashAssociation.selectedCohort = this.getSelectedCohort(pathwayData);
        let associatedDataKey = createAssociatedDataKey(hashAssociation);
        let associatedData = findAssociatedData(hashAssociation,associatedDataKey);
        let prunedColumns = findPruneData(associatedData,associatedDataKey);
        prunedColumns.samples = pathwayData.samples;
        return associatedData;
    }

    calculateObserved(pathwayData, filter, min) {
        return this.calculateAssociatedData(pathwayData, filter, min).map(pathway => {
            return sumInstances(pathway);
        });
    }

    calculatePathwayScore(pathwayData, filter, min) {
        return this.calculateAssociatedData(pathwayData, filter, min).map(pathway => {
            return sumTotals(pathway);
        });
    }


    calculateExpectedProb(pathway, expected, total) {
        let prob = 1.0;
        let genesInPathway = pathway.gene.length;
        for (let i = 0; i < genesInPathway; i++) {
            prob = prob * (total - expected - i) / (total - i);
        }
        prob = 1 - prob;
        return prob;
    }

    togglePathwayEditor(){
        this.setState({
            view: this.state.view===XENA_VIEW ? PATHWAYS_VIEW : XENA_VIEW
        });
    };


    /**
     * Converts per-sample pathway data to
     * @param pathwayData
     */
    calculateGeneSetExpected(pathwayData, filter) {

        // a list for each sample  [0] = expected_N, vs [1] total_pop_N
        let genomeBackgroundCopyNumber = pathwayData.genomeBackgroundCopyNumber;
        let genomeBackgroundMutation = pathwayData.genomeBackgroundMutation;
        // let's assume they are the same order for now since they were fetched with the same sample data
        filter = filter.indexOf('All') === 0 ? '' : filter;

        // // initiate to 0
        let pathwayExpected = {};
        // init data
        for (let pathway of pathwayData.pathways) {
            pathwayExpected[pathway.golabel] = 0;
        }
        for (let sampleIndex in pathwayData.samples) {

            // TODO: if filter is all or copy number, or SNV . . etc.
            let copyNumberBackgroundExpected = genomeBackgroundCopyNumber[0][sampleIndex];
            let copyNumberBackgroundTotal = genomeBackgroundCopyNumber[1][sampleIndex];
            let mutationBackgroundExpected = genomeBackgroundMutation[0][sampleIndex];
            let mutationBackgroundTotal = genomeBackgroundMutation[1][sampleIndex];


            // TODO: add the combined filter: https://github.com/jingchunzhu/wrangle/blob/master/xenaGo/mergeExpectedHypergeometric.py#L17
            for (let pathway of pathwayData.pathways) {
                let sample_probs = [];

                if (!filter || filter === 'Copy Number') {
                    sample_probs.push(this.calculateExpectedProb(pathway, copyNumberBackgroundExpected, copyNumberBackgroundTotal));
                }
                if (!filter || filter === 'Mutation') {
                    sample_probs.push(this.calculateExpectedProb(pathway, mutationBackgroundExpected, mutationBackgroundTotal));
                }
                let total_prob = addIndepProb(sample_probs);
                pathwayExpected[pathway.golabel] = pathwayExpected[pathway.golabel] + total_prob;
            }
        }

        // TODO we have an expected for the sample
        return pathwayExpected;
    }

    populateGlobal = (pathwayData, cohortIndex, appliedFilter) => {
        let filter = appliedFilter ? appliedFilter : this.state.apps[cohortIndex].tissueExpressionFilter;

        let observations = this.calculateObserved(pathwayData, filter, MIN_FILTER);
        let totals = this.calculatePathwayScore(pathwayData, filter, MIN_FILTER);
        let expected = this.calculateGeneSetExpected(pathwayData, filter);

        let maxSamplesAffected = pathwayData.samples.length;
        let pathways = this.getActiveApp().pathway.map((p, index) => {
            if (cohortIndex === 0) {
                p.firstObserved = observations[index];
                p.firstTotal = totals[index];
                p.firstNumSamples = maxSamplesAffected;
                p.firstExpected = expected[p.golabel];
                p.firstChiSquared = scoreChiSquaredData(p.firstObserved, p.firstExpected, p.firstNumSamples);
            } else {
                p.secondObserved = observations[index];
                p.secondTotal = totals[index];
                p.secondNumSamples = maxSamplesAffected;
                p.secondExpected = expected[p.golabel];
                p.secondChiSquared = scoreChiSquaredData(p.secondObserved, p.secondExpected, p.secondNumSamples);
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

    activateShowColorByType = () => {
        this.setState({
            showColorByType: true,
            showColorByTypeDetail: false,
            showColorTotal: false,
        })
    };

    activateShowColorByTypeDetail = () => {
        this.setState({
            showColorByType: false,
            showColorByTypeDetail: true,
            showColorTotal: false,
        })
    };

    activateShowColorTotal = () => {
        this.setState({
            showColorByType: false,
            showColorByTypeDetail: false,
            showColorTotal: true,
        })
    };

    callDownload = (cohortIndex) => {
        this.refs['xena-go-app-' + cohortIndex].callDownload();
    };

    setCollapsed = (collapsed) => {
        this.setState({
            collapsed: collapsed
        })
    };

    // TODO: move into a service as an async method
    fetchCohorts = (selectedCohortA,selectedCohortB) => {
        if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
        let cohortA = this.state.cohortData.find(c => c.name === selectedCohortA);
        let cohortB = this.state.cohortData.find(c => c.name === selectedCohortB);

        let selectedObjectA = {
            selected: selectedCohortA,
            selectedSubCohorts: getSubCohortsOnlyForCohort(selectedCohortA),
        };
        AppStorageHandler.storeCohortState(selectedObjectA, this.state.key);
        this.setState({
            selectedCohort: selectedCohortA,
            selectedCohortData: cohortA,
            processing: true,
        });
        let geneList = this.getGenesForPathways(this.props.pathways);
        Rx.Observable.zip(datasetSamples(cohortA.host, cohortA.mutationDataSetId, null),
            datasetSamples(cohortA.host, cohortA.copyNumberDataSetId, null),
            intersection)
            .flatMap((samples) => {
                return Rx.Observable.zip(
                    sparseData(cohortA.host, cohortA.mutationDataSetId, samples, geneList),
                    datasetFetch(cohortA.host, cohortA.copyNumberDataSetId, samples, geneList),
                    datasetFetch(cohortA.genomeBackgroundMutation.host, cohortA.genomeBackgroundMutation.dataset, samples, [cohortA.genomeBackgroundMutation.feature_event_K, cohortA.genomeBackgroundMutation.feature_total_pop_N]),
                    datasetFetch(cohortA.genomeBackgroundCopyNumber.host, cohortA.genomeBackgroundCopyNumber.dataset, samples, [cohortA.genomeBackgroundCopyNumber.feature_event_K, cohortA.genomeBackgroundCopyNumber.feature_total_pop_N]),
                    (mutations, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber) => ({
                        mutations,
                        samples,
                        copyNumber,
                        genomeBackgroundMutation,
                        genomeBackgroundCopyNumber
                    }))
            })
            .subscribe(({mutations, samples, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber}) => {
                this.handleCohortData({
                    mutations,
                    samples,
                    copyNumber,
                    genomeBackgroundMutation,
                    genomeBackgroundCopyNumber,
                    geneList,
                    cohort: cohortA
                });
            });
    }


    render() {
        let pathways = this.getActiveApp().pathway;
        const BORDER_OFFSET = 2;

        let leftPadding = this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH - ARROW_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH;

        return (
            <div>

                <NavigationBar showPathways={this.showPathways}
                               showXena={this.showXena}
                               editGeneSetColors={this.editGeneSetColors}
                               view={this.state.view}
                               searchHandler={this.searchHandler}
                               geneOptions={this.state.geneHits}
                               acceptGeneHandler={this.acceptGeneHandler}
                               downloadRawHandler={this.callDownload}
                               toggleShowDiffLayer={this.toggleShowDiffLayer}
                               toggleShowDetailLayer={this.toggleShowDetailLayer}
                               toggleShowClusterSort={this.toggleShowClusterSort}
                               activateShowColorByType={this.activateShowColorByType}
                               activateShowColorByTypeDetail={this.activateShowColorByTypeDetail}
                               activateShowColorTotal={this.activateShowColorTotal}
                               showColorByType={this.state.showColorByType}
                               showColorByTypeDetail={this.state.showColorByTypeDetail}
                               showColorTotal={this.state.showColorTotal}
                               showDiffLayer={this.state.showDiffLayer}
                               showDetailLayer={this.state.showDetailLayer}
                               showClusterSort={this.state.showClusterSort}
                />

                {this.state.apps &&
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
                        title='Edit Colors'
                    >
                        <PathwayEditor ref='pathway-editor' pathwaySets={this.state.pathwaySets}
                                       selectedPathway={this.state.selectedPathway}
                                       removeGeneHandler={this.removeGene}
                                       removePathwayHandler={this.removePathway}
                                       addGeneHandler={this.addGene}
                                       addGeneSetHandler={this.addGeneSet}
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
                                                             width={VERTICAL_SELECTOR_WIDTH}
                                                             geneStateColors={this.state.geneStateColors}
                                            />
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
                            </td>
                            <td valign="top" className="map_wrapper"
                                onMouseMove={ (ev) => {
                                    // const x = ev.clientX - ev.currentTarget.getBoundingClientRect().left + 295;
                                    const x = ev.clientX + 8 ;
                                    const y = ev.clientY + 8;
                                    this.setState({mousing: true, x, y});
                                }}
                                onMouseOut = {() => {
                                    this.setState({mousing: false});
                                }}
                            >
                                <CrossHairH mousing={this.state.mousing} y={this.state.y}/>
                                <CrossHairV mousing={this.state.mousing} x={this.state.x} height={VIEWER_HEIGHT*2}/>
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
                                              colorSettings={this.state.geneStateColors}
                                              setCollapsed={this.setCollapsed}
                                              collapsed={this.state.collapsed}
                                              showColorByType={this.state.showColorByType}
                                              showColorByTypeDetail={this.state.showColorByTypeDetail}
                                              showColorTotal={this.state.showColorTotal}
                                              showDiffLayer={this.state.showDiffLayer}
                                              showDetailLayer={this.state.showDetailLayer}
                                              showClusterSort={this.state.showClusterSort}
                                />
                                <XenaGoViewer appData={this.state.apps[1]}
                                              pathwaySelect={this.pathwaySelect}
                                              ref='xena-go-app-1'
                                              renderHeight={VIEWER_HEIGHT}
                                              renderOffset={VIEWER_HEIGHT - 3}
                                              pathways={pathways}
                                              highlightedGene={this.state.highlightedGene}
                                              geneDataStats={this.state.geneData[1]}
                                              geneHover={this.geneHover}
                                              populateGlobal={this.populateGlobal}
                                              shareGlobalGeneData={this.shareGlobalGeneData}
                                              cohortIndex={1}
                                              colorSettings={this.state.geneStateColors}
                                              setCollapsed={this.setCollapsed}
                                              collapsed={this.state.collapsed}
                                              showColorByType={this.state.showColorByType}
                                              showColorByTypeDetail={this.state.showColorByTypeDetail}
                                              showColorTotal={this.state.showColorTotal}
                                              showDiffLayer={this.state.showDiffLayer}
                                              showDetailLayer={this.state.showDetailLayer}
                                              showClusterSort={this.state.showClusterSort}
                                />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                }
            </div>);
    }
}
