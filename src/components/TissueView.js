import React, {Component} from 'react'
import CanvasDrawing from "../CanvasDrawing";
import PropTypes from 'prop-types';


function drawPathwayLabels(vg,width,height,pathways){
    let pathwayCount = pathways.length;
    // console.log('drawing pathaways');
    // console.log(pathways)
    let pixelsPerPathway = width / pathwayCount;
    let labelHeight = 150 ;

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
    let pixelsPerPathway = width / pathwayCount;
    let labelHeight = 50 ;

    vg.fillStyle = 'rgb(0,200,0)'; // sets the color to fill in the rectangle with
    let pixelCount = 0 ;
    for(let d of data){
        // console.log(d)
        vg.fillRect(pixelCount,0,pixelsPerPathway,labelHeight);
        vg.strokeRect(pixelCount,0,pixelsPerPathway,labelHeight);
        pixelCount += pixelsPerPathway;
    }
}

function getPathwayIndicesForGene(gene,pathways) {
    let indices = [];
    for(let p in pathways){
        let pathway = pathways[p];
        if(gene.indexOf(pathway.gene)){
            indices.push(p)
        }
    }
    return indices;

}

function getSampleIndex(sample, samples) {
    return samples.indexOf(sample);
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
    for(let p in pathways){
        returnArray[p] = new Array(samples.lenth);
        for(let s in samples){
            returnArray[p][s] = 0 ;
        }
    }
    console.log( returnArray);


    for(let expr of expression){
        let gene = expr.rows[0].gene;
        let pathwayIndices = getPathwayIndicesForGene(gene,pathways);

        if(pathwayIndices){
            for(let row of expr.rows){
                let sampleIndex = getSampleIndex(row.sample,samples);
                for(let index of pathwayIndices){
                    returnArray[index][sampleIndex] += 1 ;
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

    let associatedData = associateData(expression,pathways,samples)


    // drawExpressionData(vg,width,height,expression,pathways,samples);
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

