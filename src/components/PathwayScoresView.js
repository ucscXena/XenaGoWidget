import React, {Component} from 'react'
import PropTypes from 'prop-types';
import CanvasDrawing from "../CanvasDrawing";
import ScoreFunctions from '../functions/ScoreFunctions';
import mutationScores from '../data/mutationVector';

let labelHeight = 150;

function getMousePos(evt) {
    let rect = evt.currentTarget.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getExpressionForDataPoint(x, y,pixelsPerPathway,pixelsPerTissue,associatedData) {
    let pathwayIndex = Math.trunc(x / pixelsPerPathway);

    let convertedHeight = y - labelHeight;
    // if we are in the label area
    if (convertedHeight < 0) {
        let totalExpression = 0;
        let pathwayArray = associatedData[pathwayIndex];

        if (pathwayArray) {
            for (let p of pathwayArray) {
                totalExpression += parseInt(p);
            }
        }
        else {
            console.log("Not pathway data at " + pathwayIndex + " for " + associateData.length);
        }

        return totalExpression;
    }

    let tissueIndex = Math.trunc(convertedHeight / pixelsPerTissue);

    if (associatedData[pathwayIndex]) {
        return associatedData[pathwayIndex][tissueIndex];
    }
    else{
        return 0 ;
    }
}

function getTissueForYPosition(y,pixelsPerTissue,sampleData) {
    let convertedHeight = y - labelHeight;
    if (convertedHeight < 0) return 'Header';
    let tissueIndex = Math.trunc((convertedHeight) / pixelsPerTissue);
    return sampleData[tissueIndex];
}

function getPathwayForXPosition(x,pixelsPerPathway,pathwayData) {
    let pathwayIndex = Math.trunc(x / pixelsPerPathway);
    return pathwayData[pathwayIndex];
}

function getPointData(event, props) {
    var {associateData, width, height, data: {pathways, samples}} = props;

    let mousePos = getMousePos(event);
    let pathwayCount = associateData.length;
    let tissueCount = associateData[0].length;
    let pixelsPerPathway = Math.trunc(width / pathwayCount);
    let pixelsPerTissue = Math.trunc(height / tissueCount);
    let pathway = getPathwayForXPosition(mousePos.x, pixelsPerPathway, pathways);
    let tissue = getTissueForYPosition(mousePos.y, pixelsPerTissue, samples);
    let expression = getExpressionForDataPoint(mousePos.x, mousePos.y, pixelsPerPathway, pixelsPerTissue, associateData);

    return {
        x: mousePos.x,
        y: mousePos.y,
        pathway: pathway,
        tissue: tissue,
        expression: expression,
    };
}

class TissueExpressionView extends Component {

    constructor(props) {
        super(props);
    }

    onClick = (event) => {
        var {onClick} = this.props;
        if (onClick) {
            onClick(getPointData(event, this.props))
        };
    }

    onHover = (event) => {
        var {onHover} = this.props;
        if (onHover) {
            onHover(getPointData(event, this.props));
        };
    }

    render() {
        const {width, height, data, onClick, onHover, associateData, titleText,selected,filter} = this.props;

        let titleString, filterString ;
        if(selected){
            titleString = selected.golabel + ' (' + selected.goid + ')';
            filterString = filter.indexOf('All')===0 ? '' : filter ;
        }
        else{
            titleString  = titleText ? titleText : '';
            filterString = filter.indexOf('All')===0 ? '' : filter ;
        }

        return (
            <div>
                <h3>{titleString}</h3>
                <CanvasDrawing
                    width={width}
                    height={height}
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
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
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
 * @returns {*}
 */
function getMutationScore(effect) {
    return mutationScores[effect]
}

function getSampleIndex(sample, samples) {
    return samples.indexOf(sample);
}

function getPathwayIndicesForGene(gene, pathways) {
    let indices = [];
    for (let p in pathways) {
        let pathway = pathways[p];
        let indexOfGeneInPathway = pathway.gene.indexOf(gene);
        if (indexOfGeneInPathway >= 0) {
            indices.push(p);
        }
    }
    return indices;
}

function pruneSamples(data,pathways,min){
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
 * @returns {any[]}
 */
function associateData(expression, pathways, samples, filter) {
    filter = filter === 'All' ? '' : filter;
    let returnArray = new Array(pathways.length);
    let valueArray = new Array(pathways.length);
    for (let p in pathways) {
        returnArray[p] = new Array(samples.length);
        valueArray[p] = new Array(samples.length);
        for (let s in samples) {
            returnArray[p][s] = 0;
            valueArray[p][s] = [];
        }
    }


    for (let row of expression.rows) {
        let gene = row.gene;
        let effect = row.effect;
        let effectValue = (!filter || effect === filter) ? getMutationScore(effect) : 0;
        let pathwayIndices = getPathwayIndicesForGene(gene, pathways);
        let sampleIndex = getSampleIndex(row.sample, samples);
        for (let index of pathwayIndices) {
            returnArray[index][sampleIndex] += effectValue;
            valueArray[index][sampleIndex].push(row);
        }
    }

    return returnArray;
}

export default class AssociatedDataCache extends Component {
	render() {
		let {filter, data: {expression, pathways, samples}} = this.props;
        let associatedData = associateData(expression, pathways, samples, filter);
        let filterPercentage = 0.005 ;
        let filterMin = Math.trunc(filterPercentage * samples.length);

        let returnedValue = pruneSamples(associatedData,pathways,filterMin);
		return (
			<TissueExpressionView
				{...this.props}
				data={{expression, pathways: returnedValue.pathways, samples}}
				associateData={returnedValue.data}/>
		);
	}
}
