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

    componentDidMount() {
        this.draw(this.props);
    }

    draw(props) {
        let {drawOverlay, ...drawProps} = props,
            overlayDiv = ReactDOM.findDOMNode(this.refs.overlay);

        drawOverlay(overlayDiv, drawProps);
    }

    render() {
        const { width, height } = this.props;
        return (
            <div id="expressionOverlay"
                 ref="overlay"
                 style={{...styles.overlay, width, height}}
                 onMouseMove={this.props.onMouseMove}
                 onClick={this.props.onClick}
            >This div is over the canvas
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
