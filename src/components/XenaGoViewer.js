import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from "./CohortSelector";
import PathwayScoresView from "./PathwayScoresView";
import '../css/base.css';
import HoverGeneView from "./HoverGeneView";
import mutationVector from "../data/mutationVector";
import {FilterSelector} from "./FilterSelector";

// let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
// let {datasetSamples, datasetFetch, sparseData} = xenaQuery;
import {pick} from 'underscore';
import {Card,Dialog,Button} from "react-toolbox";

// let Rx = require('ucsc-xena-client/dist/rx');
import {AppStorageHandler} from "../service/AppStorageHandler";
import {MAX_GENE_WIDTH, MIN_FILTER} from "./XenaGeneSetApp";
import {DetailedLegend} from "./DetailedLegend";
import {
    getCohortDetails,
    getGenesForNamedPathways,
    getGenesForPathways,
    // getSamplesFromSubCohort, getSamplesFromSubCohortList,
    getSubCohortsOnlyForCohort
} from "../functions/CohortFunctions";
// import {intersection} from "../functions/MathFunctions";


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
        this.state.hoveredPathway = undefined ;
        this.state.highlightedGene = this.props.highlightedGene;
        this.state.subCohortData = [];

        this.state.pathwayData = this.props.pathwayData;
        let {goid, golabel} = this.props.pathwaySelection;
        let geneList = getGenesForNamedPathways([this.props.pathwaySelection.pathway.golabel], this.props.pathways);
        let pathways = geneList.map(gene => ({goid, golabel, gene: [gene]}));
        //
        this.state.geneData = {
            expression : this.props.pathwayData.expression,
            samples: this.props.pathwayData.samples,
            copyNumber: this.props.pathwayData.copyNumber,

            pathways: pathways,
            pathwaySelection: this.props.pathwaySelection,
        };
        this.state.selectedPathway = [this.props.pathwaySelection.pathway.golabel];


        let cohortIndex = this.state.key;
        let filterString = AppStorageHandler.getFilterState(cohortIndex);
        let cohort = AppStorageHandler.getCohortState(cohortIndex);
        if (filterString) {
            this.state.tissueExpressionFilter = filterString;
        }

        if (cohort && cohort.selected) {
            this.state.selectedCohort = cohort.selected;
            this.state.selectedSubCohorts = cohort.selectedSubCohorts;
        }
    }


    setPathwayState(newSelection, pathwayClickData) {
        let {expression, samples, copyNumber} = this.state.pathwayData;
        let {pathway: {goid, golabel}} = pathwayClickData;

        let geneList = getGenesForNamedPathways(newSelection, this.props.pathways);
        let pathways = geneList.map(gene => ({goid, golabel, gene: [gene]}));

        // console.log('just setting pathway state',newSelection,pathwayClickData,newSelection)

        this.setState({
            pathwayClickData,
            selectedPathway: newSelection,
            geneData: {
                expression,
                samples,
                pathways,
                copyNumber,
                selectedPathway: pathwayClickData.pathway
            },
        });
        // pathwayClickData.key = this.props.appData.key;
        // pathwayClickData.propagate = pathwayClickData.propagate == null ? true : pathwayClickData.propagate;
        // if (pathwayClickData.propagate) {
        //     // NOTE: you have to run the synchronization handler to synchronize the genes before the pathway selection
        //     this.props.pathwaySelect(pathwayClickData, newSelection);
        // }
    }

    // clickPathway = (pathwayClickData) => {
    //     let {pathway: {golabel}} = pathwayClickData;
    //     this.setPathwayState([golabel], pathwayClickData);
    // };


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
                hoveredPathway: newHover,
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
                expression.samplesAffected = pathwayHover.firstObserved;
                expression.allGeneAffected = pathwayHover.firstTotal;
                expression.total = pathwayHover.firstNumSamples;
            } else {
                expression.affected = pathwayHover.secondObserved;
                expression.samplesAffected = pathwayHover.secondObserved;
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
                    hoveredPathway: newHover,
                    geneHoverData: hoverData,
                }
            );
        }
    };

    hoverGene = (geneHoverProps) => {
        if (geneHoverProps) {
            geneHoverProps.cohortIndex = this.props.cohortIndex;
            geneHoverProps.expression.samplesAffected = geneHoverProps.pathway.samplesAffected
        }
        this.props.geneHover(geneHoverProps);


        let genesHovered;
        if (geneHoverProps == null) {
            geneHoverProps = {};
            genesHovered = [];
        } else {
            genesHovered = geneHoverProps.pathway ? geneHoverProps.pathway.gene : [];
        }

        this.setState(
            {
                geneHoverData: geneHoverProps,
                hoveredPathway: genesHovered
            }
        );
    };

    filterGeneType = (filter) => {
        this.setState({tissueExpressionFilter: filter});
        AppStorageHandler.storeFilterState(filter, this.state.key)
        this.props.changeFilter(filter,this.props.cohortIndex);
    };

    selectCohort = (selected) => {

        // console.log('selecting a cohort for ',selected,this.props.cohortIndex,this.props.cohortData)
        // if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
        // let cohort = this.state.cohortData.find(c => c.name === selected);

        let cohortDetails = getCohortDetails(selected,this.props.cohortData);
        // console.log('cohort details',cohortDetails)

        let selectedObject = {
            selected: selected,
            selectedSubCohorts: getSubCohortsOnlyForCohort(selected),
        };
        AppStorageHandler.storeCohortState(selectedObject, this.state.key);
        this.setState({
            selectedCohort: selected,
            selectedCohortData: cohortDetails,
            processing: true,
        });

        // console.log('B')
        this.props.changeCohort(selected,this.props.cohortIndex);
        // console.log('C')

        // let geneList = getGenesForPathways(this.props.pathways);
        // Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
        //     datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
        //     intersection)
        //     .flatMap((samples) => {
        //         return Rx.Observable.zip(
        //             sparseData(cohort.host, cohort.mutationDataSetId, samples, geneList),
        //             datasetFetch(cohort.host, cohort.copyNumberDataSetId, samples, geneList),
        //             datasetFetch(cohort.genomeBackgroundMutation.host, cohort.genomeBackgroundMutation.dataset, samples, [cohort.genomeBackgroundMutation.feature_event_K, cohort.genomeBackgroundMutation.feature_total_pop_N]),
        //             datasetFetch(cohort.genomeBackgroundCopyNumber.host, cohort.genomeBackgroundCopyNumber.dataset, samples, [cohort.genomeBackgroundCopyNumber.feature_event_K, cohort.genomeBackgroundCopyNumber.feature_total_pop_N]),
        //             (mutations, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber) => ({
        //                 mutations,
        //                 samples,
        //                 copyNumber,
        //                 genomeBackgroundMutation,
        //                 genomeBackgroundCopyNumber
        //             }))
        //     })
        //     .subscribe(({mutations, samples, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber}) => {
        //         this.handleCohortData({
        //             mutations,
        //             samples,
        //             copyNumber,
        //             genomeBackgroundMutation,
        //             genomeBackgroundCopyNumber,
        //             geneList,
        //             cohort
        //         });
        //     });
    };

    selectSubCohort = (subCohortSelected) => {
        if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;

        this.props.changeSubCohort(subCohortSelected,subCohortSelected,this.props.cohortIndex);
        // let subCohortSamplesArray, subCohort, samples;
        // let samples, selectedObject;
        let selectedObject;
        let selectedCohort = this.state.selectedCohort;

        if (typeof subCohortSelected === 'object') {
            if (typeof subCohortSelected.selectedSubCohorts === 'object') {
                    // samples = getSamplesFromSubCohortList(this.state.selectedCohort,subCohortSelected.selectedSubCohorts);
                    selectedObject = {
                        selected: this.state.selectedCohort,
                        selectedSubCohorts: subCohortSelected.selectedSubCohorts,
                    };
            }
            else{
                console.error("Unsure how to handle input", JSON.stringify(subCohortSelected))
            }
        } else {
            // get samples for cohort array
            if (subCohortSelected === 'All Subtypes') {
                this.selectCohort(this.state.selectedCohort);
                return;
            }
            // let selectedSubCohortSamples = getSamplesFromSubCohort(this.state.selectedCohort,subCohortSelected);
            // samples = Object.entries(selectedSubCohortSamples).map(c => {
            //     return c[1]
            // });
            selectedObject = {
                selected: selectedCohort,
                selectedSubCohorts: subCohortSelected,
            };
        }
        AppStorageHandler.storeCohortState(selectedObject, this.state.key);
        // let cohort = this.state.cohortData.find(c => c.name === this.state.selectedCohort);
        this.setState({
                processing: true,
                selectedSubCohorts: selectedObject.selectedSubCohorts
            }
        );

        // let geneList = getGenesForPathways(this.props.pathways);
        //  Rx.Observable.zip(datasetSamples(cohort.host, cohort.mutationDataSetId, null),
        //     datasetSamples(cohort.host, cohort.copyNumberDataSetId, null),
        // ).subscribe((sampleArray) => {
        //     let finalSamples = intersection(sampleArray[0],sampleArray[1],samples)
        //     samples = intersection(finalSamples,samples);
        //     Rx.Observable.zip(
        //         sparseData(cohort.host, cohort.mutationDataSetId, samples, geneList),
        //         datasetFetch(cohort.host, cohort.copyNumberDataSetId, samples, geneList),
        //         datasetFetch(cohort.genomeBackgroundMutation.host, cohort.genomeBackgroundMutation.dataset, samples, [cohort.genomeBackgroundMutation.feature_event_K, cohort.genomeBackgroundMutation.feature_total_pop_N]),
        //         datasetFetch(cohort.genomeBackgroundCopyNumber.host, cohort.genomeBackgroundCopyNumber.dataset, samples, [cohort.genomeBackgroundCopyNumber.feature_event_K, cohort.genomeBackgroundCopyNumber.feature_total_pop_N]),
        //         (mutations, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber) => ({
        //             mutations,
        //             samples,
        //             copyNumber,
        //             genomeBackgroundMutation,
        //             genomeBackgroundCopyNumber
        //         }))
        //         .subscribe(({mutations, samples, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber}) => {
        //             this.handleCohortData({
        //                 mutations,
        //                 samples,
        //                 copyNumber,
        //                 genomeBackgroundMutation,
        //                 genomeBackgroundCopyNumber,
        //                 geneList,
        //                 cohort
        //             });
        //         });
        // });
    };

    callDownload = () => {
        this.refs['pathwayscoreview'].downloadData();
    };


    render() {

        let filteredMutationVector = pick(mutationVector,
            v => v >= this.state.minFilter);
        filteredMutationVector['Copy Number'] = 1;

        let cohortLoading = this.state.selectedCohort !== this.state.pathwayData.cohort;
        let geneList = getGenesForPathways(this.props.pathways);

        // console.log('input gene data pathways',JSON.stringify(this.state.geneData.pathways))

        let {renderHeight, renderOffset, cohortIndex} = this.props;

        if (this.state.selectedPathway.length > 0) {
            return (
                <table>
                    <tbody>
                    <tr>
                        {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                        <td valign="top"
                            style={{paddingRight: 20, paddingLeft: 20, paddingTop: 0, paddingBottom: 0}}>
                            <Card style={{height: 300, width: style.gene.columnWidth, marginTop: 5}}>
                                <CohortSelector cohorts={this.props.cohortData}
                                                subCohorts={this.state.subCohortData}
                                                selectedCohort={this.state.selectedCohort}
                                                selectedSubCohorts={this.state.selectedSubCohorts}
                                                onChange={this.selectCohort}
                                                onChangeSubCohort={this.selectSubCohort}
                                                cohortLabel={this.props.cohortLabel}
                                />
                                <FilterSelector filters={filteredMutationVector}
                                                selected={this.state.tissueExpressionFilter}
                                                pathwayData={this.state.geneData}
                                                geneList={geneList}
                                                amplificationThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.amplificationThreshold : 2}
                                                deletionThreshold={this.state.selectedCohortData ? this.state.selectedCohortData.deletionThreshold : -2}
                                                onChange={this.filterGeneType}
                                />
                                <HoverGeneView data={this.props.geneHoverData}
                                               cohortIndex={cohortIndex}
                                />
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
                            <DetailedLegend/>
                        </td>
                        }
                        {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                        <td style={{padding: 0}}>
                            <PathwayScoresView height={renderHeight}
                                               offset={renderOffset}
                                               ref='pathwayscoreview'
                                               data={this.state.geneData}
                                               filter={this.state.tissueExpressionFilter}
                                               filterPercentage={this.state.filterPercentage}
                                               geneList={geneList}
                                               loading={cohortLoading}
                                               min={MIN_FILTER}
                                               selectedCohort={this.state.selectedCohort}
                                               selectedPathways={this.state.selectedPathway}
                                               highlightedGene={this.props.highlightedGene}
                                               onHover={this.hoverGene}
                                               cohortIndex={this.state.key}
                                               // shareGlobalGeneData={this.props.shareGlobalGeneData}
                                               colorSettings={this.props.colorSettings}
                                               collapsed={this.props.collapsed}
                                               showDiffLayer={this.props.showDiffLayer}
                                               showDetailLayer={this.props.showDetailLayer}
                                               showClusterSort={this.props.showClusterSort}
                            />
                        </td>
                        }
                    </tr>
                    </tbody>
                </table>
            )
        }

        return (
            <Dialog active={this.state.processing} title='Loading'>
                {this.state.selectedCohort}
            </Dialog>
        );
    }

    handleCohortData(input) {
        let {mutations, samples, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber, geneList, cohort} = input;

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
        if (this.state.selectedPathway.length > 0) {
            // console.log('XGV handleCohorTData',JSON.stringify(this.state.selectedPathway),JSON.stringify(this.state.pathwayClickData))
            this.setPathwayState(this.state.selectedPathway, this.state.pathwayClickData)
        } else {
            this.setState({
                geneData: {
                    copyNumber: [],
                    expression: [],
                    pathways: [],
                    samples: [],
                },
            });
        }

    }
}

XenaGoViewer.propTypes = {
    appData: PropTypes.any.isRequired,
    renderHeight: PropTypes.any.isRequired,
    renderOffset: PropTypes.any.isRequired,
    pathways: PropTypes.any.isRequired,
    geneHover: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    // shareGlobalGeneData: PropTypes.any.isRequired,
    geneDataStats: PropTypes.any.isRequired,
    highlightedGene: PropTypes.any, // optional
    setCollapsed: PropTypes.any,
    collapsed: PropTypes.any,
    showDiffLayer: PropTypes.any,
    showDetailLayer: PropTypes.any,
    showClusterSort: PropTypes.any,


    cohortLabel: PropTypes.any.isRequired,
    cohortData: PropTypes.any.isRequired,
    pathwayData: PropTypes.any.isRequired,
    pathwaySelection: PropTypes.any.isRequired,

    geneHoverData: PropTypes.any.isRequired,
};
