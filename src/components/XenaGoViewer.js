import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from "./CohortSelector";
import PathwayScoresView from "./PathwayScoresView";
import '../css/base.css';
import HoverGeneView from "./HoverGeneView";
import mutationVector from "../data/mutationVector";
import {FilterSelector} from "./FilterSelector";

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, datasetFetch, sparseData} = xenaQuery;
import {pick, pluck, flatten, sum} from 'underscore';
import {Card, Chip, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";

let mutationKey = 'simple somatic mutation';
let copyNumberViewKey = 'copy number for pathway view';
let genomeBackgroundViewKey = 'genome background';
let genomeBackgroundCopyNumberViewKey = 'copy number';
let genomeBackgroundMutationViewKey = 'mutation';
let Rx = require('ucsc-xena-client/dist/rx');
import {Grid, Row, Col} from 'react-material-responsive-grid';
import Dialog from 'react-toolbox/lib/dialog';
import {AppStorageHandler} from "../service/AppStorageHandler";
import {LABEL_A, LABEL_B, MAX_GENE_WIDTH, MIN_FILTER} from "./XenaGeneSetApp";
import Button from "react-toolbox/lib/button";
import FaDownload from 'react-icons/lib/fa/download';
import defaultDatasetForGeneset from "../data/defaultDatasetForGeneset";


function lowerCaseCompareName(a, b) {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

function intersection(a, b) {
    let sa = new Set(a);
    return b.filter(x => sa.has(x));
}

const style = {
    pathway: {
        columns: 2,
        columnWidth: 200,
        expressionColumns: 4,
        expressionWidth: 400,
    },
    gene: {
        columns: 2,
        columnWidth: 200,
        expressionColumns: 4,
        expressionWidth: 400,
    },
};


export default class XenaGoViewer extends PureComponent {

    constructor(props) {
        super(props);
        this.state = this.props.appData;
        this.state.processing = true;
        this.state.loadState = 'Loading';
        this.state.hoveredPathways = [];

        let cohortIndex = this.state.key;
        let filterString = AppStorageHandler.getFilterState(cohortIndex);
        let cohort = AppStorageHandler.getCohortState(cohortIndex);

        if (filterString) {
            this.state.tissueExpressionFilter = filterString;
        }

        if (cohort && cohort.selected) {
            this.state.selectedCohort = cohort.selected;
        }
    }


    setPathwayState(newSelection, pathwayClickData) {
        let {expression, samples, copyNumber} = this.state.pathwayData;
        let {pathway: {goid, golabel}} = pathwayClickData;

        let geneList = this.getGenesForNamedPathways(newSelection, this.props.pathways);
        let pathways = geneList.map(gene => ({goid, golabel, gene: [gene]}));


        this.setState({
            pathwayClickData,
            selectedPathways: newSelection,
            geneData: {
                expression,
                samples,
                pathways,
                copyNumber,
                selectedPathway: pathwayClickData.pathway
            },
        });
        pathwayClickData.key = this.props.appData.key;
        pathwayClickData.propagate = pathwayClickData.propagate == null ? true : pathwayClickData.propagate;
        if (pathwayClickData.propagate) {
            // NOTE: you have to run the synchronization handler to synchronize the genes before the pathway selection
            this.props.pathwaySelect(pathwayClickData, newSelection);
        }
    }

    clickPathway = (pathwayClickData) => {
        let {pathway: {golabel}} = pathwayClickData;
        this.setPathwayState([golabel], pathwayClickData);
    };

    setGeneHover = (geneHover) => {
        let newHover = (geneHover && geneHover.gene) ? geneHover.gene : [];
        let genePathwayHover = this.state.geneData.pathways.find(f => f.gene[0] === newHover[0]);

        let expression = this.props.geneDataStats && Array.isArray(this.props.geneDataStats) ? this.props.geneDataStats.find(g => g.gene[0] === newHover[0]) : {};

        let hoverData = {
            cohortIndex: this.state.key,
            tissue: "Header",
            expression: expression,
            pathway: genePathwayHover,
        };
        this.setState(
            {
                hoveredPathways: newHover,
                geneHoverData: hoverData,
            }
        );
    };

    setPathwayHover = (pathwayHover) => {
        let newHover = (pathwayHover && pathwayHover.gene) ? pathwayHover.gene : [];

        if (pathwayHover) {
            // get the pathway
            let expression = {};
            if (this.props.cohortIndex === 0) {
                expression.affected = pathwayHover.firstObserved;
                expression.allGeneAffected = pathwayHover.firstTotal;
                expression.total = pathwayHover.firstNumSamples;
            }
            else {
                expression.affected = pathwayHover.secondObserved;
                expression.allGeneAffected = pathwayHover.secondTotal;
                expression.total = pathwayHover.secondNumSamples;
            }
            let hoverData = {
                tissue: "Header",
                expression: expression,
                pathway: pathwayHover,
            };
            this.setState(
                {
                    hoveredPathways: newHover,
                    geneHoverData: hoverData,
                }
            );
        }
    };

    hoverGene = (geneHoverProps) => {
        if (geneHoverProps) {
            geneHoverProps.cohortIndex = this.props.cohortIndex;
        }
        this.props.geneHover(geneHoverProps);


        let genesHovered;
        if (geneHoverProps == null) {
            geneHoverProps = {};
            genesHovered = [];
        }
        else {
            genesHovered = geneHoverProps.pathway ? geneHoverProps.pathway.gene : [];
        }

        this.setState(
            {
                geneHoverData: geneHoverProps,
                hoveredPathways: genesHovered
            }
        );
    };

    filterGeneType = (filter) => {
        this.setState({tissueExpressionFilter: filter});
        this.props.populateGlobal(this.state.pathwayData, this.state.key, filter);
        AppStorageHandler.storeFilterState(filter, this.state.key)
    };

    loadCohortData() {
        if (this.state.pathwayData.pathways.length > 0 && (this.state.geneData && this.state.geneData.expression.length === 0)) {
            let selectedCohort2 = AppStorageHandler.getCohortState(this.state.key);
            this.selectCohort(selectedCohort2.selected ? selectedCohort2.selected : selectedCohort2);
        }
        else {
            return;
        }
        let data = defaultDatasetForGeneset;
        let cohortData = Object.keys(data)
            .filter(cohort => {
                return (data[cohort].viewInPathway) && data[cohort][mutationKey]
            })
            .map(cohort => {
                let mutation = data[cohort][mutationKey];
                let copyNumberView = data[cohort][copyNumberViewKey];
                let genomeBackground = data[cohort][genomeBackgroundViewKey];
                return {
                    name: cohort,
                    mutationDataSetId: mutation.dataset,
                    copyNumberDataSetId: copyNumberView.dataset,
                    genomeBackgroundCopyNumber: genomeBackground[genomeBackgroundCopyNumberViewKey],
                    genomeBackgroundMutation: genomeBackground[genomeBackgroundMutationViewKey],
                    amplificationThreshold: copyNumberView.amplificationThreshold,
                    deletionThreshold: copyNumberView.deletionThreshold,
                    host: mutation.host
                }
            })
            .sort(lowerCaseCompareName);
        this.setState({
            loadState: 'loaded',
            cohortData
        });

    }

    componentDidUpdate() {
        // TODO: this should come out of something else, as its not particularly performant to do it here
        this.loadCohortData()
    }

    selectCohort = (selected) => {
        if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
        let cohort = this.state.cohortData.find(c => c.name === selected);
        AppStorageHandler.storeCohortState(selected, this.state.key);
        this.setState({
            selectedCohort: selected,
            selectedCohortData: cohort,
            processing: true,
        });
        let geneList = this.getGenesForPathways(this.props.pathways);
        Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
            datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
            intersection)
            .flatMap((samples) => {
                return Rx.Observable.zip(
                    sparseData(cohort.host, cohort.mutationDataSetId, samples, geneList),
                    datasetFetch(cohort.host, cohort.copyNumberDataSetId, samples, geneList),
                    datasetFetch(cohort.genomeBackgroundMutation.host, cohort.genomeBackgroundMutation.dataset, samples, [cohort.genomeBackgroundMutation.feature_event_K, cohort.genomeBackgroundMutation.feature_total_pop_N]),
                    datasetFetch(cohort.genomeBackgroundCopyNumber.host, cohort.genomeBackgroundCopyNumber.dataset, samples, [cohort.genomeBackgroundCopyNumber.feature_event_K, cohort.genomeBackgroundCopyNumber.feature_total_pop_N]),
                    (mutations, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber) => ({
                        mutations,
                        samples,
                        copyNumber,
                        genomeBackgroundMutation,
                        genomeBackgroundCopyNumber
                    }))
            })
            .subscribe(({mutations, samples, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber}) => {
                let pathwayData = {
                    copyNumber,
                    geneList,
                    expression: mutations,
                    pathways: this.props.pathways,
                    cohort: cohort.name,
                    samples,
                    genomeBackgroundMutation,
                    genomeBackgroundCopyNumber,
                };
                this.setState({
                    pathwayData: pathwayData,
                    processing: false,
                });
                this.props.populateGlobal(pathwayData, this.props.cohortIndex);
                if (this.state.selectedPathways.length > 0) {
                    this.setPathwayState(this.state.selectedPathways, this.state.pathwayClickData)
                }
                else {
                    this.setState({
                        geneData: {
                            copyNumber: [],
                            expression: [],
                            pathways: [],
                            samples: [],
                        },
                    });
                }
            });
    };


    getGenesForNamedPathways(selectedPathways, pathways) {
        let filteredPathways = pathways.filter(f => selectedPathways.indexOf(f.golabel) >= 0)
        return Array.from(new Set(flatten(pluck(filteredPathways, 'gene'))));
    };

    getGenesForPathways(pathways) {
        return Array.from(new Set(flatten(pluck(pathways, 'gene'))));
    };

    callDownload = () => {
        this.refs['pathwayscoreview'].downloadData();
    };


    render() {

        let filteredMutationVector = pick(mutationVector,
            v => v >= this.state.minFilter);
        filteredMutationVector['Copy Number'] = 1;

        let cohortLoading = this.state.selectedCohort !== this.state.pathwayData.cohort;
        let geneList = this.getGenesForPathways(this.props.pathways);

        let {renderHeight, renderOffset, cohortIndex, shadingValue} = this.props;

        if (this.state.loadState === 'loaded') {
            if (this.state.selectedPathways.length > 0) {
                return (
                    <Grid>
                        <Row>
                            {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                            <Col md={3}>
                                <Card style={{height: 300, width: style.gene.columnWidth, marginTop: 5}}>
                                    <CohortSelector cohorts={this.state.cohortData}
                                                    selectedCohort={this.state.selectedCohort}
                                                    onChange={this.selectCohort}
                                                    cohortLabel={this.getCohortLabel(cohortIndex)}
                                    />
                                    <FilterSelector filters={filteredMutationVector}
                                                    selected={this.state.tissueExpressionFilter}
                                                    pathwayData={this.state.geneData}
                                                    geneList={geneList}
                                                    amplificationThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.amplificationThreshold : 2}
                                                    deletionThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.deletionThreshold : -2}
                                                    onChange={this.filterGeneType}
                                    />
                                    <HoverGeneView data={this.state.geneHoverData} cohortIndex={cohortIndex}/>
                                    <Dialog active={this.state.processing} title='Loading'>
                                        {this.state.selectedCohort}
                                    </Dialog>
                                </Card>
                                {this.state.geneData.pathways.length > MAX_GENE_WIDTH &&
                                <Card style={{height: 30, width: style.gene.columnWidth, marginTop: 5}}>
                                    {this.props.collapsed &&
                                    <Button icon='chevron_right' flat primary
                                            onClick={() => this.props.setCollapsed(false)}>Expand</Button>
                                    }
                                    {!this.props.collapsed &&
                                    <Button icon='chevron_left'
                                            onClick={() => this.props.setCollapsed(true)}>Collapse</Button>
                                    }
                                </Card>
                                }
                            </Col>
                            }
                            {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                            <Col md={9}>
                                <PathwayScoresView height={renderHeight}
                                                   offset={renderOffset}
                                                   ref='pathwayscoreview'
                                                   data={this.state.geneData}
                                                   selected={this.state.geneData.selectedPathway}
                                                   filter={this.state.tissueExpressionFilter}
                                                   filterPercentage={this.state.filterPercentage}
                                                   geneList={geneList}
                                                   loading={cohortLoading}
                                                   min={MIN_FILTER}
                                                   selectedCohort={this.state.selectedCohortData}
                                                   selectedPathways={this.state.selectedPathways}
                                                   hoveredPathways={this.state.hoveredPathways}
                                                   onClick={this.clickPathway}
                                                   onHover={this.hoverGene}
                                                   cohortIndex={this.state.key}
                                                   key={this.state.key}
                                                   shareGlobalGeneData={this.props.shareGlobalGeneData}
                                                   shadingValue={shadingValue}
                                                   collapsed={this.props.collapsed}
                                />
                            </Col>
                            }
                        </Row>
                    </Grid>
                )
            }
        }

        return (
            <Dialog active={this.state.processing} title='Loading'>
                {this.state.selectedCohort}
            </Dialog>
        );
    }

    getCohortLabel(cohortIndex) {
        return cohortIndex === 0 ? LABEL_A : LABEL_B;
    }
}

XenaGoViewer.propTypes = {
    appData: PropTypes.any.isRequired,
    renderHeight: PropTypes.any.isRequired,
    renderOffset: PropTypes.any.isRequired,
    pathwaySelect: PropTypes.any.isRequired,
    pathways: PropTypes.any.isRequired,
    geneHover: PropTypes.any.isRequired,
    populateGlobal: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    shareGlobalGeneData: PropTypes.any.isRequired,
    geneDataStats: PropTypes.any.isRequired,
    setCollapsed: PropTypes.any,
    collapsed: PropTypes.any,
};
