import React from 'react'
import PureComponent from './components/PureComponent';
// import CohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import TissueExpressionView from "./components/PathwayScoresView";
import ExamplePathWays from "../tests/data/tgac";
import ExampleExpression from "../tests/data/bulkExpression";
import ExampleSamples from "../tests/data/samples";
// import ExampleStyle from "../demo/src/example.css";
import './base.css';
import HoverPathwayView from "./components/HoverPathwayView"
import HoverGeneView from "./components/HoverGeneView";
// import update from 'immutability-helper';
import mutationVector from "./data/mutationVector";
import {FilterSelector} from "./components/FilterSelector";
var xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
var {datasetSamples,  sparseData} = xenaQuery;
import {pick, pluck, flatten} from 'underscore';
import {SortSelector} from "./components/SortSelector";

var mutationKey = 'simple somatic mutation';

function lowerCaseCompareName(a, b) {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

export default class XenaGoApp extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            sortPathwayName: null,
            sortPathwayOrder: null,
            sortGeneName: null,
            sortGeneOrder: null,
            selectedTissueSort: 'Cluster',
            selectedGeneSort: 'Cluster',
            sortTypes:['Cluster','Density','Overall','Per Column'],
            pathwayData: {
                cohort: 'TCGA Ovarian Cancer (OV)',
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
            }
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
        datasetSamples('https://tcga.xenahubs.net', cohort.mutationDataSetId, null)
            .flatMap((samples) => {
                let geneList = this.getGenesForPathway(ExamplePathWays);
                return sparseData('https://tcga.xenahubs.net', cohort.mutationDataSetId, samples, geneList)
                    .map(mutations => ({mutations, samples}));
            })
            .subscribe(({mutations, samples}) => {
                this.setState({
                    pathwayData: {
                        expression: mutations,
                        pathways: ExamplePathWays,
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
            <div>
                {this.state.loadState === 'loading' ? 'Loading' : ''}
                {this.state.loadState === 'loaded' &&
                <div>
                    <h2>Cohorts</h2>
                    <CohortSelector cohorts={this.state.cohortData}
                                    selectedCohort={this.state.selectedCohort}
                                    onChange={this.selectCohort}/>
                    <table>
                        <tbody>
                        <tr>
                            <td>
                                <h2>Sort Type</h2>
                                <SortSelector sortTypes={this.state.sortTypes}
                                                selected={this.state.selectedTissueSort}
                                                onChange={this.sortTissueType}/>
                                <h2>Mutation Type</h2>
                                <FilterSelector filters={filteredMutationVector}
                                                selected={this.state.tissueExpressionFilter}
                                                pathwayData={this.state.pathwayData}
                                                onChange={this.filterTissueType}/>
                                <TissueExpressionView id="pathwayViewId" width={400} height={800}
                                                      data={this.state.pathwayData} titleText="Mutation Score"
                                                      filter={this.state.tissueExpressionFilter}
                                                      filterPercentage={this.state.filterPercentage}
                                                      loading={cohortLoading}
                                                      min={this.state.minFilter}
                                                      sortColumn={this.state.sortPathwayName}
                                                      sortOrder={this.state.sortPathwayOrder}
                                                      selectedSort = {this.state.selectedTissueSort}
                                                      onClick={this.clickPathway} onHover={this.hoverPathway}/>
                            </td>
                            <td style={alignTop}>
                                <HoverPathwayView title="Hover" data={this.state.pathwayHoverData}/>
                                <HoverPathwayView title="Clicked" data={this.state.pathwayClickData}/>
                            </td>
                            {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                            <td style={geneAlignment}>
                                <h2>Sort Type</h2>
                                <SortSelector sortTypes={this.state.sortTypes}
                                              selected={this.state.selectedGeneSort}
                                              onChange={this.sortGeneType}/>
                                <h2>Mutation Type</h2>
                                <FilterSelector filters={filteredMutationVector}
                                                selected={this.state.geneExpressionFilter}
                                                pathwayData={this.state.geneData}
                                                onChange={this.filterGeneType}/>
                                <TissueExpressionView id="geneViewId" height={800}
                                                      data={this.state.geneData}
                                                      selected={this.state.geneData.selectedPathway}
                                                      filter={this.state.geneExpressionFilter}
                                                      filterPercentage={this.state.filterPercentage}
                                                      loading={cohortLoading}
                                                      min={this.state.minFilter}
                                                      sortColumn={this.state.sortGeneName}
                                                      sortOrder={this.state.sortGeneOrder}
                                                      selectedSort = {this.state.selectedGeneSort}
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
                </div>
                }
            </div>
        );
    }
}

