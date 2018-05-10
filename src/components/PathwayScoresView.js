import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import CanvasDrawing from "../CanvasDrawing";
import ScoreFunctions from '../functions/ScoreFunctions';
import mutationScores from '../data/mutationVector';
import {times, memoize, range} from 'underscore';
import {partition, sum, sumInstances} from '../functions/util';
import spinner from './ajax-loader.gif';
import {pick, pluck, flatten} from 'underscore';
import {getCopyNumberValue} from "../functions/ScoreFunctions";
import SVGLabels from "./SVGLabels";
import {overallSort,densitySort,hierarchicalSort,clusterSort} from '../functions/SortFunctions';


const REFERENCE_LABEL_HEIGHT = 150;

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
        console.log("No pathway data at " + pathwayIndex + " for " + associateData.length);
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

    // if reference pathways and layouts exists
    if (referenceLayout && referencePathways) {
        let {x, y} = getMousePos(event);
        let tissueIndex = tissueIndexFromY(y, height, REFERENCE_LABEL_HEIGHT, samples.length);
        let pathwayIndex;
        let expression;
        // if a reference pathway
        if (tissueIndex < 0) {
            pathwayIndex = pathwayIndexFromX(x, referenceLayout);
            expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);
            return {
                pathway: referencePathways[pathwayIndex],
                tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
                expression
            };
        }
        tissueIndex = tissueIndexFromY(y, height, REFERENCE_LABEL_HEIGHT * 2, samples.length);
        pathwayIndex = pathwayIndexFromX(x, layout);
        expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);

        return {
            pathway: pathways[pathwayIndex],
            tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
            expression
        };

    }
    else {
        let {x, y} = getMousePos(event);
        let pathwayIndex = pathwayIndexFromX(x, layout);
        let tissueIndex = tissueIndexFromY(y, height, REFERENCE_LABEL_HEIGHT, samples.length);
        let expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);

        return {
            pathway: pathways[pathwayIndex],
            tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
            expression
        };
    }

}


class TissueExpressionView extends PureComponent {

    constructor(props) {
        super(props);
    }

    onClick = (event) => {
        let {onClick, associateData} = this.props;
        if (associateData.length && onClick) {
            onClick(getPointData(event, this.props))
        }
    };

    onHover = (event) => {
        let {onHover} = this.props;
        if (onHover) {
            onHover(getPointData(event, this.props));
        }
    };

    render() {
        const {
            loading, width, height, layout, data, associateData,
            titleText, selected, filter, referenceLayout, selectedPathways
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
                    draw={ScoreFunctions.drawTissueView}
                    selectedPathways={selectedPathways}
                    associateData={associateData}
                    data={data}
                />
                <SVGLabels
                    width={width}
                    height={height}
                    layout={layout}
                    referenceLayout={referenceLayout}
                    drawOverlay={ScoreFunctions.drawTissueOverlay}
                    selectedPathways={selectedPathways}
                    associateData={associateData}
                    data={data}
                    onClick={this.onClick}
                    onMouseMove={this.onHover}
                />
            </div>
        );
    }
}

TissueExpressionView.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    selected: PropTypes.any,
    titleText: PropTypes.string,
    hideTitle: PropTypes.bool,
    referencePathways: PropTypes.any,
    selectedPathways: PropTypes.any,
    onClick: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    filter: PropTypes.any,
    selectedSort: PropTypes.any,
    id: PropTypes.any,
};

/**
 * https://github.com/nathandunn/XenaGoWidget/issues/5
 * https://github.com/ucscXena/ucsc-xena-client/blob/master/js/models/mutationVector.js#L67
 Can use the scores directly or just count everything that is 4-2, and lincRNA, Complex Substitution, RNA which are all 0.
 * @param effect
 * @param min
 * @returns {*}
 */
function getMutationScore(effect, min) {
    return (mutationScores[effect] >= min) ? 1 : 0;
    // return mutationScores[effect]
}

