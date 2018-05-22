import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from "./CohortSelector";
import PathwayScoresView from "./PathwayScoresView";
import PathWays from "../../tests/data/tgac";
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
        this.state = this.props.appData;
        console.log('xena go app props')
        console.log(this.state)
    }


    clickPathway = (pathwayClickData) => {
        console.log('pathwayClickData')
        console.log(pathwayClickData)
        let {expression, samples, copyNumber} = this.state.pathwayData;
        let {metaSelect, pathway: {goid, golabel}} = pathwayClickData;

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

        let geneList = this.getGenesForNamedPathways(newSelection, PathWays);
        let pathways = geneList.map(gene => ({goid, golabel, gene: [gene]}));


        this.setState({
            pathwayClickData,
            selectedPathways: newSelection,
            geneData: {
                expression,
                samples,
                pathways,
                referencePathways: PathWays,
                copyNumber,
                selectedPathway: pathwayClickData.pathway
            },
        });
        pathwayClickData.key = this.props.appData.key;
        pathwayClickData.propagate = pathwayClickData.propagate == null ? true : pathwayClickData.propagate;
        if(pathwayClickData.propagate){
            this.props.pathwaySelect(pathwayClickData);
        }
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
        let geneList = this.getGenesForPathways(PathWays);
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

    closeGeneView = (props) => {
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
        let geneList = this.getGenesForPathways(PathWays);

        let {statGenerator,stats} = this.props;

        return (
            <Grid>
                <Row>
                    {this.state.loadState === 'loading' ? 'Loading' : ''}

                    {this.state.loadState === 'loaded' && this.state.selectedPathways.length === 0 &&
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
                    {this.state.loadState === 'loaded' && this.state.selectedPathways.length === 0 &&
                    <Col md={style.pathway.expressionColumns}>
                        <PathwayScoresView width={400} height={this.state.renderHeight}
                                           offset={this.state.renderOffset}
                                           data={this.state.pathwayData} titleText=""
                                           filter={this.state.tissueExpressionFilter}
                                           statGenerator={statGenerator}
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
                                           cohortIndex={this.state.key}
                                           key={this.state.key}
                        />
                    </Col>
                    }
                    {stats && this.state.loadState === 'loaded' && this.state.selectedPathways.length === 0 &&
                    <Col mdOffset={1} md={style.gene.expressionColumns}>
                        <Card style={{width: style.gene.columnWidth}}>
                            <CompareBox statBox={stats}/>
                        </Card>
                    </Col>
                    }
                    {this.state.selectedPathways.length > 0 && this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col md={style.gene.columns}>
                        <Card style={{width: style.gene.columnWidth}}>
                            <CardTitle
                                title={this.state.selectedCohort}
                                subtitle='Cohort'
                            />
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
                                                onChange={this.filterGeneType}/>
                                <HoverGeneView data={this.state.geneHoverData}/>
                            </CardMedia>
                        </Card>
                    </Col>
                    }
                    {this.state.selectedPathways.length > 0 && this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col md={style.gene.expressionColumns}>
                        <PathwayScoresView height={this.state.renderHeight}
                                           offset={this.state.renderOffset}
                                           data={this.state.geneData}
                                           selected={this.state.geneData.selectedPathway}
                                           statGenerator={statGenerator}
                                           filter={this.state.geneExpressionFilter}
                                           filterPercentage={this.state.filterPercentage}
                                           geneList={geneList}
                                           loading={cohortLoading}
                                           min={this.state.minFilter}
                                           selectedSort={this.state.selectedGeneSort}
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
                    {stats && this.state.selectedPathways.length > 0 && this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                    <Col mdOffset={1} md={style.gene.expressionColumns}>
                        <Card style={{width: style.gene.columnWidth}}>
                            <CompareBox statBox={stats}/>
                        </Card>
                    </Col>
                    }
                </Row>
            </Grid>
        );
    }
}

XenaGoApp.propTypes = {
    appData: PropTypes.any,
    statGenerator: PropTypes.any,
    stats: PropTypes.any,
    pathwaySelect: PropTypes.any,
};
