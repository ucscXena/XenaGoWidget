import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import CanvasDrawing from "../CanvasDrawing";
import ScoreFunctions from '../functions/ScoreFunctions';
import mutationScores from '../data/mutationVector';
import {memoize, range} from 'underscore';
import {partition, sum, sumInstances} from '../functions/util';
import spinner from './ajax-loader.gif';
import {pick, pluck, flatten} from 'underscore';
import {getCopyNumberValue} from "../functions/ScoreFunctions";
import cluster from '../functions/Cluster';
import SVGLabels from "./SVGLabels";


const REFERENCE_LABEL_HEIGHT = 150;

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

class TissueExpressionView extends PureComponent {

    constructor(props) {
        super(props);
        console.log('constructor');
        console.log(props)
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

    let prunedPathways = pathways.filter( (el,i) => columnScores[i]>=min );
    let prunedAssociations = data.filter( (el,i) => columnScores[i]>=min );

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
    let returnArray = new Array(pathways.length);
    for (let p in pathways) {
        returnArray[p] = new Array(samples.length);
        for (let s in samples) {
            returnArray[p][s] = 0;
        }
    }

    let sampleIndex = new Map(samples.map((v, i) => [v, i]));
    let genePathwayLookup = getGenePathwayLookup(pathways);

    // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
    if (!filter || filter === 'Mutation') {
        for (let row of expression.rows) {
            let gene = row.gene;
            let effect = row.effect;
            let effectValue = getMutationScore(effect, min);
            // let effectValue = (!filter || effect === filter) ? getMutationScore(effect, min) : 0;
            let pathwayIndices = genePathwayLookup(gene);

            for (let index of pathwayIndices) {
                returnArray[index][sampleIndex.get(row.sample)] += effectValue;
            }
        }
    }


    if (!filter || filter === 'Copy Number') {

        let processedGenes = [];

        for (let pathwayIndex in pathways) {
            let p = pathways[pathwayIndex];
            for (let gene of p.gene) {
                if (processedGenes.indexOf(gene) < 0) {
                    let geneIndex = geneList.indexOf(gene);

                    let pathwayIndices = genePathwayLookup(gene);
                    let sampleEntries = copyNumber[geneIndex]; // set of samples for this gene
                    // we retrieve proper indices from the pathway to put back in the right place
                    for (let index of pathwayIndices) {
                        for (let sampleEntryIndex in sampleEntries) {
                            let returnValue = getCopyNumberValue(sampleEntries[sampleEntryIndex]);
                            if (returnValue > 0) {
                                returnArray[index][sampleEntryIndex] += returnValue;
                            }
                        }
                    }
                    processedGenes.push(gene)
                }
            }


        }

    }

    return returnArray;
}

function transpose(a) {
    // return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });
    // or in more modern dialect
    return a.length === 0 ? a : a[0].map((_, c) => a.map(r => r[c]));
}

// Euclidean distance
function distance(a, b) {
    let d = 0;
    for (let i = 0; i < a.length; i++) {
        d += Math.abs(a[i] - b[i]);
        // d += sum ;
        // d += Math.pow(a[i] - b[i], 2);
    }
    // return Math.sqrt(d);
    return d;
}

function linkage(distances) {
// Single-linkage clustering
//     return Math.min.apply(null, distances);
    // complete-linkage clustering?
    let max = 0;
    for (let d of distances) {
        max = d > max ? d : max;
    }
    return max;
}

/**
 * Populates density for each column
 * @param prunedColumns
 */
function sortColumnHierarchical(prunedColumns) {
    for (let index = 0; index < prunedColumns.pathways.length; ++index) {
        prunedColumns.pathways[index].density = sumInstances(prunedColumns.data[index]);
        prunedColumns.pathways[index].index = index;
    }


    let levels = cluster({
        input: prunedColumns.data,
        distance: distance,
        linkage: linkage,
    });

    let clusterIndices = levels[levels.length - 1].clusters[0];

    let renderedArray = [];
    let renderedIndices = [];
    for (let index = 0; index < clusterIndices.length; ++index) {
        renderedArray[index] = prunedColumns.data[clusterIndices[index]];
        renderedIndices[index] = prunedColumns.pathways[clusterIndices[index]];
    }
    prunedColumns.data = renderedArray;
    prunedColumns.pathways = renderedIndices;

}

/**
 * Populates density for each column
 * @param prunedColumns
 */
function scoreColumnDensities(prunedColumns) {

    let sortedPathways = prunedColumns.pathways.map( (el,index) => {
        let pathway = JSON.parse(JSON.stringify(el));
        pathway.density = sumInstances(prunedColumns.data[index]);
        pathway.index = index ;
        return pathway;
    }) ;

    let sortedColumns = {};
    sortedColumns.pathways = sortedPathways;
    sortedColumns.samples = prunedColumns.samples;
    sortedColumns.data = prunedColumns.data;

    // for (let index = 0; index < prunedColumns.pathways.length; ++index) {
    //     prunedColumns.pathways[index].density = sumInstances(prunedColumns.data[index]);
    //     prunedColumns.pathways[index].index = index;
    // }

    sortedColumns.pathways.sort((a, b) => b.density - a.density);

    // refilter data by index
    let renderedArray = [];
    for (let index = 0; index < sortedColumns.pathways.length; ++index) {
        renderedArray[index] = sortedColumns.data[sortedColumns.pathways[index].index];

    }
    sortedColumns.data = renderedArray;
    sortedColumns.samples = prunedColumns.samples;

    console.log('abcd')
    console.log(prunedColumns)
    console.log(sortedColumns)

    return sortedColumns;
}

/**
 * Sort by column density followed by row.
 * https://github.com/nathandunn/XenaGoWidget/issues/67
 *
 * 1. find density for each column
 * 2. sort the tissues based on first, most dense column, ties, based on next most dense column
 *
 * 3. sort / re-order column based on density (*) <- re-ordering is going to be a pain, do last
 *
 * @param prunedColumns
 * @returns {undefined}
 */
function clusterSort(prunedColumns) {
    let sortedColumns = scoreColumnDensities(prunedColumns);
    console.log('cluster sort vs');
    // console.log(sortedColumns);
    console.log(prunedColumns);

    sortedColumns.data.push(prunedColumns.samples);
    let renderedData = transpose(sortedColumns.data);

    renderedData = renderedData.sort(function (a, b) {
        for (let index = 0; index < a.length; ++index) {
            if (a[index] !== b[index]) {
                return b[index] - a[index];
            }
        }
        return sum(b) - sum(a)
    });
    renderedData = transpose(renderedData);
    let returnColumns = {};
    returnColumns.sortedSamples = renderedData[renderedData.length - 1];
    returnColumns.samples = sortedColumns.samples;
    returnColumns.pathways = sortedColumns.pathways;
    returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);

