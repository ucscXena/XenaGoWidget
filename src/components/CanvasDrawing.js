import ReactDOM from 'react-dom';
import React, {Component} from 'react'
import PropTypes from 'prop-types';
import underscore from 'underscore'

let styles = {
    canvas: {
        cursor: 'crosshair',
        position: 'relative',
        left: 0,
        top: 0,
        zIndex: 1,
    }
    , labels: {
        position: 'relative',
        left: 0,
        zIndex: 2
    }
    , wrapper: {
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        backgroundColor: '#F7FFF7'
    }
    , overlay: {
        position: 'absolute'
        , top: 0
        , display: 'block'
        , zIndex: 9999
        , opacity: 1
    }
};

export default class CanvasDrawing extends Component {
    componentWillReceiveProps(newProps) {
        if (this.vg && !underscore.isEqual(newProps, this.props)) {
            this.draw(newProps);
        }
    }

    shouldComponentUpdate() {
        return false
    }

    render() {
        let {width, height} = this.props;
        return (
            <canvas id='expressionOverview'
                    style={styles.canvas}
                    ref='canvas'
                    width={width} height={height}
                    onMouseMove={this.props.onHover}
                    onMouseOut={this.props.onMouseOut}
                    onClick={this.props.onClick}
            />
        );
    }

    componentDidMount() {
        let canvas = ReactDOM.findDOMNode(this.refs.canvas);
        this.vg = canvas.getContext('2d');
        this.draw(this.props);
    }

    draw(props) {
        let {draw, ...drawProps} = props,
            {height, width} = drawProps,
            el = ReactDOM.findDOMNode(this.refs.canvas),
            vg = this.vg;

        if (el.width !== width) {
            el.width = width;
        }

        if (el.height !== height) {
            el.height = height;
        }

        draw(vg, drawProps);
    }
}
CanvasDrawing.propTypes = {
    draw: PropTypes.any.isRequired,
    width: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    onHover: PropTypes.any,
    onMouseOut: PropTypes.any,
    onClick: PropTypes.any,
};

