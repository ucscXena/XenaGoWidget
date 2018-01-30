import React, {Component} from 'react'
import CanvasDrawing from "../CanvasDrawing";
import PropTypes from 'prop-types';

function drawPathwayHeader(vg,width,height,data){
    // console.log(data)
    vg.fillStyle = 'rgb(0,200,0)'; // sets the color to fill in the rectangle with
    vg.fillRect(20,0,20,30)
}

function drawTissueView(vg,props) {
    // console.log(props)
    let {width,height,data} = props ;
    drawPathwayHeader(vg,width,height,data);
    vg.fillStyle = 'rgb(200,0,0)'; // sets the color to fill in the rectangle with
    vg.fillRect(0,0,20,30)
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
    data: PropTypes.array.isRequired,
};

