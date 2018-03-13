import React from 'react'
import PureComponent from './components/PureComponent';
// import CohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import TissueExpressionView from "./components/PathwayScoresView";
import ExamplePathWays from "../tests/data/tgac";
import ExampleExpression from "../tests/data/bulkExpression";
import ExampleSamples from "../tests/data/samples";
// import ExampleStyle from "../demo/src/example.css";
import HoverPathwayView from "./components/HoverPathwayView"
import HoverGeneView from "./components/HoverGeneView";
// import update from 'immutability-helper';
import mutationVector from "./data/mutationVector";
import {FilterSelector} from "./components/FilterSelector";
// import {allCohorts, cohortSamples, fetchCohortPreferred, sparseData} from 'ucsc-xena-client';
var xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
var {allCohorts, cohortSamples, fetchCohortPreferred, sparseData} = xenaQuery;
// var Rx = require('ucsc-xena-client/dist/rx');

var mutationKey = 'simple somatic mutation';

function lowerCaseCompareName(a, b) {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

export default class XenaGoApp extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            pathwayData: {
                expression: ExampleExpression,
                pathways: ExamplePathWays,
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

        };

    }

    clickPathway = (pathwayClickData) => {
        let {expression, samples} = this.state.pathwayData;
        let {goid, golabel, gene} = pathwayClickData.pathway;

        let pathways = gene.map(gene => ({goid, golabel, gene: [gene]}));

        this.setState({
            pathwayClickData,
            geneData: {
                expression,
                samples,
                pathways,
                selectedPathway: pathwayClickData.pathway
            }
        });
    };

    hoverPathway = (props) => {
        this.setState({pathwayHoverData: props});
    };

    clickGene = (props) => {
        this.setState({geneClickData: props});
    };

    hoverGene = (props) => {
        this.setState({geneHoverData: props});
    };

    filterTissueType = (filter) => {
        this.setState({tissueExpressionFilter: filter});
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
        let samples ;
        cohortSamples('https://tcga.xenahubs.net', selected, null)
            .flatMap((sampleList) => {
                samples = sampleList;
                let geneList = this.getGenesForPathway(ExamplePathWays);
                let dataSetId = this.getSelectedDataSetId();
                return sparseData('https://tcga.xenahubs.net', dataSetId, sampleList, geneList)
            })
            .subscribe(resp => {
                this.setState({
                    pathwayData : {
                        expression: resp,
                        pathways: ExamplePathWays,
                        samples: samples,
                    },
                    geneData: {
                        expression: [],
                        pathways: [],
                        samples: [],
                    },
                })

            });
    };


    getSelectedDataSetId() {
        for (let cohort of this.state.cohortData) {
            if (cohort.name === this.state.selectedCohort) {
                return cohort.mutationDataSetId;
            }
        }
        return null;
    }

    getGenesForPathway(pathways) {
        let geneList = new Set();
        for (let p of pathways) {
            for (let g of p.gene) {
                geneList.add(g)
            }
        }
        let returnArray = [];
        for (let p of geneList) {
            returnArray.push(p)
        }
        return returnArray
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

        function filterMutationVector(inputData, minFilter) {
            let filteredMutationVector = {};
            for (let v in inputData) {
                let value = inputData[v];
                if (value >= minFilter) {
                    filteredMutationVector[v] = value;
                }
            }
            return filteredMutationVector;
        }

        let filteredMutationVector = filterMutationVector(mutationVector, this.state.minFilter);

        return (
            <div>
                {this.state.loadState === 'loading' ? 'Loading' : ''}
                {this.state.loadState === 'loaded' &&
                <table>
                    <tbody>
                    <tr>
                        <td>
                            <h2>Cohorts</h2>
                            <CohortSelector cohorts={this.state.cohortData} selectedCohort={this.state.selectedCohort}
                                            onChange={this.selectCohort}/>
                            <h2>Mutation Type</h2>
                            <FilterSelector filters={filteredMutationVector}
                                            selected={this.state.tissueExpressionFilter}
                                            pathwayData={this.state.pathwayData}
                                            onChange={this.filterTissueType}/>
                            <TissueExpressionView id="pathwayViewId" width="400" height="800"
                                                  data={this.state.pathwayData} titleText="Mutation Score"
                                                  filter={this.state.tissueExpressionFilter}
                                                  filterPercentage={this.state.filterPercentage}
                                                  min={this.state.minFilter}
                                                  onClick={this.clickPathway} onHover={this.hoverPathway}/>
                        </td>
                        <td style={alignTop}>
                            <HoverPathwayView title="Hover" data={this.state.pathwayHoverData}/>
                            <HoverPathwayView title="Clicked" data={this.state.pathwayClickData}/>
                        </td>
                        {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                        <td style={geneAlignment}>
                            <h2>Mutation Type</h2>
                            <FilterSelector filters={filteredMutationVector} selected={this.state.geneExpressionFilter}
                                            pathwayData={this.state.geneData}
                                            onChange={this.filterGeneType}/>
                            <TissueExpressionView id="geneViewId" width="400" height="800" data={this.state.geneData}
                                                  selected={this.state.geneData.selectedPathway}
                                                  filter={this.state.geneExpressionFilter}
                                                  filterPercentage={this.state.filterPercentage}
                                                  min={this.state.minFilter}
                                                  onClick={this.clickGene} onHover={this.hoverGene}/>
                        </td>
                        }
                        <td style={alignTop}>
                            <HoverGeneView title="Hover" data={this.state.geneHoverData}/>
                            <HoverGeneView title="Clicked" data={this.state.geneClickData}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
                }
            </div>
        );
    }
}

