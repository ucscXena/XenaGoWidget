import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import CanvasDrawing from "../CanvasDrawing";
import ScoreFunctions from '../functions/ScoreFunctions';
import mutationScores from '../data/mutationVector';
import {memoize, range} from 'underscore';
import {partition, sum} from  '../functions/util';
import spinner from './ajax-loader.gif';

let labelHeight = 150;

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

    return (tissueIndex < 0) ? sum(pathwayArray) / associatedData[0].length : // pathway
        pathwayArray[tissueIndex]; // sample
}

let tissueIndexFromY = (y, height, count) =>
    y < labelHeight ? -1 :
        Math.trunc((y - labelHeight) * count / (height - labelHeight));

let pathwayIndexFromX = (x, layout) =>
    layout.findIndex(({start, size}) => start <= x && x < start + size);

function getPointData(event, props) {
    let {associateData, width, height, layout, data: {pathways, samples}} = props;

    let {x, y} = getMousePos(event);
    let pathwayIndex = pathwayIndexFromX(x, layout);
    let tissueIndex = tissueIndexFromY(y, height, samples.length);

    let expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, associateData);

    return {
        pathway: pathways[pathwayIndex],
        tissue: tissueIndex < 0 ? 'Header': samples[tissueIndex],
        expression
    };
}

const style = {
    fadeIn: {
        opacity: 1,
        transition: 'opacity 0.5s ease-out'
    },
    fadeOut: {
        opacity: 0.6,
        transition: 'opacity 1s ease'
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
        const {loading, width, height, layout, data, associateData,
            titleText,selected,filter} = this.props;

        let titleString, filterString ;
        if(selected){
            titleString = selected.golabel + ' (' + selected.goid + ')';
            filterString = filter.indexOf('All')===0 ? '' : filter ;
        }
        else{
            titleString  = titleText ? titleText : '';
            filterString = filter.indexOf('All')===0 ? '' : filter ;
        }

        let stat = loading ? <img src={spinner}/> : null;

        return (
            <div style={loading ? style.fadeOut : style.fadeIn}>
                <h3>{titleString} {stat}</h3>
                <CanvasDrawing
                    width={width}
                    height={height}
                    layout={layout}
                    filter={filterString}
                    draw={ScoreFunctions.drawTissueView}
                    associateData={associateData}
                    data={data}
                    onClick={this.onClick}
                    onMouseMove={this.onHover}/>
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
    onClick: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    filter: PropTypes.any,
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
function getMutationScore(effect,min) {
    return (mutationScores[effect]>=min) ? 1 : 0 ;
    // return mutationScores[effect]
}

let getGenePathwayLookup = pathways => {
    var sets = pathways.map(p => new Set(p.gene)),
        idxs = range(sets.length);
    return memoize(gene => idxs.filter(i => sets[i].has(gene)));
};

function pruneColumns(data,pathways,min){
    let columnScores = [];
    for(let i = 0 ; i < pathways.length ; i++){
        columnScores[i] = 0 ;
    }

    for( let col in data){
        for(let row in data[col]){
            let val = data[col][row];
            if(val){
                columnScores[col] += val ;
            }
        }
    }
    let prunedPathways = [];
    let prunedAssociations = [];

    for(let col in columnScores){
        if(columnScores[col]>=min){
            prunedPathways.push(pathways[col]);
            prunedAssociations.push(data[col]);
        }
    }

    return {
        'data':prunedAssociations,
        'pathways':prunedPathways
    };
}

/**
 * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
 *
 * @param expression
 * @param pathways
 * @param samples
 * @param filter
 * @param min
 * @returns {any[]}
 */
function associateData(expression, pathways, samples, filter,min) {
    filter = filter.indexOf('All')===0 ? '' : filter;
    let returnArray = new Array(pathways.length);
    for (let p in pathways) {
        returnArray[p] = new Array(samples.length);
        for (let s in samples) {
            returnArray[p][s] = 0;
        }
    }

    var sampleIndex = new Map(samples.map((v, i) => [v, i]));
    var genePathwayLookup = getGenePathwayLookup(pathways);

    for (let row of expression.rows) {
        let gene = row.gene;
        let effect = row.effect;
        let effectValue = (!filter || effect === filter) ? getMutationScore(effect,min) : 0;
        let pathwayIndices = genePathwayLookup(gene);

        for (let index of pathwayIndices) {
            returnArray[index][sampleIndex.get(row.sample)] += effectValue ;
        }
    }

    return returnArray;
}

function defaultSort(data){
    return data ;
}

function getColumnIndex(data, sortColumn) {

    for(let p in data.pathways){
        if(data.pathways[p].golabel===sortColumn){
            return p
        }
    }
    for(let p in data.pathways){
        if(data.pathways[p].gene[0]===sortColumn){
            return p
        }
    }
    return null ;
}

function transpose(a)
{
    // return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });
    // or in more modern dialect
    return a[0].map((_, c) => a.map(r => r[c]));
}

/**
 *
 * @param data
 * @param sortColumn
 * @param sortOrder
 * @returns {undefined}
 */
function sortColumns(data, sortColumn, sortOrder) {
    if(!sortColumn) return defaultSort(data) ;


    // sort tissues by the column in the sort order specified
    console.log(sortColumn);
    let columnIndex = getColumnIndex(data,sortColumn);
    console.log(columnIndex);
    let sortPathway = data.data[columnIndex];
    console.log(sortPathway);
    let sortedColumnIndices = [];
    for(let i = 0 ; i < sortPathway.length ; i++){
        sortedColumnIndices.push( {
                index: i,
                value: sortPathway[i]
            }
        );
        sortedColumnIndices.value = i ;
    }

    sortedColumnIndices.sort(function(a,b){
        if(sortOrder==='desc'){
            return b.value-a.value ;
        }
        else{
            return a.value-b.value ;
        }
    });

    let renderedData = transpose(data.data);

    // console.log(sortColumn)
    renderedData = renderedData.sort(function(a,b){
        let returnValue = a[columnIndex]-b[columnIndex];
        return sortOrder==='desc' ? -returnValue : returnValue ;
    });

    renderedData = transpose(renderedData);

    data.data = renderedData ;

    return data ;
}

let layout = (width, {length = 0} = {}) => partition(width, length);

export default class AssociatedDataCache extends PureComponent {
	render() {
        let {min, width, filter, sortColumn,sortOrder,filterPercentage,data: {expression, pathways, samples}} = this.props;
        let associatedData = associateData(expression, pathways, samples, filter,min);
        let filterMin = Math.trunc(filterPercentage * samples.length);

        let prunedColumns = pruneColumns(associatedData,pathways,filterMin);
        let returnedValue = sortColumns(prunedColumns,sortColumn,sortOrder);
		return (
			<TissueExpressionView
				{...this.props}
				layout={layout(width, returnedValue.data)}
				data={{expression, pathways: returnedValue.pathways, samples}}
				associateData={returnedValue.data}/>
		);
	}
}
