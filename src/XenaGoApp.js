import React from 'react'
import PureComponent from './components/PureComponent';
// import CohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import TissueExpressionView from "./components/PathwayScoresView";
import PathWays from "../tests/data/tgac";
import ExampleExpression from "../tests/data/bulkExpression";
import ExampleSamples from "../tests/data/samples";
// import ExampleStyle from "../demo/src/example.css";
import './base.css';
import HoverPathwayView from "./components/HoverPathwayView"
import HoverGeneView from "./components/HoverGeneView";
// import update from 'immutability-helper';
import mutationVector from "./data/mutationVector";
import {FilterSelector} from "./components/FilterSelector";

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, datasetFetch, sparseData} = xenaQuery;
import {pick, pluck, flatten} from 'underscore';
import {SortSelector} from "./components/SortSelector";
// import {Button} from "react-toolbox/lib/button";
import {Button, IconButton} from 'react-toolbox/lib/button';

import RTButtonTheme from "./RTButtonTheme.css"
import {Card, Layout} from "react-toolbox";
import {Panel} from "react-bootstrap";

let mutationKey = 'simple somatic mutation';
let tcgaHub = 'https://tcga.xenahubs.net';
let Rx = require('ucsc-xena-client/dist/rx');
import {Grid, Row, Col} from 'react-material-responsive-grid';