    return returnColumns;
}

function hierarchicalSort(prunedColumns) {
    sortColumnHierarchical(prunedColumns);

    let inputData = transpose(prunedColumns.data);
    prunedColumns.data.push(prunedColumns.samples);
    let renderedData = transpose(prunedColumns.data);


    let levels = cluster({
        input: inputData,
        distance: distance,
        linkage: linkage,
    });

    let clusters = levels[levels.length - 1].clusters[0];

    let returnData = [];
    for (let cIndex in clusters) {
        returnData[cIndex] = renderedData[clusters[cIndex]];
    }


    renderedData = transpose(returnData);

    let returnColumns = {};
    returnColumns.sortedSamples = renderedData[renderedData.length - 1];
    returnColumns.samples = prunedColumns.samples;
    returnColumns.pathways = prunedColumns.pathways;
    returnColumns.data = renderedData.slice(0, prunedColumns.data.length - 1);

    return returnColumns;
}

function densitySort(prunedColumns) {
    let returnColumns = JSON.parse(JSON.stringify(prunedColumns));
    returnColumns.data.push(returnColumns.samples);
    let renderedData = transpose(returnColumns.data);

    renderedData = renderedData.sort((a, b) => {
        for (let index = 0; index < a.length; ++index) {
            if (a[index] !== b[index]) {
                return b[index] - a[index];
            }
        }
        return sum(b) - sum(a)
    });

    renderedData = transpose(renderedData);

    returnColumns.sortedSamples = renderedData[renderedData.length - 1];
    // returnColumns.samples = returnColumns.samples;
    // returnColumns.pathways = returnColumns.pathways;
    returnColumns.data = renderedData.slice(0, returnColumns.data.length - 1);

    return returnColumns;
}

function overallSort(prunedColumns) {
    let sortedColumns = scoreColumnDensities(prunedColumns);

    let renderedData = transpose(sortedColumns.data);

    renderedData = renderedData.sort(function (a, b) {
        return sum(b) - sum(a)
    });

    renderedData = transpose(renderedData);

    let returnColumns = {};

    returnColumns.data = renderedData;

    return returnColumns;
}


let layout = (width, {length = 0} = {}) => partition(width, length);

let minWidth = 400;
let minColWidth = 12;

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
            case 'Density':
                returnedValue = densitySort(prunedColumns);
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
