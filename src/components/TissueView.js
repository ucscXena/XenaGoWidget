import React, {Component} from 'react'
import CanvasDrawing from "../CanvasDrawing";
import PropTypes from 'prop-types';


let labelHeight = 150 ;

function drawPathwayLabels(vg,width,height,pathways){
    let pathwayCount = pathways.length;
    // console.log('drawing pathaways');
    // console.log(pathways)
    let pixelsPerPathway = width / pathwayCount;

    vg.fillStyle = 'rgb(0,200,0)'; // sets the color to fill in the rectangle with
    let pixelCount = 0 ;
    for(let d of pathways){
        // console.log(d)
        vg.fillRect(pixelCount,0,pixelsPerPathway,labelHeight);
        vg.strokeRect(pixelCount,0,pixelsPerPathway,labelHeight);


        // draw the text
        vg.save();
        vg.fillStyle = 'rgb(0,0,0)'; // sets the color to fill in the rectangle with
        vg.rotate(-Math.PI/2);
        vg.translate(-labelHeight,pixelCount,labelHeight);
        vg.fillText(d.golabel,3,10);
        vg.restore();
        pixelCount += pixelsPerPathway;
    }
}

function drawExpressionData(vg, width, height, data) {
    let pathwayCount = data.length;
    let tissueCount = data[0].length;
    let pixelsPerPathway = Math.round(width / pathwayCount);
    let pixelsPerTissue = Math.round(height / tissueCount);


    let maxScore = 5 ;

    let xPixel= 0 ;
    let yPixel ;
    vg.save();
    for(let pathwayIndex in data){
        yPixel = labelHeight ;
        for(let tissueIndex in data[pathwayIndex]){
            let colorScore = data[pathwayIndex][tissueIndex]   ;
            colorScore = Math.min(Math.round(colorScore / maxScore * 256),256)  ;
            vg.fillStyle  = 'rgb('+(256)+','+(256-colorScore)+','+(256-colorScore)+')';
            vg.fillRect(xPixel,yPixel,pixelsPerPathway,pixelsPerTissue);
            yPixel += pixelsPerTissue;
        }
        xPixel += pixelsPerPathway;
    }
    vg.restore();
}

function getPathwayIndicesForGene(gene,pathways) {
    let indices = [];
    for(let p in pathways){
        let pathway = pathways[p];
        let indexOfGeneInPathway = pathway.gene.indexOf(gene);
        if(indexOfGeneInPathway>=0){
            indices.push(p)
        }
    }
    return indices;

}

function getSampleIndex(sample, samples) {
    return samples.indexOf(sample);
}

let ignoreList = [];
/**
 * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
 *
 * @param expression
 * @param pathways
 * @param samples
 * @returns {any[]}
 */
function associateData(expression, pathways, samples,ignoreList) {
    let returnArray = new Array(pathways.length);
    for(let p in pathways){
        returnArray[p] = new Array(samples.lenth);
        for(let s in samples){
            returnArray[p][s] = 0 ;
        }
    }


    for(let expr of expression){
        let gene = expr.rows[0].gene;
        let effect = expr.rows[0].effect;
        if(ignoreList.indexOf(effect)<0){
            let pathwayIndices = getPathwayIndicesForGene(gene,pathways);
            // console.log(pathwayIndices)

            if(pathwayIndices){
                for(let row of expr.rows){
                    let sampleIndex = getSampleIndex(row.sample,samples);
                    for(let index of pathwayIndices){
                        returnArray[index][sampleIndex] += 1 ;
                    }
                }
            }
        }
    }


    return returnArray ;
}

function drawTissueView(vg,props) {
    console.log('ttisue data viewing ')
    console.log(props)
    let {width,height,data:{expression,pathways,samples}} = props ;
    drawPathwayLabels(vg,width,height,pathways);

    let associatedData = associateData(expression,pathways,samples,ignoreList);


    drawExpressionData(vg,width,height,associatedData);
    // drawPathwayHeader(vg,width,height,data);
    // vg.fillStyle = 'rgb(200,0,0)'; // sets the color to fill in the rectangle with
    // vg.fillRect(0,0,20,30)
}

export default class TissueView extends Component{

    constructor(props){
        super(props)
    }

    render(){
        console.log('render')
        console.log(this.props)
        const {width,height,data} = this.props;
        return <CanvasDrawing width={width} height={height} draw={drawTissueView} data={data}/>
    }
}
TissueView.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