let getGenePathwayLookup = pathways => {
    let sets = pathways.map(p => new Set(p.gene)),
        idxs = range(sets.length);
    return memoize(gene => idxs.filter(i => sets[i].has(gene)));
};

function pruneColumns(data, pathways, min) {
    let columnScores = data.map(sum);

    let prunedPathways = pathways.filter((el, i) => columnScores[i] >= min);
    let prunedAssociations = data.filter((el, i) => columnScores[i] >= min);

    return {
        'data': prunedAssociations,
        'pathways': prunedPathways
    };
}


/**
 * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
 *
 * @param expression
 * @param copyNumber
 * @param geneList
 * @param pathways
 * @param samples
 * @param filter
 * @param min
 * @returns {any[]}
 */
function associateData(expression, copyNumber, geneList, pathways, samples, filter, min) {
    filter = filter.indexOf('All') === 0 ? '' : filter;
    let returnArray = times(pathways.length, () => times(samples.length, () => 0))
    let sampleIndex = new Map(samples.map((v, i) => [v, i]));
    let genePathwayLookup = getGenePathwayLookup(pathways);

    // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
    if (!filter || filter === 'Mutation') {
        for (let row of expression.rows) {
            let effectValue = getMutationScore(row.effect, min);
            let pathwayIndices = genePathwayLookup(row.gene);

            for (let index of pathwayIndices) {
                returnArray[index][sampleIndex.get(row.sample)] += effectValue;
            }
        }
    }


    if (!filter || filter === 'Copy Number') {

        // get list of genes in identified pathways
        for (let gene of geneList) {
            // if we have not processed that gene before, then process
            let geneIndex = geneList.indexOf(gene);

            let pathwayIndices = genePathwayLookup(gene);
            let sampleEntries = copyNumber[geneIndex]; // set of samples for this gene
            // we retrieve proper indices from the pathway to put back in the right place

            // get pathways this gene is involved in
            for (let index of pathwayIndices) {
                // process all samples
                for (let sampleEntryIndex in sampleEntries) {
                    let returnValue = getCopyNumberValue(sampleEntries[sampleEntryIndex]);
                    if (returnValue > 0) {
                        returnArray[index][sampleEntryIndex] += returnValue;
                    }
                }
            }
        }

    }

    return returnArray;
}



let layout = (width, {length = 0} = {}) => partition(width, length);

const minWidth = 400;
const minColWidth = 12;

export default class AssociatedDataCache extends PureComponent {
    render() {
        let {selectedPathways, selectedSort, min, filter, geneList, filterPercentage, data: {expression, pathways, samples, copyNumber, referencePathways}} = this.props;
        let associatedData = associateData(expression, copyNumber, geneList, pathways, samples, filter, min);

        let filterMin = Math.trunc(filterPercentage * samples.length);

        let prunedColumns = pruneColumns(associatedData, pathways, filterMin);
        prunedColumns.samples = samples;
        let width = Math.max(minWidth, minColWidth * prunedColumns.pathways.length);
        let returnedValue;

        switch (selectedSort) {
            case 'Overall':
                returnedValue = overallSort(prunedColumns);
                break;
            case 'Hierarchical':
                returnedValue = hierarchicalSort(prunedColumns);
                break;
            case 'Cluster':
            default:
                returnedValue = clusterSort(prunedColumns);
                break;
        }

        if (referencePathways) {
            let referenceWidth = Math.max(minWidth, minColWidth * referencePathways.length);
            let referenceLayout = layout(referenceWidth ? referenceWidth : 0, referencePathways);
            let layoutData = layout(width, returnedValue.data);
            return (
                <TissueExpressionView
                    {...this.props}
                    width={width}
                    layout={layoutData}
                    referenceLayout={referenceLayout}
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
                <TissueExpressionView
                    {...this.props}
                    width={width}
                    layout={layout(width, returnedValue.data)}
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
