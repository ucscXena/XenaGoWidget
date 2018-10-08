import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from "./CohortSelector";
import PathwayScoresView from "./PathwayScoresView";
import '../base.css';
import HoverPathwayView from "./HoverPathwayView"
import HoverGeneView from "./HoverGeneView";
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
import {AppStorageHandler} from "./AppStorageHandler";
import {LABEL_A, LABEL_B} from "./XenaGeneSetApp";


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

        let cohortIndex = this.state.key ;
        let sortString = AppStorageHandler.getSortState(cohortIndex);
        let filterString = AppStorageHandler.getFilterState(cohortIndex);
        let cohort = AppStorageHandler.getCohortState(cohortIndex);

        if(sortString){
            this.state.selectedGeneSort = sortString;
            this.state.selectedTissueSort = sortString;
        }

        if(filterString){
            this.state.geneExpressionFilter = filterString;
            this.state.tissueExpressionFilter = filterString;
        }

        if(cohort && cohort.selected){
            this.state.selectedCohort = cohort.selected ;
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
                referencePathways: this.props.pathways,
                copyNumber,
                selectedPathway: pathwayClickData.pathway
            },
        });
        pathwayClickData.key = this.props.appData.key;
        pathwayClickData.propagate = pathwayClickData.propagate == null ? true : pathwayClickData.propagate;
        if (pathwayClickData.propagate) {
            // NOTE: you have to run the synchronization handler to synchronize the genes before the pathway selection
            this.props.pathwaySelect(pathwayClickData,newSelection);
        }
    }

    closeGeneView = () => {
        let selectedPathways = this.props.pathways.filter(f => {
            let index = this.state.selectedPathways.indexOf(f.golabel);
            return index >= 0;
        });
        let pathwayClickDataObject = {};
        pathwayClickDataObject.pathway = selectedPathways[0];
        this.setPathwayState([], pathwayClickDataObject);
    };

    clickPathway = (pathwayClickData) => {
        let {pathway: {golabel}} = pathwayClickData;
        this.setPathwayState([golabel], pathwayClickData);
    };

    setPathwayHover = (newHover) => {
        this.setState(
            {
                hoveredPathways: newHover,
            }
        );
    };

    hoverPathway = (props) => {
        if (props !== null) {
            let hoveredPathways = props.pathway.golabel;
            this.setState(
                {
                    pathwayHoverData: props,
                    hoveredPathways: [hoveredPathways],
                }
            );
            let hoverData = {
                hoveredPathways,
                key: this.props.appData.key,
                propagate: hoveredPathways.propagate == null ? true : hoveredPathways.propagate,
            };
            if (hoverData.propagate) {
                // NOTE: you have to run the synchronization handler to synchronize the genes before the pathway selection
                this.props.pathwayHover(hoverData);
            }
        }
    };

    hoverGene = (props) => {

        this.props.geneHover(props);

        let genesHovered;
        if (props == null) {
            props = {};
            genesHovered = [];
        }
        else {
            genesHovered = props.pathway ? props.pathway.gene : [];
        }
        this.setState(
            {
                geneHoverData: props,
                hoveredPathways: genesHovered
            }
        );
        let hoverData = {
            hoveredPathways: genesHovered,
            key: this.props.appData.key,
            propagate: genesHovered.propagate == null ? true : genesHovered.propagate,
        };
        if (hoverData.propagate) {
            // NOTE: you have to run the synchronization handler to synchronize the genes before the pathway selection
            // this.props.synchronizationHandler(pathways);
            this.props.pathwayHover(hoverData);
        }
    };

    filterTissueType = (filter) => {
        this.setState({tissueExpressionFilter: filter});
        AppStorageHandler.storeFilterState(filter,this.state.key)
    };

    sortTissueType = (sortString) => {
        this.setState({selectedTissueSort: sortString});
        AppStorageHandler.storeSortState(sortString,this.state.key)
    };

    sortGeneType = (sortString) => {
        this.setState({selectedGeneSort: sortString});
        AppStorageHandler.storeSortState(sortString,this.state.key)
    };

    filterGeneType = (filter) => {
        this.setState({geneExpressionFilter: filter});
        AppStorageHandler.storeFilterState(filter,this.state.key)
    };

    componentWillMount() {
        // TODO: this SHOULD just be loaded once, not a performance concern now, though.
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
                    if (this.state.pathwayData.pathways.length > 0 && (this.state.geneData && this.state.geneData.expression.length === 0)) {
                        let selectedCohort2 = AppStorageHandler.getCohortState(this.state.key);
                        this.selectCohort(selectedCohort2.selected ? selectedCohort2.selected : selectedCohort2);
                    }
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
                    (mutations, copyNumber) => ({mutations, samples, copyNumber}))
            })
            .subscribe(({mutations, samples, copyNumber}) => {
                let pathwayData = {
                    copyNumber,
                    geneList,
                    expression: mutations,
                    pathways: this.props.pathways,
                    cohort: cohort.name,
                    samples
                };
                this.setState({
                    pathwayData: pathwayData,
                    processing: false,
                });
                this.props.populateGlobal(pathwayData,this.props.cohortIndex);
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

    render() {

        let filteredMutationVector = pick(mutationVector,
            v => v >= this.state.minFilter);
        filteredMutationVector['Copy Number'] = 1;

        let cohortLoading = this.state.selectedCohort !== this.state.pathwayData.cohort;
        let geneList = this.getGenesForPathways(this.props.pathways);

        let {statGenerator, renderHeight, renderOffset,cohortIndex} = this.props;

        if (this.state.loadState === 'loaded') {
            if (this.state.selectedPathways && this.state.selectedPathways.length === 0) {
                return (
                    <Grid>
                        <Row>
                            <Col md={3}>
                                <Card style={{width: style.pathway.columnWidth, marginTop: 10}}>
                                    <CohortSelector cohorts={this.state.cohortData}
                                                    selectedCohort={this.state.selectedCohort}
                                                    onChange={this.selectCohort}
                                                    cohortLabel={this.getCohortLabel(cohortIndex)}
                                    />
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
                                                   hoveredPathways={this.state.hoveredPathways}
                                                   onClick={this.clickPathway}
                                                   onHover={this.hoverPathway}
                                                   hideTitle={true}
                                                   cohortIndex={this.state.key}
                                                   key={this.state.key}
                                />
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
                            <Col md={3}>
                                <Card style={{height: 400,width: style.gene.columnWidth, marginTop: 5}}>
                                    <CohortSelector cohorts={this.state.cohortData}
                                                    selectedCohort={this.state.selectedCohort}
                                                    onChange={this.selectCohort}
                                                    cohortLabel={this.getCohortLabel(cohortIndex)}
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
                                                   filterPercentage={this.state.filterPercentage}
                                                   geneList={geneList}
                                                   loading={cohortLoading}
                                                   min={this.state.minFilter}
                                                   selectedSort={this.state.selectedGeneSort}
                                                   selectedCohort={this.state.selectedCohortData}
                                                   referencePathways={this.state.pathwayData}
                                                   selectedPathways={this.state.selectedPathways}
                                                   hoveredPathways={this.state.hoveredPathways}
                                                   onClick={this.clickPathway}
                                                   onHover={this.hoverGene}
                                                   hideTitle={true}
                                                   cohortIndex={this.state.key}
                                                   key={this.state.key}
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
    appData: PropTypes.any,
    statGenerator: PropTypes.any,
    stats: PropTypes.any,
    renderHeight: PropTypes.any,
    renderOffset: PropTypes.any,
    pathwaySelect: PropTypes.any,
    pathwayHover: PropTypes.any,
    pathways: PropTypes.any,
    geneHover: PropTypes.any,
    populateGlobal: PropTypes.any,
    cohortIndex: PropTypes.any,
};