function lowerCaseCompareName(a, b) {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

// This is horrible. We don't have metadata identifying
// this dataset type, so we locate it by string name.
let gisticDSFromMutation = mutDsID =>
    mutDsID.replace(/[/].*/, '/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes');

function intersection(a, b) {
    var sa = new Set(a);
    return b.filter(x => sa.has(x));
}


export default class XenaGoApp extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            sortPathwayName: null,
            sortPathwayOrder: null,
            sortGeneName: null,
            sortGeneOrder: null,
            // selectedTissueSort: 'Hierarchical',
            // selectedGeneSort: 'Hierarchical',
            selectedTissueSort: 'Cluster',
            selectedGeneSort: 'Cluster',
            sortTypes: ['Cluster', 'Density', 'Hierarchical', 'Overall', 'Per Column'],
            pathwayData: {
                cohort: 'TCGA Ovarian Cancer (OV)',
                expression: ExampleExpression,
                pathways: PathWays,
                samples: ExampleSamples,
            },
            loadState: 'loading',
            selectedCohort: 'TCGA Ovarian Cancer (OV)',
            cohortData: {},
            tissueExpressionFilter: '',
            geneExpressionFilter: '',
            minFilter: 2,
            filterPercentage: 0.005,
            geneData: {
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
            uiControls: {
                pathway: {
                    columns: 2,
                    columnWidth: 200,
                    expressionColumns: 8,
                    expressionWidth: 700,
                },
                gene: {
                    columns: 2,
                    columnWidth: 200,
                    expressionColumns: 8,
                    expressionWidth: 700,
                },
            }

        };

    }

    clickPathway = (pathwayClickData) => {
        let {expression, samples} = this.state.pathwayData;
        let {goid, golabel, gene} = pathwayClickData.pathway;

        let pathways = gene.map(gene => ({goid, golabel, gene: [gene]}));

        let sortPathwayName = this.state.sortPathwayName;
        let sortPathwayOrder = this.state.sortPathwayOrder;
        if (pathwayClickData.tissue === 'Header') {
            if (sortPathwayName === pathwayClickData.pathway.golabel) {
                // switch the order
                sortPathwayOrder = sortPathwayOrder === 'desc' ? 'asc' : 'desc';
            }
            else {
                sortPathwayName = pathwayClickData.pathway.golabel;
                sortPathwayOrder = 'desc';
            }
        }

        this.setState({
            pathwayClickData,
            sortPathwayName: sortPathwayName,
            sortPathwayOrder: sortPathwayOrder,
            sortGeneName: null,
            sortGeneOrder: null,
            geneData: {
                expression,
                samples,
                pathways,
                selectedPathway: pathwayClickData.pathway
            },
            uiControls: {
                pathway: {
                    columns: 1,
                    columnWidth: 100,
                    expressionColumns: 1,
                },
                gene: {
                    columns: 2,
                    columnWidth: 200,
                    expressionColumns: 7,
                    expressionWidth: 800,
                },
            }
        });
    };


    closeGeneView = (props) =>{
        this.setState({
            uiControls: {
                pathway: {
                    columns: 2,
                    columnWidth: 200,
                    expressionColumns: 8,
                    expressionWidth: 700,
                },
                gene: {
                    columns: 2,
                    columnWidth: 200,
                    expressionColumns: 7,
                    expressionWidth: 700,
                },
            },
            geneData: {
                expression: [],
                pathways: [],
                samples: [],
            },
        });
    };

    hoverPathway = (props) => {
        this.setState({pathwayHoverData: props});
    };

    clickGene = (props) => {
        let sortGeneName = this.state.sortGeneName;
        let sortGeneOrder = this.state.sortGeneOrder;
        if (props.tissue === 'Header') {
            let geneValue = props.pathway.gene[0];
            if (sortGeneName === geneValue) {
                // switch the order
                sortGeneOrder = sortGeneOrder === 'desc' ? 'asc' : 'desc';
            }
            else {
                sortGeneName = geneValue;
                sortGeneOrder = 'desc';
            }
        }
        this.setState({
            geneClickData: props,
            sortGeneName: sortGeneName,
            sortGeneOrder: sortGeneOrder,
            sortPathwayName: this.state.sortPathwayName,
            sortPathwayOrder: this.state.sortPathwayOrder,
        });
    };

    hoverGene = (props) => {
        this.setState({geneHoverData: props});
    };

    filterTissueType = (filter) => {
        this.setState({tissueExpressionFilter: filter});
    };

    sortTissueType = (sortString) => {
        this.setState({selectedTissueSort: sortString});
    };

    sortGeneType = (sortString) => {
        this.setState({selectedGeneSort: sortString});
    };

    filterGeneType = (filter) => {
        this.setState({geneExpressionFilter: filter});
    };

    componentWillMount() {
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
                    // alert(JSON.stringify(data));
                    let cohortData = Object.keys(data)
                        .filter(cohort => cohort.indexOf('TCGA') === 0 && data[cohort][mutationKey])
                        .map(cohort => ({name: cohort, mutationDataSetId: data[cohort][mutationKey].dataset}))
                        .sort(lowerCaseCompareName);
                    this.setState({
                        loadState: 'loaded',
                        cohortData
                    });
                    return data;
                });
            })
            .catch(() => {
                this.setState({
                    loadState: 'error'
                });
            });

    }

    selectCohort = (selected) => {
        this.setState({selectedCohort: selected});
        let cohort = this.state.cohortData.find(c => c.name === selected);
        Rx.Observable.zip(datasetSamples(tcgaHub, cohort.mutationDataSetId, null),
            datasetSamples(tcgaHub, gisticDSFromMutation(cohort.mutationDataSetId), null),
            intersection)
            .flatMap((samples) => {
                let geneList = this.getGenesForPathway(PathWays);
                return Rx.Observable.zip(
                    sparseData(tcgaHub, cohort.mutationDataSetId, samples, geneList),
                    datasetFetch(tcgaHub, gisticDSFromMutation(cohort.mutationDataSetId), samples, geneList),
                    (mutations, copyNumber) => ({mutations, samples, copyNumber}))
            })
            .subscribe(({mutations, samples, copyNumber}) => {
                this.setState({
                    pathwayData: {
                        copyNumber,
                        expression: mutations,
                        pathways: PathWays,
                        cohort: cohort.name,
                        samples
                    },
                    geneData: {
                        expression: [],
                        pathways: [],
                        samples: [],
                    },
                })
            });
    };

    getGenesForPathway(pathways) {
        return Array.from(new Set(flatten(pluck(pathways, 'gene'))));
    };

    render() {

        const alignTop = {
            marginLeft: '40px',
            paddingLeft: '40px',
            verticalAlign: 'top',
            width: '100px'
        };

        const geneAlignment = {
            paddingTop: '100px',
            marginTop: '100px',
            marginLeft: '40px',
            paddingLeft: '40px',
            verticalAlign: 'top',
            width: '100px'
        };

        let filteredMutationVector = pick(mutationVector,
            v => v >= this.state.minFilter);

        let cohortLoading = this.state.selectedCohort !== this.state.pathwayData.cohort;

        return (
            <Grid>
                <Row>
                    {this.state.loadState === 'loading' ? 'Loading' : ''}
                    {this.state.loadState === 'loaded' &&
                    <Col md={this.state.uiControls.pathway.columns}>
                        <Card style={{width: this.state.uiControls.pathway.columnWidth}}>
                            <CohortSelector cohorts={this.state.cohortData}
                                            selectedCohort={this.state.selectedCohort}
                                            onChange={this.selectCohort}/>
                            <SortSelector sortTypes={this.state.sortTypes}
                                          selected={this.state.selectedTissueSort}
                                          onChange={this.sortTissueType}/>
                            <FilterSelector filters={filteredMutationVector}
                                            selected={this.state.tissueExpressionFilter}
                                            pathwayData={this.state.pathwayData}
                                            onChange={this.filterTissueType}/>
                            <HoverPathwayView data={this.state.pathwayHoverData}/>
                        </Card>
                    </Col>
                    }
                    {this.state.loadState === 'loaded' &&
                    <Col md={this.state.uiControls.pathway.expressionColumns}>
                        <Card style={{width: this.state.uiControls.pathway.expressionWidth}}>
                        <TissueExpressionView id="pathwayViewId" width={400} height={800}
                                              data={this.state.pathwayData} titleText=""
                                              filter={this.state.tissueExpressionFilter}
                                              filterPercentage={this.state.filterPercentage}
                                              loading={cohortLoading}
                                              min={this.state.minFilter}
                                              sortColumn={this.state.sortPathwayName}
                                              sortOrder={this.state.sortPathwayOrder}
                                              selectedSort={this.state.selectedTissueSort}
                                              onClick={this.clickPathway} onHover={this.hoverPathway}/>
                        </Card>
                    </Col>
                    }
                    {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col md={1}>
                        <Button label='Close' raised primary onClick={this.closeGeneView}/>
                    </Col>
                    }
                    {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col md={this.state.uiControls.gene.columns}>
                        <Card style={{width: this.state.uiControls.gene.columnWidth}}>
                            <SortSelector sortTypes={this.state.sortTypes}
                                          selected={this.state.selectedGeneSort}
                                          onChange={this.sortGeneType}/>
                            <FilterSelector filters={filteredMutationVector}
                                            selected={this.state.geneExpressionFilter}
                                            pathwayData={this.state.geneData}
                                            onChange={this.filterGeneType}/>
                            <HoverGeneView data={this.state.geneHoverData}/>
                        </Card>
                    </Col>
                    }
                    {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col md={this.state.uiControls.gene.expressionColumns}>
                        <Card style={{width: this.state.uiControls.gene.expressionWidth}}>
                        <TissueExpressionView id="geneViewId" height={800}
                                              data={this.state.geneData}
                                              selected={this.state.geneData.selectedPathway}
                                              filter={this.state.geneExpressionFilter}
                                              filterPercentage={this.state.filterPercentage}
                                              loading={cohortLoading}
                                              min={this.state.minFilter}
                                              sortColumn={this.state.sortGeneName}
                                              sortOrder={this.state.sortGeneOrder}
                                              selectedSort={this.state.selectedGeneSort}
                                              onClick={this.clickGene}
                                              onHover={this.hoverGene}/>
                        </Card>
                    </Col>
                    }
                </Row>
            </Grid>
        );
    }
}

