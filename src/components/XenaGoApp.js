import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from "./CohortSelector";
import PathwayScoresView from "./PathwayScoresView";
import '../base.css';
import HoverPathwayView from "./HoverPathwayView"
import HoverGeneView from "./HoverGeneView";
import CompareBox from "./CompareBox";
import mutationVector from "../data/mutationVector";
import {FilterSelector} from "./FilterSelector";

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {datasetSamples, datasetFetch, sparseData} = xenaQuery;
import {pick, pluck, flatten, isEqual} from 'underscore';
import {SortSelector} from "./SortSelector";
import {Button} from 'react-toolbox/lib/button';
import {Card, Chip, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";

let mutationKey = 'simple somatic mutation';
let copyNumberViewKey = 'copy number for pathway view';
let Rx = require('ucsc-xena-client/dist/rx');
import {Grid, Row, Col} from 'react-material-responsive-grid';
import Dialog from 'react-toolbox/lib/dialog';


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


export default class XenaGoApp extends PureComponent {

    constructor(props) {
        super(props);
        this.state = this.props.appData;
        this.state.processing = false;
        console.log('xena go app props');
        console.log(this.state)
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
                referencePathways: this.props.pathways,
                copyNumber,
                selectedPathway: pathwayClickData.pathway
            },
        });
        pathwayClickData.key = this.props.appData.key;
        pathwayClickData.propagate = pathwayClickData.propagate == null ? true : pathwayClickData.propagate;
        if (pathwayClickData.propagate) {
            // NOTE: you have to run the synchornization handler to synchronize the genes before the pathway selection
            // this.props.synchronizationHandler(pathways);
            this.props.pathwaySelect(pathwayClickData);
        }
    }

    clickPathway = (pathwayClickData) => {
        let {metaSelect, pathway: {golabel}} = pathwayClickData;

        let newSelection = [];

        if (metaSelect) {
            let goindex = this.state.selectedPathways.indexOf(golabel);
            newSelection = JSON.parse(JSON.stringify(this.state.selectedPathways));
            if (goindex >= 0) {
                newSelection.splice(goindex, 1);
            }
            else {
                newSelection.push(golabel)
            }
        }
        else if (isEqual(this.state.selectedPathways, [golabel])) {
            newSelection = [];
        }
        else {
            newSelection = [golabel];
        }

        this.setPathwayState(newSelection, pathwayClickData);
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
                        })
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
        let cohort = this.state.cohortData.find(c => c.name === selected);
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
                    (mutations, copyNumber) => ({mutations, samples, copyNumber}))
            })
            .subscribe(({mutations, samples, copyNumber}) => {
                this.setState({
                    pathwayData: {
                        copyNumber,
                        geneList,
                        expression: mutations,
                        pathways: this.props.pathways,
                        cohort: cohort.name,
                        samples
                    },
                    processing: false,
                });
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

    closeGeneView = () => {
        this.setState({
            selectedPathways: []
        });
    };

    getGenesForNamedPathways(selectedPathways, pathways) {
        let filteredPathways = pathways.filter(f => selectedPathways.indexOf(f.golabel) >= 0)
        return Array.from(new Set(flatten(pluck(filteredPathways, 'gene'))));
    };

    getGenesForPathways(pathways) {
        return Array.from(new Set(flatten(pluck(pathways, 'gene'))));
    };

    render() {

        let filteredMutationVector = pick(mutationVector,
            v => v >= this.state.minFilter);
        filteredMutationVector['Copy Number'] = 1;

        let cohortLoading = this.state.selectedCohort !== this.state.pathwayData.cohort;
        let geneList = this.getGenesForPathways(this.props.pathways);

        let {statGenerator, stats, renderHeight, renderOffset} = this.props;

        if (this.state.loadState === 'loaded') {
            if (this.state.selectedPathways && this.state.selectedPathways.length === 0) {
                return (
                    <Grid>
                        <Row>
                            <Col md={2}>
                                <Card style={{width: style.pathway.columnWidth, marginTop: 10}}>
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
                                                    amplificationThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.amplificationThreshold : 2}
                                                    deletionThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.deletionThreshold : -2}
                                                    onChange={this.filterTissueType}/>
                                    <HoverPathwayView data={this.state.pathwayHoverData}/>
                                    <Dialog active={this.state.processing} title='Loading'>
                                        {this.state.selectedCohort}
                                    </Dialog>
                                </Card>
                            </Col>
                            <Col md={9}>
                                <PathwayScoresView width={400} height={renderHeight}
                                                   offset={renderOffset}
                                                   data={this.state.pathwayData} titleText=""
                                                   filter={this.state.tissueExpressionFilter}
                                                   statGenerator={statGenerator}
                                                   filterPercentage={this.state.filterPercentage}
                                                   geneList={geneList}
                                                   loading={cohortLoading}
                                                   min={this.state.minFilter}
                                                   selectedSort={this.state.selectedTissueSort}
                                                   selectedCohort={this.state.selectedCohortData}
                                                   referencePathways={this.state.pathwayData}
                                                   selectedPathways={this.state.selectedPathways}
                                                   onClick={this.clickPathway}
                                                   onHover={this.hoverPathway}
                                                   hideTitle={true}
                                                   cohortIndex={this.state.key}
                                                   key={this.state.key}
                                />
                            </Col>
                            <Col md={1}>
                                <Card style={{marginTop: 5}}>
                                    <CompareBox statBox={stats}/>
                                </Card>
                            </Col>
                        </Row>
                    </Grid>
                )
            }
            if (this.state.selectedPathways.length > 0) {
                return (
                    <Grid>
                        <Row>
                            {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                            <Col md={2}>
                                <Card style={{width: style.gene.columnWidth, marginTop: 5}}>
                                    <CohortSelector cohorts={this.state.cohortData}
                                                    selectedCohort={this.state.selectedCohort}
                                                    onChange={this.selectCohort}/>
                                    <CardActions>
                                        <Button label='&lArr; Pathways' raised primary onClick={this.closeGeneView}/>
                                    </CardActions>

                                    <CardMedia>
                                        <SortSelector sortTypes={this.state.sortTypes}
                                                      selected={this.state.selectedGeneSort}
                                                      onChange={this.sortGeneType}/>
                                        <FilterSelector filters={filteredMutationVector}
                                                        selected={this.state.geneExpressionFilter}
                                                        pathwayData={this.state.geneData}
                                                        geneList={geneList}
                                                        amplificationThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.amplificationThreshold : 2}
                                                        deletionThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.deletionThreshold : -2}
                                                        onChange={this.filterGeneType}/>
                                        <HoverGeneView data={this.state.geneHoverData}/>
                                        <Dialog active={this.state.processing} title='Loading'>
                                            {this.state.selectedCohort}
                                        </Dialog>
                                    </CardMedia>
                                </Card>
                            </Col>
                            }
                            {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                            <Col md={9}>
                                <PathwayScoresView height={renderHeight}
                                                   offset={renderOffset}
                                                   data={this.state.geneData}
                                                   selected={this.state.geneData.selectedPathway}
                                                   statGenerator={statGenerator}
                                                   filter={this.state.geneExpressionFilter}
                                                   synchronizeSort={this.props.synchronizeSort}
                                                   filterPercentage={this.state.filterPercentage}
                                                   geneList={geneList}
                                                   loading={cohortLoading}
                                                   min={this.state.minFilter}
                                                   selectedSort={this.state.selectedGeneSort}
                                                   selectedCohort={this.state.selectedCohortData}
                                                   referencePathways={this.state.pathwayData}
                                                   selectedPathways={this.state.selectedPathways}
                                                   onClick={this.clickPathway}
                                                   onHover={this.hoverGene}
                                                   hideTitle={true}
                                                   cohortIndex={this.state.key}
                                                   key={this.state.key}
                                />
                            </Col>
                            }
                            {stats && this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                            <Col md={1}>
                                <Card style={{marginTop: 5}}>
                                    <CompareBox statBox={stats}/>
                                </Card>
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
}

XenaGoApp.propTypes = {
    appData: PropTypes.any,
    statGenerator: PropTypes.any,
    stats: PropTypes.any,
    renderHeight: PropTypes.any,
    renderOffset: PropTypes.any,
    pathwaySelect: PropTypes.any,
    pathways: PropTypes.any,
    synchronizeSort: PropTypes.any,
    synchronizedGeneList: PropTypes.any,
};
