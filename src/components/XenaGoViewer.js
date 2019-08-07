import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from "./CohortSelector";
import PathwayScoresView from "./PathwayScoresView";
import '../css/base.css';
import HoverGeneView from "./HoverGeneView";
import {FilterSelector} from "./FilterSelector";

import {Card,Dialog,Button} from "react-toolbox";

import {AppStorageHandler} from "../service/AppStorageHandler";
import {MAX_GENE_WIDTH} from "./XenaGeneSetApp";
import {DetailedLegend} from "./DetailedLegend";
import {
    getCohortDetails,
    getGenesForPathways,
} from "../functions/CohortFunctions";


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
        // this.state = this.props.appData;

        let cohort = AppStorageHandler.getCohortState(props.cohortIndex);
        // if (cohort && cohort.selected) {
        //     this.state.selectedCohort = cohort.selected;
        //     this.state.selectedSubCohorts = cohort.selectedSubCohorts;
        // }

        this.state = {
            processing : true,
            loadState : 'Loading',
            hoveredPathway : undefined ,
            selectedCohortData : undefined,
            highlightedGene : props.highlightedGene,
            pathwayData : props.pathwayData,
            key: props.cohortIndex,
            selectedCohort : cohort.selected,
            selectedSubCohorts : cohort.selectedSubCohorts,
        };
        // console.log('app data',this.props.appData)
        // console.log('state',this.state)
        // this.state.processing = true;
        // this.state.loadState = 'Loading';
        // this.state.hoveredPathway = undefined ;
        // this.state.highlightedGene = this.props.highlightedGene;

        // this.state.pathwayData = this.props.pathwayData;
        // this.state.selectedCohortData = undefined;
        // let {goid, golabel} = this.props.pathwaySelection;
        // let geneList = getGenesForNamedPathways([this.props.pathwaySelection.pathway.golabel], this.props.pathways);
        // let pathways = geneList.map(gene => ({goid, golabel, gene: [gene]}));
        //
        // this.state.geneData = {
        //     expression : this.props.pathwayData.expression,
        //     samples: this.props.pathwayData.samples,
        //     copyNumber: this.props.pathwayData.copyNumber,
        //
        //     pathways: pathways,
        //     pathwaySelection: this.props.pathwaySelection,
        // };

        // let cohortIndex = this.state.key;
    }


    // setPathwayState(newSelection, pathwayClickData) {
    //     let {expression, samples, copyNumber} = this.state.pathwayData;
    //     let {pathway: {goid, golabel}} = pathwayClickData;
    //
    //     let geneList = getGenesForNamedPathways(newSelection, this.props.pathways);
    //     let pathways = geneList.map(gene => ({goid, golabel, gene: [gene]}));
    //
    //     console.log('just setting pathway state',JSON.stringify(newSelection),JSON.stringify(pathwayClickData))
    //
    //     this.setState({
    //         // pathwayClickData,
    //         // selectedPathway: newSelection,
    //         geneData: {
    //             expression,
    //             samples,
    //             pathways,
    //             copyNumber,
    //             selectedPathway: pathwayClickData.pathway
    //         },
    //     });
    //     // pathwayClickData.key = this.props.appData.key;
    //     // pathwayClickData.propagate = pathwayClickData.propagate == null ? true : pathwayClickData.propagate;
    //     // if (pathwayClickData.propagate) {
    //     //     // NOTE: you have to run the synchronization handler to synchronize the genes before the pathway selection
    //     //     this.props.pathwaySelect(pathwayClickData, newSelection);
    //     // }
    // }

    // clickPathway = (pathwayClickData) => {
    //     let {pathway: {golabel}} = pathwayClickData;
    //     this.setPathwayState([golabel], pathwayClickData);
    // };


    // setGeneHover = (geneHover) => {
    //     let newHover = (geneHover && geneHover.gene) ? geneHover.gene : [];
    //     let genePathwayHover = this.state.geneData.pathways.find(f => f.gene[0] === newHover[0]);
    //
    //     let expression = this.props.geneDataStats && Array.isArray(this.props.geneDataStats) ? this.props.geneDataStats.find(g => g.gene[0] === newHover[0]) : {};
    //
    //     let hoverData = {
    //         cohortIndex: this.state.key,
    //         tissue: "Header",
    //         expression: expression,
    //         pathway: genePathwayHover,
    //     };
    //     this.setState(
    //         {
    //             hoveredPathway: newHover,
    //             geneHoverData: hoverData,
    //         }
    //     );
    // };
    //
    // setPathwayHover = (pathwayHover) => {
    //     let newHover = (pathwayHover && pathwayHover.gene) ? pathwayHover.gene : [];
    //
    //     if (pathwayHover) {
    //         // get the pathway
    //         let expression = {};
    //         if (this.props.cohortIndex === 0) {
    //             expression.affected = pathwayHover.firstObserved;
    //             expression.samplesAffected = pathwayHover.firstObserved;
    //             expression.allGeneAffected = pathwayHover.firstTotal;
    //             expression.total = pathwayHover.firstNumSamples;
    //         } else {
    //             expression.affected = pathwayHover.secondObserved;
    //             expression.samplesAffected = pathwayHover.secondObserved;
    //             expression.allGeneAffected = pathwayHover.secondTotal;
    //             expression.total = pathwayHover.secondNumSamples;
    //         }
    //         let hoverData = {
    //             tissue: "Header",
    //             expression: expression,
    //             pathway: pathwayHover,
    //         };
    //         this.setState(
    //             {
    //                 hoveredPathway: newHover,
    //                 geneHoverData: hoverData,
    //             }
    //         );
    //     }
    // };

    hoverGene = (geneHoverProps) => {
        // console.log('GENE hover props',JSON.stringify(geneHoverProps))
        if (geneHoverProps) {
            geneHoverProps.cohortIndex = this.props.cohortIndex;
            geneHoverProps.expression.samplesAffected = geneHoverProps.pathway.samplesAffected
        }
        this.props.geneHover(geneHoverProps);


        // let genesHovered;
        // if (geneHoverProps == null) {
        //     geneHoverProps = {};
        //     genesHovered = [];
        // } else {
        //     genesHovered = geneHoverProps.pathway ? geneHoverProps.pathway.gene : [];
        // }
        //
        // this.setState(
        //     {
        //         geneHoverData: geneHoverProps,
        //         hoveredPathway: genesHovered
        //     }
        // );
    };

    filterGeneType = (filter) => {
        // this.setState({tissueExpressionFilter: filter});
        this.props.changeFilter(filter,this.props.cohortIndex);
    };

    selectCohort = (selected) => {

        // console.log('selecting a cohort for ',selected,this.props.cohortIndex,this.props.cohortData)
        // if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
        // let cohort = this.state.cohortData.find(c => c.name === selected);

        // let cohortDetails = getCohortDetails(selected,this.props.cohortData);
        // // console.log('cohort details',cohortDetails)
        //
        // let selectedObject = {
        //     selected: selected,
        //     selectedSubCohorts: getSubCohortsOnlyForCohort(selected),
        // };
        // AppStorageHandler.storeCohortState(selectedObject, this.state.key);
        // this.setState({
        //     selectedCohort: selected,
        //     selectedCohortData: cohortDetails,
        //     processing: true,
        // });

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
        console.log('selected a sub cohort',JSON.stringify(subCohortSelected))
        // this.props.changeSubCohort(subCohortSelected.selected,subCohortSelected.selectedSubCohorts,this.props.cohortIndex);
        this.props.changeSubCohort(subCohortSelected,this.props.cohortIndex);
        // if (Object.keys(this.state.cohortData).length === 0 && this.state.cohortData.constructor === Object) return;
        //
        // // let subCohortSamplesArray, subCohort, samples;
        // // let samples, selectedObject;
        // let selectedObject;
        // let selectedCohort = this.state.selectedCohort;
        //
        // if (typeof subCohortSelected === 'object') {
        //     if (typeof subCohortSelected.selectedSubCohorts === 'object') {
        //             // samples = getSamplesFromSubCohortList(this.state.selectedCohort,subCohortSelected.selectedSubCohorts);
        //             selectedObject = {
        //                 selected: this.state.selectedCohort,
        //                 selectedSubCohorts: subCohortSelected.selectedSubCohorts,
        //             };
        //     }
        //     else{
        //         console.error("Unsure how to handle input", JSON.stringify(subCohortSelected))
        //     }
        // } else {
        //     // get samples for cohort array
        //     if (subCohortSelected === 'All Subtypes') {
        //         this.selectCohort(this.state.selectedCohort);
        //         return;
        //     }
        //     // let selectedSubCohortSamples = getSamplesFromSubCohort(this.state.selectedCohort,subCohortSelected);
        //     // samples = Object.entries(selectedSubCohortSamples).map(c => {
        //     //     return c[1]
        //     // });
        //     selectedObject = {
        //         selected: selectedCohort,
        //         selectedSubCohorts: subCohortSelected,
        //     };
        // }
        // AppStorageHandler.storeCohortState(selectedObject, this.state.key);
        // // let cohort = this.state.cohortData.find(c => c.name === this.state.selectedCohort);
        // this.setState({
        //         processing: true,
        //         selectedSubCohorts: selectedObject.selectedSubCohorts
        //     }
        // );

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
    //
    // callDownload = () => {
    //     this.refs['pathwayscoreview'].downloadData();
    // };


    render() {


        let geneList = getGenesForPathways(this.props.pathways);

        // console.log('input gene data pathways',JSON.stringify(this.state.geneData.pathways),JSON.stringify(this.props.pathways),JSON.stringify(geneList))
        // console.log('raw input gene data pathways',this.state.geneData.pathways,this.props.pathways,geneList)
        // console.log('gene data stats',this.props.geneDataStats)
        // console.log('apps data state',this.state)
        // console.log('apps data propos',this.props.appData)

        let {renderHeight, renderOffset, cohortIndex,selectedCohort,cohortLabel,filter} = this.props;

        const selectedCohortData = getCohortDetails(selectedCohort);

        console.log('XGV selected cohort',selectedCohort,selectedCohortData)

        if (this.state.pathwayData) {
            return (
                <table>
                    <tbody>
                    {this.props.geneDataStats && this.props.geneDataStats.expression.rows && this.props.geneDataStats.expression.rows.length > 0 &&
                    <tr>
                        <td valign="top"
                            style={{paddingRight: 20, paddingLeft: 20, paddingTop: 0, paddingBottom: 0}}>
                            <Card style={{height: 300, width: style.gene.columnWidth, marginTop: 5}}>
                                <CohortSelector selectedCohort={selectedCohort}
                                                selectedSubCohorts={selectedCohort.selectedSubCohorts}
                                                onChange={this.selectCohort}
                                                onChangeSubCohort={this.selectSubCohort}
                                                cohortLabel={cohortLabel}
                                />
                                <FilterSelector selected={filter}
                                                pathwayData={this.props.geneDataStats}
                                                geneList={geneList}
                                                amplificationThreshold={selectedCohortData.amplificationThreshold}
                                                deletionThreshold={selectedCohortData.deletionThreshold}
                                                onChange={this.filterGeneType}
                                />
                                <HoverGeneView data={this.props.geneHoverData}
                                               cohortIndex={cohortIndex}
                                />
                            </Card>
                            {this.props.geneDataStats.pathways.length > MAX_GENE_WIDTH &&
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
                        <td style={{padding: 0}}>
                            <PathwayScoresView height={renderHeight}
                                               offset={renderOffset}
                                               data={this.props.geneDataStats}
                                               filter={this.props.filter}
                                               geneList={geneList}
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
                    </tr>
                        }
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

    // handleCohortData(input) {
    //     let {mutations, samples, copyNumber, genomeBackgroundMutation, genomeBackgroundCopyNumber, geneList, cohort} = input;
    //
    //     let pathwayData = {
    //         copyNumber,
    //         geneList,
    //         expression: mutations,
    //         pathways: this.props.pathways,
    //         cohort: cohort.name,
    //         samples,
    //         genomeBackgroundMutation,
    //         genomeBackgroundCopyNumber,
    //     };
    //     this.setState({
    //         pathwayData: pathwayData,
    //         processing: false,
    //     });
    //     if (this.state.selectedPathway.length > 0) {
    //         // console.log('XGV handleCohorTData',JSON.stringify(this.state.selectedPathway),JSON.stringify(this.state.pathwayClickData))
    //         this.setPathwayState(this.state.selectedPathway, this.state.pathwayClickData)
    //     } else {
    //         this.setState({
    //             geneData: {
    //                 copyNumber: [],
    //                 expression: [],
    //                 pathways: [],
    //                 samples: [],
    //             },
    //         });
    //     }
    //
    // }
}

XenaGoViewer.propTypes = {
    // appData: PropTypes.any.isRequired,
    selectedCohort: PropTypes.any.isRequired,
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
    pathwayData: PropTypes.any.isRequired,
    pathwaySelection: PropTypes.any.isRequired,

    geneHoverData: PropTypes.any.isRequired,
};
