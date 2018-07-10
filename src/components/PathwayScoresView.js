import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import CanvasDrawing from "../CanvasDrawing";
import DrawFunctions from '../functions/DrawFunctions';
import {partition, sumInstances} from '../functions/util';
import spinner from './ajax-loader.gif';
import SVGLabels from "./SVGLabels";
import {hierarchicalSort, clusterSort, synchronizedSort, synchronizedGeneSetSort} from '../functions/SortFunctions';
import {pruneColumns, associateData} from '../functions/DataFunctions';
import {isEqual, omit,memoize, pick, pluck, flatten, sum, range, times} from 'underscore';


const REFERENCE_LABEL_HEIGHT = 150;
const GENE_LABEL_HEIGHT = 50;

const style = {
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
        backgroundColor: 'white'
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

let tissueIndexFromY = (y, height, labelHeight, count) =>
    y < labelHeight ? -1 :
        Math.trunc((y - labelHeight) * count / (height - labelHeight));

let pathwayIndexFromX = (x, layout) =>
    layout.findIndex(({start, size}) => start <= x && x < start + size);

function getPointData(event, props) {
    let {associateData, height, layout, referenceLayout, data: {referencePathways, pathways, samples, sortedSamples}} = props;
    let metaSelect = event.metaKey;

    // if reference pathways and layouts exists
    if (referenceLayout && referencePathways) {
        let {x, y} = getMousePos(event);
        let tissueIndex = tissueIndexFromY(y, height, REFERENCE_LABEL_HEIGHT, samples.length);
        let pathwayIndex;
        let expression;
        // if the tissue index is less than 0, it is a reference pathway
        // is a reference pathway
        if (tissueIndex < 0) {
            pathwayIndex = pathwayIndexFromX(x, referenceLayout);
            expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);
            return {
                pathway: referencePathways[pathwayIndex],
                tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
                expression,
                metaSelect: metaSelect
            };
        }
        // if in the sample area, pull from the gene and sample area
        tissueIndex = tissueIndexFromY(y, height, REFERENCE_LABEL_HEIGHT + GENE_LABEL_HEIGHT, samples.length);
        pathwayIndex = pathwayIndexFromX(x, layout);
        expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);
        return {
            pathway: pathways[pathwayIndex],
            tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
            expression,
            metaSelect: metaSelect
        };

    }
    else {
        let {x, y} = getMousePos(event);
        let pathwayIndex = pathwayIndexFromX(x, layout);
        let tissueIndex = tissueIndexFromY(y, height, REFERENCE_LABEL_HEIGHT, samples.length);
        let expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);
        console.log('no ref ', tissueIndex, pathwayIndex, expression);

        return {
            pathway: pathways[pathwayIndex],
            tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
            expression,
            metaSelect: metaSelect
        };
    }

}


class PathwayScoresView extends PureComponent {

    constructor(props) {
        super(props);
    }

    onClick = (event) => {
        let {onClick, associateData} = this.props;
        if (associateData.length && onClick) {
            onClick(getPointData(event, this.props))
        }
    };

    onMouseOut = (event) => {
        let {onHover} = this.props;
        onHover(null);
    };

    onHover = (event) => {
        let {onHover} = this.props;
        if (onHover) {
            let pointData = getPointData(event, this.props);
            onHover(pointData);
        }
        else {
            onHover(null);
        }
    };


