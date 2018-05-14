import React from 'react'
import PureComponent from './components/PureComponent';
import {CohortSelector} from "./components/CohortSelector";
import PathwayScoresView from "./components/PathwayScoresView";
import PathWays from "../tests/data/tgac";
import ExampleExpression from "../tests/data/bulkExpression";
import ExampleCopyNumber from "../tests/data/bulkCopyNumber";
import ExampleSamples from "../tests/data/samples";
import './base.css';
import HoverPathwayView from "./components/HoverPathwayView"
import HoverGeneView from "./components/HoverGeneView";
import mutationVector from "./data/mutationVector";
import {FilterSelector} from "./components/FilterSelector";

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, datasetFetch, sparseData} = xenaQuery;
import {pick, pluck, flatten} from 'underscore';
import {SortSelector} from "./components/SortSelector";
import {Button} from 'react-toolbox/lib/button';

import {Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";

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


export default class XenaGoApp extends PureComponent {

    constructor(props) {
        super(props);


        this.state = {
            selectedTissueSort: 'Cluster',
            selectedGeneSort: 'Cluster',
            selectedPathways: [],
            sortTypes: ['Cluster', 'Hierarchical', 'Overall'],
            pathwayData: {
                cohort: 'TCGA Ovarian Cancer (OV)',
                copyNumber: ExampleCopyNumber,
                expression: ExampleExpression,
                pathways: PathWays,
                samples: ExampleSamples,
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
        };

    }

    componentDidMount(){
        this.clickPathway(
            {
                pathway: PathWays[21],
                tissue: 'Header'
            }
        );
    }

    clickGenePathway = (pathwayClickData) => {
        let {expression, samples, copyNumber} = this.state.pathwayData;
        let {goid, golabel, gene} = pathwayClickData.pathway;
        let pathways = gene.map(gene => ({goid, golabel, gene: [gene]}));

        console.log('pathway click data')
        console.log(pathwayClickData)
        // let refPathway = this.state.pathwayData.referencePathways ? JSON.parse(JSON.stringify(this.state.pathwayData.referencePathways)) : PathWays;


        this.setState({
            pathwayClickData,
            selectedPathways: [golabel],
            geneData: {
                expression,
                samples,
                pathways,
                referencePathways: PathWays,
                copyNumber,
                selectedPathway: pathwayClickData.pathway
            },
        });
    };

    clickPathway = (pathwayClickData) => {
        let {expression, samples, copyNumber} = this.state.pathwayData;
        let {goid, golabel, gene} = pathwayClickData.pathway;
        let pathways = gene.map(gene => ({goid, golabel, gene: [gene]}));

        console.log('pathway click data')
        console.log(pathwayClickData)
        // let refPathway = this.state.pathwayData.referencePathways ? JSON.parse(JSON.stringify(this.state.pathwayData.referencePathways)) : PathWays;

        this.setState({
            pathwayClickData,
            selectedPathways: [golabel],
            geneData: {
                expression,
                samples,
                pathways,
                referencePathways: PathWays,
                copyNumber,
                selectedPathway: pathwayClickData.pathway
            },
        });
    };


    hoverPathway = (props) => {
        this.setState({pathwayHoverData: props});
    };

    clickGene = (props) => {
        let pathwayLabel = [props.pathway.golabel];
        this.setState({
            geneClickData: props,
            selectedPathways: pathwayLabel,
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
        let geneList = this.getGenesForPathway(PathWays);
        Rx.Observable.zip(datasetSamples(tcgaHub, cohort.mutationDataSetId, null),
            datasetSamples(tcgaHub, gisticDSFromMutation(cohort.mutationDataSetId), null),
            intersection)
            .flatMap((samples) => {
                return Rx.Observable.zip(
                    sparseData(tcgaHub, cohort.mutationDataSetId, samples, geneList),
                    datasetFetch(tcgaHub, gisticDSFromMutation(cohort.mutationDataSetId), samples, geneList),
                    (mutations, copyNumber) => ({mutations, samples, copyNumber}))
            })
            .subscribe(({mutations, samples, copyNumber}) => {
                this.setState({
                    pathwayData: {
                        copyNumber,
                        geneList,
                        expression: mutations,
                        pathways: PathWays,
                        cohort: cohort.name,
                        samples
                    },
                    geneData: {
                        copyNumber: [],
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
        filteredMutationVector['Copy Number'] = 1;
        // console.log('filtered mutation vector');
        // console.log(filteredMutationVector)

        let cohortLoading = this.state.selectedCohort !== this.state.pathwayData.cohort;
        let geneList = this.getGenesForPathway(PathWays);

        // console.log('input pathway data: ');
        // console.log(this.state.pathwayData)

        return (
            <Grid>
                <Row>
                    {this.state.loadState === 'loading' ? 'Loading' : ''}
                    {this.state.loadState === 'loaded' &&
                    <Col md={style.pathway.columns}>
                        <Card style={{width: style.pathway.columnWidth}}>
                            <CohortSelector cohorts={this.state.cohortData}
                                            selectedCohort={this.state.selectedCohort}
                                            onChange={this.selectCohort}/>
                            <SortSelector sortTypes={this.state.sortTypes}
                                          selected={this.state.selectedTissueSort}
                                          onChange={this.sortTissueType}/>
                            <FilterSelector filters={filteredMutationVector}
                                            selected={this.state.tissueExpressionFilter}
                                            pathwayData={this.state.pathwayData}
                                            geneList={geneList}
                                            onChange={this.filterTissueType}/>
                            <HoverPathwayView data={this.state.pathwayHoverData}/>
                        </Card>
                    </Col>
                    }
                    {this.state.loadState === 'loaded' &&
                    <Col md={style.pathway.expressionColumns}>
                        <PathwayScoresView id="pathwayViewId" width={400} height={800}
                                           data={this.state.pathwayData} titleText=""
                                           filter={this.state.tissueExpressionFilter}
                                           filterPercentage={this.state.filterPercentage}
                                           geneList={geneList}
                                           loading={cohortLoading}
                                           min={this.state.minFilter}
                                           selectedSort={this.state.selectedTissueSort}
                                           referencePathways={this.state.pathwayData}
                                           selectedPathways={this.state.selectedPathways}
                                           onClick={this.clickPathway}
                                           onHover={this.hoverPathway}
                                           hideTitle={true}
                        />
                    </Col>
                    }
                    {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col md={style.gene.columns}>
                        <Card style={{width: style.gene.columnWidth}}>
                            <CardTitle
                                title={this.state.selectedCohort}
                                subtitle='Cohort'
                            />

                            <CardMedia>
                                <SortSelector sortTypes={this.state.sortTypes}
                                              selected={this.state.selectedGeneSort}
                                              onChange={this.sortGeneType}/>
                                <FilterSelector filters={filteredMutationVector}
                                                selected={this.state.geneExpressionFilter}
                                                pathwayData={this.state.geneData}
                                                geneList={geneList}
                                                onChange={this.filterGeneType}/>
                                <HoverGeneView data={this.state.geneHoverData}/>
                            </CardMedia>
                        </Card>
                    </Col>
                    }
                    {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col md={style.gene.expressionColumns}>
                        <PathwayScoresView id="geneViewId" height={800}
                                           data={this.state.geneData}
                                           selected={this.state.geneData.selectedPathway}
                                           filter={this.state.geneExpressionFilter}
                                           filterPercentage={this.state.filterPercentage}
                                           geneList={geneList}
                                           loading={cohortLoading}
                                           min={this.state.minFilter}
                                           selectedSort={this.state.selectedGeneSort}
                                           referencePathways={this.state.pathwayData}
                                           selectedPathways={this.state.selectedPathways}
                                           onClick={this.clickGenePathway}
                                           onHover={this.hoverGene}
                                           hideTitle={true}
                        />
                    </Col>
                    }
                </Row>
            </Grid>
        );
    }
}

