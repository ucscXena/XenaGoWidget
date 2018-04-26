// React component to manages redrawing a canvas element.

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
        boxShadow: '0 2px 2px 0 rgba(0, 0, 0, .14)'
    },
    labels: {
        position: 'relative',
        left: 0,
        zIndex: 2
    },
    wrapper: {
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        backgroundColor: 'gray'
    }
};

export default class CanvasDrawing extends Component{
    componentWillReceiveProps(newProps) {
        // console.log('will recieve')
        if (this.vg && !underscore.isEqual(newProps, this.props)) {
            this.draw(newProps);
        }
    }
    shouldComponentUpdate() {return false}
    render() {
        // console.log('render ');
        let {width, height,wrapperProps} = this.props;
        return (
            <div ref='div' {...wrapperProps} style={{...styles.wrapperProps, width, height}}>
                <canvas id='expressionOverview'
                        style={styles.canvas}
                        ref='canvas'
                        width={width} height={height}
                        // className='Tooltip-target'
                        onMouseMove={this.props.onMouseMove}
                        // onMouseOut={this.on.mouseout}
                        // onMouseOver={this.on.mouseover}
                        onClick={this.props.onClick}
                        // onDblClick={this.props.onDblClick}
                />
            </div>
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
    draw: PropTypes.any,
    width: PropTypes.any,
    height: PropTypes.any,
    // onMouseOver: PropTypes.any,
    onClick: PropTypes.any,
};