    render() {
        const {
            loading, width, height, layout, data, associateData, offset,
            titleText, selected, filter, referenceLayout, selectedPathways, hoveredPathways
        } = this.props;

        let titleString, filterString;
        if (selected) {
            titleString = selected.golabel + (selected.goid ? ' (' + selected.goid + ')' : '');
            filterString = filter.indexOf('All') === 0 ? '' : filter;
        }
        else {
            titleString = titleText ? titleText : '';
            filterString = filter.indexOf('All') === 0 ? '' : filter;
        }

        let stat = loading ? <img src={spinner}/> : null;

        return (
            <div ref='wrapper' className={style.wrapper} style={loading ? style.fadeOut : style.fadeIn}>
                {!this.props.hideTitle &&
                <h3>{titleString} {stat}</h3>
                }
                <CanvasDrawing
                    width={width}
                    height={height}
                    layout={layout}
                    referenceLayout={referenceLayout}
                    filter={filterString}
                    draw={DrawFunctions.drawTissueView}
                    selectedPathways={selectedPathways}
                    associateData={associateData}
                    data={data}
                />
                <SVGLabels
                    width={width}
                    height={height}
                    offset={offset}
                    layout={layout}
                    referenceLayout={referenceLayout}
                    selectedPathways={selectedPathways}
                    hoveredPathways={hoveredPathways}
                    associateData={associateData}
                    pathwayLabelHeight={REFERENCE_LABEL_HEIGHT}
                    geneLabelHeight={GENE_LABEL_HEIGHT}
                    data={data}
                    onClick={this.onClick}
                    onMouseMove={this.onHover}
                    onMouseOut={this.onMouseOut}
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
    selected: PropTypes.any,
    titleText: PropTypes.string,
    hideTitle: PropTypes.bool,
    referencePathways: PropTypes.any,
    selectedPathways: PropTypes.any,
    hoveredPathways: PropTypes.any,
    onClick: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    filter: PropTypes.any,
    selectedSort: PropTypes.any,
    synchronizeSort: PropTypes.any,
    cohortIndex: PropTypes.any,
};


let layout = (width, {length = 0} = {}) => partition(width, length);

const minWidth = 400;
const minColWidth = 12;

let associationDataHash = null;
let associationDataCache = null;

let pruneHash = null;
let pruneCache = null;

// let associationDataFunction = {};

function findAssociatedData(inputHash) {
    if (!isEqual(omit(associationDataHash,['cohortIndex']), omit(inputHash,['cohortIndex']))) {
        let {expression, copyNumber, geneList, pathways, samples, filter, min, cohortIndex, selectedCohort} = inputHash;
        associationDataCache = associateData(expression, copyNumber, geneList, pathways, samples, filter, min, cohortIndex, selectedCohort);
        associationDataHash = inputHash;
    }
    return associationDataCache;
}

function findPruneData(inputHash) {
    if (!isEqual(pruneHash, inputHash)) {
        let {associatedData, pathways, filterMin} = inputHash;
        pruneCache = pruneColumns(associatedData, pathways, filterMin);
        // associationDataCache = associateData(expression, copyNumber, geneList, pathways, samples, filter, min, cohortIndex, selectedCohort);
        pruneHash = inputHash;
    }
    return pruneCache;
}

export default class PathwayScoresViewCache extends PureComponent {


    render() {
        let {cohortIndex, selectedCohort, synchronizeSort,  selectedPathways, hoveredPathways, selectedSort, min, filter, geneList, filterPercentage, data: {expression, pathways, samples, copyNumber, referencePathways}} = this.props;

        let hashAssociation = {
            expression,
            copyNumber,
            geneList,
            pathways,
            samples,
            filter,
            min,
            cohortIndex,
            selectedCohort
        };
        // let associatedData = associateData(expression, copyNumber, geneList, pathways, samples, filter, min, cohortIndex, selectedCohort);
        let associatedData = findAssociatedData(hashAssociation);
        let filterMin = Math.trunc(filterPercentage * samples.length);

        let hashForPrune = {
            associatedData,
            pathways,
            filterMin
        };
        // let prunedColumns = pruneColumns(associatedData, pathways, filterMin);
        let prunedColumns = findPruneData(hashForPrune);
        prunedColumns.samples = samples;
        let returnedValue;



        if (cohortIndex === 0 || !synchronizeSort) {
            switch (selectedSort) {
                case 'Hierarchical':
                    returnedValue = hierarchicalSort(prunedColumns);
                    break;
                case 'Cluster':
                default:
                    returnedValue = clusterSort(prunedColumns);
                    break;
            }
            if (referencePathways) {
                PathwayScoresView.synchronizedGeneList = returnedValue.pathways.map(g => g.gene[0]);
            }
            else {
                PathwayScoresView.synchronizedGeneSetList = returnedValue.pathways.map(g => g.golabel);
            }
        }
        else {
            if (referencePathways) {
                returnedValue = synchronizedSort(prunedColumns, PathwayScoresView.synchronizedGeneList);
            }
            else {
                returnedValue = synchronizedGeneSetSort(prunedColumns, PathwayScoresView.synchronizedGeneSetList);
            }
        }
        returnedValue.index = cohortIndex;
        let width = Math.max(minWidth, minColWidth * returnedValue.pathways.length);

        // statGenerator(returnedValue);


        if (referencePathways) {
            let referenceWidth = Math.max(minWidth, minColWidth * referencePathways.length);
            let referenceLayout = layout(referenceWidth ? referenceWidth : 0, referencePathways);
            let layoutData = layout(width, returnedValue.data);
            return (
                <PathwayScoresView
                    {...this.props}
                    width={width}
                    layout={layoutData}
                    referenceLayout={referenceLayout}
                    hoveredPathways={hoveredPathways}
                    data={{
                        expression,
                        pathways: returnedValue.pathways,
                        referencePathways,
                        samples,
                        selectedPathways,
                        sortedSamples: returnedValue.sortedSamples
                    }}
                    associateData={returnedValue.data}/>
            );
        }
        else {
            return (
                <PathwayScoresView
                    {...this.props}
                    width={width}
                    layout={layout(width, returnedValue.data)}
                    hoveredPathways={hoveredPathways}
                    data={{
                        expression,
                        pathways: returnedValue.pathways,
                        samples,
                        selectedPathways,
                        sortedSamples: returnedValue.sortedSamples,
                    }}
                    associateData={returnedValue.data}/>
            );
        }
    }


}
