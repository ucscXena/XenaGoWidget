import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React, {Component} from 'react'
import ReactDOM from 'react-dom';


let styles = {
    overlay: {
        position: 'absolute'
        , top: 72
        // ,width:'25px !important'
        , display: 'block'
        , zIndex: 9999
        // , color: 'green'
        // , backgroundColor: 'blue'
        , opacity: 1
    }
};


export default class SVGLabels extends PureComponent {

    constructor(props){
        super(props);
        const { width, height ,drawOverlay,...drawProps} = this.props;

        this.state = {
            width: width,
            height: height,
            drawOverlay: drawOverlay,
            drawProps: drawProps,
        }
    }

    render() {
        const { width, height ,drawOverlay,onClick,onMouseMove} = this.props;
        let overlayDiv = ReactDOM.findDOMNode(this.refs.overlay);
        return (
            <div id="expressionOverlay"
                 ref="overlay"
                 style={{...styles.overlay, width, height}}
                 onMouseMove={onMouseMove}
                 onClick={onClick}
            >
                { drawOverlay(overlayDiv,this.state.drawProps) }
            </div>
        )
    }
}
SVGLabels.propTypes = {
    drawOverlay: PropTypes.any,
    width: PropTypes.any,
    height: PropTypes.any,
    // onMouseOver: PropTypes.any,
    onClick: PropTypes.any,
    onMouseOver: PropTypes.any,
};
