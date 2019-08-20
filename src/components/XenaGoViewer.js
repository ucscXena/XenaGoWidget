import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from "./CohortSelector";
import PathwayScoresView from "./PathwayScoresView";
import '../css/base.css';
import HoverGeneView from "./HoverGeneView";
import {FilterSelector} from "./FilterSelector";

import {Card,Button} from "react-toolbox";

import {MAX_GENE_LAYOUT_WIDTH_PX, MAX_GENE_WIDTH, MIN_GENE_WIDTH_PX} from "./XenaGeneSetApp";
import {DetailedLegend} from "./DetailedLegend";
import {
    getCohortDetails,
    getGenesForPathways,
} from "../functions/CohortFunctions";
import {DEFAULT_DATA_VALUE} from "../functions/DataFunctions";
import {partition} from "../functions/MathFunctions";
const MIN_WIDTH = 400;
const MIN_COL_WIDTH = 12;

let layout = (width, {length = 0} = {}) => partition(width, length);

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
        // this.state = {
        //     processing : true,
        //     loadState : 'Loading',
        //     hoveredPathway : undefined ,
        //     selectedCohortData : undefined,
        //     highlightedGene : props.highlightedGene,
        //     pathwayData : props.pathwayData,
        // };
    }


    hoverGene = (geneHoverProps) => {
        if (geneHoverProps) {
            geneHoverProps.cohortIndex = this.props.cohortIndex;

            // TODO: remove this and see how it performs
            if(geneHoverProps.expression===undefined){
                geneHoverProps.expression = DEFAULT_DATA_VALUE;
            }
            geneHoverProps.expression.samplesAffected = geneHoverProps.pathway.samplesAffected
        }
        this.props.geneHover(geneHoverProps);

    };

    filterGeneType = (filter) => {
        this.props.changeFilter(filter,this.props.cohortIndex);
    };

    selectCohort = (selected) => {
        this.props.changeCohort(selected,this.props.cohortIndex);
    };

    selectSubCohort = (subCohortSelected) => {
        this.props.changeSubCohort(subCohortSelected,this.props.cohortIndex);
    };

    render() {
        let geneList = getGenesForPathways(this.props.pathways);

        let {renderHeight, renderOffset, cohortIndex,selectedCohort,cohortLabel,filter,
            geneDataStats, geneHoverData, setCollapsed , collapsed,
            highlightedGene, colorSettings, showDiffLayer, showDetailLayer,
            pathwayData,
        } = this.props;

        // let { processing, pathwayData } = this.state ;
        let genesInGeneSet = geneDataStats.data.length;
        let calculatedWidth;
        if (genesInGeneSet < 8) {
            calculatedWidth = genesInGeneSet * MIN_GENE_WIDTH_PX;
        } else if (genesInGeneSet > 85 && collapsed) {
            calculatedWidth = MAX_GENE_LAYOUT_WIDTH_PX;
        } else {
            calculatedWidth = Math.max(MIN_WIDTH, MIN_COL_WIDTH * geneDataStats.pathways.length);
        }

        let layoutData = layout(calculatedWidth, geneDataStats.data);
        const selectedCohortData = getCohortDetails(selectedCohort);

        if (pathwayData) {
            return (
                <table>
                    <tbody>
                    {geneDataStats && geneDataStats.expression.rows && geneDataStats.expression.rows.length > 0 &&
                    <tr>
                        <td valign="top"
                            style={{paddingRight: 20, paddingLeft: 20, paddingTop: 0, paddingBottom: 0}}>
                            <Card style={{height: 300, width: style.gene.columnWidth, marginTop: 5}}>
                                <CohortSelector selectedCohort={selectedCohort}
                                                // selectedSubCohorts={selectedCohort.selectedSubCohorts}
                                                onChange={this.selectCohort}
                                                onChangeSubCohort={this.selectSubCohort}
                                                cohortLabel={cohortLabel}
                                />
                                <FilterSelector selected={filter}
                                                pathwayData={geneDataStats}
                                                geneList={geneList}
                                                amplificationThreshold={selectedCohortData.amplificationThreshold}
                                                deletionThreshold={selectedCohortData.deletionThreshold}
                                                onChange={this.filterGeneType}
                                />
                                <HoverGeneView data={geneHoverData}
                                               cohortIndex={cohortIndex}
                                />
                            </Card>
                            {geneDataStats.pathways.length > MAX_GENE_WIDTH &&
                            <Card style={{height: 30, width: style.gene.columnWidth, marginTop: 5}}>
                                {collapsed &&
                                <Button icon='chevron_right' flat primary
                                        onClick={() => setCollapsed(false)}>Expand</Button>
                                }
                                {!collapsed &&
                                <Button icon='chevron_left'
                                        onClick={() => setCollapsed(true)}>Collapse</Button>
                                }
                            </Card>
                            }
                            <DetailedLegend/>
                        </td>
                        <td style={{padding: 0}}>
                            <PathwayScoresView height={renderHeight}
                                               offset={renderOffset}
                                               dataStats={geneDataStats}
                                               filter={filter}
                                               geneList={geneList}
                                               highlightedGene={highlightedGene}
                                               onHover={this.hoverGene}
                                               cohortIndex={cohortIndex}
                                               colorSettings={colorSettings}
                                               collapsed={collapsed}
                                               showDiffLayer={showDiffLayer}
                                               showDetailLayer={showDetailLayer}
                                               calculatedWidth={calculatedWidth}
                                               layoutData={layoutData}
                            />
                        </td>
                    </tr>
                        }
                    </tbody>
                </table>
            )
        }

        // return (
        //     <Dialog active={processing} title='Loading'>
        //         {selectedCohort}
        //     </Dialog>
        // );
    }
}

XenaGoViewer.propTypes = {
    selectedCohort: PropTypes.any.isRequired,
    renderHeight: PropTypes.any.isRequired,
    renderOffset: PropTypes.any.isRequired,
    pathways: PropTypes.any.isRequired,
    geneHover: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    geneDataStats: PropTypes.any.isRequired,
    highlightedGene: PropTypes.any, // optional
    setCollapsed: PropTypes.any,
    collapsed: PropTypes.any,
    showDiffLayer: PropTypes.any,
    showDetailLayer: PropTypes.any,


    cohortLabel: PropTypes.any.isRequired,
    pathwayData: PropTypes.any.isRequired,
    pathwaySelection: PropTypes.any.isRequired,

    geneHoverData: PropTypes.any.isRequired,
};
