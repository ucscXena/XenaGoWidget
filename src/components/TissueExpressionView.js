import React, {Component} from 'react'
import CanvasDrawing from "../CanvasDrawing";
import PropTypes from 'prop-types';
import mutationScores from '../mutationVector'


let labelHeight = 150;

let pixelsPerPathway, pixelsPerTissue, pathwayCount, tissueCount;

let associatedData, valueArray;
let pathwayData, expressionData, sampleData;

function clearScreen(vg, width, height) {
    vg.save();
    vg.fillStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.strokeStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    // vg.fillStyle = 'rgb(0,0,0)'; // sets the color to fill in the rectangle with
    vg.fillRect(0, 0, width, height);
}

function drawPathwayLabels(vg, width, height, pathways) {
    pathwayCount = pathways.length;
    // console.log('drawing pathaways');
    // console.log(pathways)
    pixelsPerPathway = Math.round(width / pathwayCount);

    vg.fillStyle = 'rgb(0,200,0)'; // sets the color to fill in the rectangle with
    let pixelCount = 0;
    for (let d of pathways) {
        // console.log(d)
        vg.fillRect(pixelCount, 0, pixelsPerPathway, labelHeight);
        vg.strokeRect(pixelCount, 0, pixelsPerPathway, labelHeight);


        // draw the text
        vg.save();
        vg.fillStyle = 'rgb(0,0,0)'; // sets the color to fill in the rectangle with
        vg.rotate(-Math.PI / 2);
        vg.font = "10px Courier";
        vg.translate(-labelHeight, pixelCount, labelHeight);
        let labelString = '(' + d.gene.length + ')';
        // pad for 1000, so 4 + 2 parans
        while (labelString.length < 5) {
            labelString += ' ';
        }

        labelString += d.golabel;

        if (pixelsPerPathway >= 10) {
            vg.fillText(labelString, 3, 10);
        }
        vg.restore();
        pixelCount += pixelsPerPathway;
    }
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getPathwayForXPosition(x) {
    let pathwayIndex = Math.round(x / pixelsPerPathway);
    return pathwayData[pathwayIndex];
}

function getTissueForYPosition(y) {
    let convertedHeight = y - labelHeight;
    if (convertedHeight < 0) return 'Header';
    let tissueIndex = Math.round((convertedHeight) / pixelsPerTissue);
    return sampleData[tissueIndex];
}

function getExpressionForDataPoint(x, y) {
    let pathwayIndex = Math.round(x / pixelsPerPathway);
    let tissueIndex = Math.round(y / pixelsPerTissue);

    let convertedHeight = y - labelHeight;
    if (convertedHeight < 0) {
        let totalExpression = 0;
        let pathwayArray = associatedData[pathwayIndex];

        for (let p of pathwayArray) {
            // console.log(p)
            totalExpression += parseInt(p);
            // const reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
            // return associatedData.reduce(reducer)
        }

        return totalExpression;
    }


    // console.log(pathwayIndex + ' ' + tissueIndex);
    if (associatedData[pathwayIndex]) {
        if (valueArray[pathwayIndex][tissueIndex].length > 0) {
            console.log(valueArray[pathwayIndex][tissueIndex]);
        }
        // return associatedData[pathwayIndex][tissueIndex] + ' -> ' + JSON.stringify(valueArray[pathwayIndex][tissueIndex]);
        return associatedData[pathwayIndex][tissueIndex];
    }
    return 0;
}

function drawExpressionData(vg, width, height, data, onClick, onHover) {
    pathwayCount = data.length;
    tissueCount = data[0].length;
    pixelsPerPathway = Math.round(width / pathwayCount);
    pixelsPerTissue = Math.round(height / tissueCount);


    let thresholdScore = 5;
    // TODO :do a separate pass to calculate different maxes?

    let xPixel = 0;
    let yPixel;
    let maxColorScore = 0;
    let colorScoreCount = 0;
    let totalColorScore = 0;
    vg.save();
    for (let pathwayIndex in data) {
        yPixel = labelHeight;
        for (let tissueIndex in data[pathwayIndex]) {
            let colorScore = data[pathwayIndex][tissueIndex];
            ++colorScoreCount;
            totalColorScore += colorScore;
            maxColorScore = colorScore > maxColorScore ? colorScore : maxColorScore;
            colorScore = Math.min(Math.round(colorScore / thresholdScore * 256), 256);
            vg.fillStyle = 'rgb(' + (256) + ',' + (256 - colorScore) + ',' + (256 - colorScore) + ')';
            vg.fillRect(xPixel, yPixel, pixelsPerPathway, pixelsPerTissue);
            yPixel += pixelsPerTissue;
        }
        xPixel += pixelsPerPathway;
    }
    vg.restore();
    console.log('max: ' + maxColorScore + ' total scores: ' + colorScoreCount + ' total: ' + totalColorScore + ' avg: ' + (totalColorScore / colorScoreCount));

    // alert(vg.canvas);
    let canvas = vg.canvas;
    canvas.addEventListener("click", function (event) {
        // console.log(event)
        let mousePos = getMousePos(vg.canvas, event);
        // console.log(mousePos);
        // alert('cliecked ' + JSON.stringify(mousePos));
        let pathway = getPathwayForXPosition(mousePos.x);
        let tissue = getTissueForYPosition(mousePos.y);
        let expression = getExpressionForDataPoint(mousePos.x, mousePos.y);
        let pointData = {
            x: mousePos.x,
            y: mousePos.y,
            pathway: pathway,
            tissue: tissue,
            expression: expression,
        };
        if (onClick) onClick(pointData);
        // alert(event.clientX + ' '  + evet.clientY )

    }, false);

    vg.canvas.addEventListener("mousemove", function (event) {
        // console.log('moved ' + JSON.stringify(event));
        let mousePos = getMousePos(vg.canvas, event);
        // console.log(mousePos);
        // console.log(onHover)
        let pathway = getPathwayForXPosition(mousePos.x);
        let tissue = getTissueForYPosition(mousePos.y);
        let expression = getExpressionForDataPoint(mousePos.x, mousePos.y);
        let pointData = {
            x: mousePos.x,
            y: mousePos.y,
            pathway: pathway,
            tissue: tissue,
            expression: expression,
        };
        if (onHover) onHover(pointData);
    }, false);
}

function getPathwayIndicesForGene(gene, pathways) {
    let indices = [];
    for (let p in pathways) {
        let pathway = pathways[p];
        let indexOfGeneInPathway = pathway.gene.indexOf(gene);
        if (indexOfGeneInPathway >= 0) {
            indices.push(p)
        }
    }
    return indices;

}

function getSampleIndex(sample, samples) {
    return samples.indexOf(sample);
}

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

/**
 * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
 *
 * @param expression
 * @param pathways
 * @param samples
 * @returns {any[]}
 */
function associateData(expression, pathways, samples) {
    let returnArray = new Array(pathways.length);
    valueArray = new Array(pathways.length);
    for (let p in pathways) {
        returnArray[p] = new Array(samples.lenth);
        valueArray[p] = new Array(samples.lenth);
        for (let s in samples) {
            returnArray[p][s] = 0;
            valueArray[p][s] = [];
        }
    }


    for (let row of expression.rows) {
        let gene = row.gene;
        let effect = row.effect;
        let effectValue = getMutationScore(effect);
        let pathwayIndices = getPathwayIndicesForGene(gene, pathways);
        let sampleIndex = getSampleIndex(row.sample, samples);
        for (let index of pathwayIndices) {
            returnArray[index][sampleIndex] += effectValue;
            valueArray[index][sampleIndex].push(row);
        }
    }

    return returnArray;
}


function drawTissueView(vg, props) {
    // console.log('ttisue data viewing ');
    // console.log(props);
    let {width, height, onClick, onHover, data: {expression, pathways, samples}} = props;
    pathwayData = pathways;
    expressionData = expression;
    sampleData = samples;

    clearScreen(vg,width,height);

    drawPathwayLabels(vg, width, height, pathways);

    associatedData = associateData(expression, pathways, samples);

    drawExpressionData(vg, width, height, associatedData, onClick, onHover);
}

export default class TissueExpressionView extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        // console.log('render in TissueExpressionView');
        // console.log(this.props);
        const {width, height, data, onClick, onHover, titleText} = this.props;
        let titleString  = titleText ? titleText : '';
        return (
            <div>
                <h3>{titleString}</h3>
                <CanvasDrawing width={width} height={height} draw={drawTissueView} data={data} onClick={onClick}
                               onHover={onHover}/>
            </div>
        );
    }
}
TissueExpressionView.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    titleText: PropTypes.string,
    onClick: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    id: PropTypes.any,
};

