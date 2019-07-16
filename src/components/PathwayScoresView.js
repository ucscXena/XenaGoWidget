import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import CanvasDrawing from "./CanvasDrawing";
import DrawFunctions from '../functions/DrawFunctions';
import {partition, sumInstances, sumTotals} from '../functions/util';
import LabelWrapper from "./LabelWrapper";
import {
    clusterSort, diffSort, scoreColumns,
    synchronizedSort
} from '../functions/SortFunctions';
import {createAssociatedDataKey,  findAssociatedData, findPruneData} from '../functions/DataFunctions';
import {FILTER_PERCENTAGE, MAX_GENE_LAYOUT_WIDTH_PX, MIN_GENE_WIDTH_PX} from "./XenaGeneSetApp";
import update from "immutability-helper";


export const GENE_LABEL_HEIGHT = 50;
const UP_BUFFER = -3;
const DOWN_BUFFER = 1;

const style = {
    xenaGoView: {
        opacity: 1,
        // border: 'solid black 0.5px',
        boxShadow: '0 0 2px 2px #ccc '
    },
    fadeIn: {
        opacity: 1,
        transition: 'opacity 0.5s ease-out'
    }
    , fadeOut: {
        opacity: 0.6,
        transition: 'opacity 1s ease'
    }
    , wrapper: {
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        backgroundColor: '#F7FFF7'
    }
};

function getMousePos(evt) {
    let rect = evt.currentTarget.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getExpressionForDataPoint(pathwayIndex, tissueIndex, associatedData) {
    let pathwayArray = associatedData[pathwayIndex];
    if (!pathwayArray) {
        return 0;
    }

    return (tissueIndex < 0) ? {affected: sumInstances(pathwayArray), total: associatedData[0].length} : // pathway
        pathwayArray[tissueIndex]; // sample
}

let tissueIndexFromY = (y, height, labelHeight, count, cohortIndex) => {
    let index = 0;
    switch (cohortIndex) {
        case 0:
            index = y <= (height - (labelHeight + UP_BUFFER)) ? Math.trunc((height - labelHeight - y) * count / (height - (labelHeight + UP_BUFFER))) : -1;
            break;
        case 1:
            index = y < (labelHeight + DOWN_BUFFER) ? -1 : Math.trunc((y - (labelHeight + DOWN_BUFFER)) * count / (height - (labelHeight + DOWN_BUFFER)));
            break;
        default:
            console.log('error', y, height, labelHeight, count, cohortIndex, UP_BUFFER)

    }
    return index;
};

let pathwayIndexFromX = (x, layout) => {
    let pathwayIndex = layout.findIndex(({start, size}) => start <= x && x < start + size);
    let layoutInstance = layout[pathwayIndex];
    if (layoutInstance) {
        let layoutMiddle = Math.round(layoutInstance.start + (layoutInstance.size / 2.0));
        return {pathwayIndex: pathwayIndex, selectCnv: x < layoutMiddle};
    } else {
        return {pathwayIndex: pathwayIndex, selectCnv: false};
    }
};

function getPointData(event, props) {
    let {associateData, height, layout, cohortIndex, data: {pathways, samples, sortedSamples}} = props;
    let {x, y} = getMousePos(event);
    let {pathwayIndex, selectCnv} = pathwayIndexFromX(x, layout);
    let tissueIndex = tissueIndexFromY(y, height, GENE_LABEL_HEIGHT, samples.length, cohortIndex);
    let expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);
    return {
        pathway: pathways[pathwayIndex],
        tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
        expression: expression,
        selectCnv: selectCnv
    };
}

class PathwayScoresView extends PureComponent {

    constructor(props) {
        super(props);
    }

    onMouseOut = () => {
        let {onHover} = this.props;
        onHover(null);
    };

    onHover = (event) => {
        let {onHover} = this.props;
        let pointData = getPointData(event, this.props);
        if (pointData) {
            onHover(pointData);
        } else {
            onHover(null);
        }
    };

    componentDidMount() {
        // this supp
        const {
            data, cohortIndex, shareGlobalGeneData,
        } = this.props;
        shareGlobalGeneData(data.pathways, cohortIndex);
    }


    render() {
        const {
            width, height, layout, data, associateData, offset, cohortIndex,
            selectedPathways, colorSettings, highlightedGene,
            viewType, showDetailLayer
        } = this.props;

        return (
            <div ref='wrapper' style={style.xenaGoView}>
                {showDetailLayer &&
                <CanvasDrawing
                    width={width}
                    height={height}
                    layout={layout}
                    draw={DrawFunctions.drawGeneView}
                    selectedPathways={selectedPathways}
                    associateData={associateData}
                    cohortIndex={cohortIndex}
                    data={data} // updated data forces refresh
                    viewType={viewType}
                />
                }
                <LabelWrapper
                    width={width}
                    height={height}
                    offset={offset}
                    layout={layout}
                    selectedPathways={selectedPathways}
                    highlightedGene={highlightedGene}
                    associateData={associateData}
                    geneLabelHeight={GENE_LABEL_HEIGHT}
                    data={data}
                    onMouseMove={this.onHover}
                    onMouseOut={this.onMouseOut}
                    cohortIndex={cohortIndex}
                    colorSettings={colorSettings}
                    showDiffLayer={this.props.showDiffLayer}
                />
            </div>
        );
    }
}

