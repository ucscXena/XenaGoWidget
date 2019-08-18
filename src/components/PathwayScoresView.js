import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import CanvasDrawing from "./CanvasDrawing";
import DrawFunctions from '../functions/DrawFunctions';
import {sumInstances} from '../functions/MathFunctions';
import LabelWrapper from "./LabelWrapper";


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

function getPointData(event, layout, associatedData, sortedSamples, pathways, height, cohortIndex) {
    let {x, y} = getMousePos(event);
    let {pathwayIndex, selectCnv} = pathwayIndexFromX(x, layout);
    let tissueIndex = tissueIndexFromY(y, height, GENE_LABEL_HEIGHT, sortedSamples.length, cohortIndex);
    let expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associatedData);
    return {
        pathway: pathways[pathwayIndex],
        tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
        expression: expression,
        selectCnv: selectCnv
    };
}


export default class PathwayScoresView extends PureComponent {

    constructor(props) {
        super(props);
    }


    onMouseOut = () => {
        let {onHover} = this.props;
        onHover(null);
    };

    onHover = (event) => {
        let {onHover,data,height,cohortIndex,layoutData,sortedSamples, returnedPathways} = this.props;
        let pointData = getPointData(event, layoutData, data, sortedSamples, returnedPathways, height, cohortIndex);
        if (pointData) {
            onHover(pointData);
        } else {
            onHover(null);
        }
    };

    render() {
        const {
            height, data, offset, cohortIndex,
            colorSettings, highlightedGene,
            showDetailLayer, calculatedWidth,
            showDiffLayer, layoutData, returnedPathways,
            sortedSamples

        } = this.props;

        return (
            <div style={style.xenaGoView}>
                {showDetailLayer &&
                <CanvasDrawing
                    width={calculatedWidth}
                    height={height}
                    layout={layoutData}
                    draw={DrawFunctions.drawGeneView}
                    associatedData={data}
                    cohortIndex={cohortIndex}
                />
                }
                <LabelWrapper
                    width={calculatedWidth}
                    height={height}
                    offset={offset}
                    layout={layoutData}
                    highlightedGene={highlightedGene}
                    geneLabelHeight={GENE_LABEL_HEIGHT}
                    numSamples={sortedSamples.length}
                    pathways={returnedPathways}
                    onMouseMove={this.onHover}
                    onMouseOut={this.onMouseOut}
                    cohortIndex={cohortIndex}
                    colorSettings={colorSettings}
                    showDiffLayer={showDiffLayer}
                />
            </div>
        );
    }
}

PathwayScoresView.propTypes = {
    height: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    onHover: PropTypes.any.isRequired,
    filter: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    // shareGlobalGeneData: PropTypes.any.isRequired,
    highlightedGene: PropTypes.any,
    colorSettings: PropTypes.any,
    showDiffLayer: PropTypes.any,
    showDetailLayer: PropTypes.any,

    calculatedWidth: PropTypes.any.isRequired,
    layoutData: PropTypes.any.isRequired,
    sortedSamples: PropTypes.any.isRequired,
    returnedPathways: PropTypes.any.isRequired,
};


