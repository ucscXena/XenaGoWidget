import React, {Component} from 'react'
import CanvasDrawing from "../CanvasDrawing";
import PropTypes from 'prop-types';

function drawImpactNodes(vg, width, height,data) {
    vg.fillStyle = 'rgb(200,0,0)'; // sets the color to fill in the rectangle with
    vg.fillRect(0,0,20,30)
}

export default class TissueView extends Component{

    constructor(props){
        super(props)
    }


    render(){
        const {width,height} = this.props;
        return <CanvasDrawing width={width} height={height} draw={drawImpactNodes}/>
    }
}
TissueView.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
};