PathwayScoresView.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    selected: PropTypes.any.isRequired,
    selectedPathways: PropTypes.any.isRequired,
    hoveredPathways: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    filter: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    shareGlobalGeneData: PropTypes.any.isRequired,
    highlightedGene: PropTypes.any,
    colorSettings: PropTypes.any,
    showDiffLayer: PropTypes.any,
    showDetailLayer: PropTypes.any,
};


let layout = (width, {length = 0} = {}) => partition(width, length);

const minWidth = 400;
const minColWidth = 12;

let internalData = undefined;

export default class PathwayScoresViewCache extends PureComponent {


    downloadData() {
        if (!internalData) {
            alert('No Data Available');
            return;
        }
        let {cohortIndex, selectedCohort, selectedPathways,} = this.props;
        let filename = selectedCohort.name.replace(/ /g, '_') + '_' + selectedPathways[0] + '_' + cohortIndex + '.json';
        // let filename = "export.json";
        let contentType = "application/json;charset=utf-8;";
        // a hacky way to do this
        let a = document.createElement('a');
        a.download = filename;
        a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(internalData));
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


    render() {
        let {showClusterSort, cohortIndex, shareGlobalGeneData, selectedCohort, selectedPathways,  min, filter, collapsed, geneList, data: {expression, pathways, samples, copyNumber}} = this.props;

        let hashAssociation = {
            expression,
            copyNumber,
            geneList,
            pathways,
            samples,
            filter,
            min,
            selectedCohort,
            cohortIndex,
        };
        if (expression === undefined || expression.length === 0) {
            return <div>Loading...</div>
        }

        let associatedDataKey = createAssociatedDataKey(hashAssociation);
        let associatedData = findAssociatedData(hashAssociation,associatedDataKey);
        let prunedColumns = findPruneData(associatedData,associatedDataKey);
        prunedColumns.samples = samples;

       let calculatedPathways = scoreColumns(prunedColumns);
       let returnedValue = update(prunedColumns, {
           pathways:{$set:calculatedPathways},
           index:{$set:cohortIndex},
       });

        // set affected versus total
        let samplesLength = returnedValue.data[0].length;
        for (let d in returnedValue.data) {
            returnedValue.pathways[d].total = samplesLength;
            returnedValue.pathways[d].affected = sumTotals(returnedValue.data[d]);
            returnedValue.pathways[d].samplesAffected = sumInstances(returnedValue.data[d]);
        }


        // send it to calculate the diffScores
        /// TODO: maybe have it ONLY calcualte the diff scores?
        this.props.shareGlobalGeneData(returnedValue.pathways, cohortIndex);

        if(!showClusterSort && returnedValue.pathways[0].diffScore){
            returnedValue = diffSort(returnedValue,cohortIndex!==0);
        }
        else if (showClusterSort){
            if (cohortIndex === 0) {
                returnedValue = clusterSort(returnedValue);
                PathwayScoresView.synchronizedGeneList = returnedValue.pathways.map(g => g.gene[0]);
            } else {
                PathwayScoresView.synchronizedGeneList = PathwayScoresView.synchronizedGeneList ? PathwayScoresView.synchronizedGeneList : [];
                returnedValue = synchronizedSort(returnedValue, PathwayScoresView.synchronizedGeneList);
            }
        }

        internalData = returnedValue.data;

        // this will go last
        // fix for #194
        let genesInGeneSet = returnedValue.data.length;
        let width;
        if (genesInGeneSet < 8) {
            width = genesInGeneSet * MIN_GENE_WIDTH_PX;
        } else if (genesInGeneSet > 85 && collapsed) {
            width = MAX_GENE_LAYOUT_WIDTH_PX;
        } else {
            width = Math.max(minWidth, minColWidth * returnedValue.pathways.length);
        }

        let layoutData = layout(width, returnedValue.data);


        return (
            <PathwayScoresView
                {...this.props}
                width={width}
                layout={layoutData}
                shareGlobalGeneData={shareGlobalGeneData}
                data={{
                    expression,
                    pathways: returnedValue.pathways,
                    samples,
                    selectedPathways,
                    sortedSamples: returnedValue.sortedSamples
                }}
                associateData={returnedValue.data}/>
        );
    }


}
