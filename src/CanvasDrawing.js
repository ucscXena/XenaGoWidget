// React component to manages redrawing a canvas element.

// 'use strict';

// var vgmixed = require('./vgmixed');
// var React = require('react');
import ReactDOM from 'react-dom';
import React, {Component} from 'react'
import PropTypes from 'prop-types';
import underscore from 'underscore'

let styles = {
    canvas: {
        position: 'relative',
        left: 0,
        top: 0,
        zIndex: 1
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
                        // onMouseMove={this.on.mousemove}
                        // onMouseOut={this.on.mouseout}
                        // onMouseOver={this.on.mouseover}
                        onClick={this.props.onClick}
                        // onDblClick={this.props.onDblClick}
                />
                <div style={{...styles.labels, top: -height, width, height}} ref='labels'/>
            </div>
        );
    }
    componentDidMount() {
        // console.log('did')
        let {width, height} = this.props;
        let canvas = ReactDOM.findDOMNode(this.refs.canvas);
        this.vg = canvas.getContext('2d');
        // console.log('found vg: '+this.vg);
        // this.vg = vgmixed(ReactDOM.findDOMNode(this.refs.canvas), width, height, ReactDOM.findDOMNode(this.refs.labels));
        this.draw(this.props);
    }
    setHeight(height) {
        this.vg.height(height);
        this.refs.div.style.height = `${height}px`;
        this.refs.labels.style.height = `${height}px`;
        this.refs.labels.style.top = `-${height}px`;
    }
    setWidth(width) {
        this.vg.width(width);
        this.refs.div.style.width = `${width}px`;
        this.refs.labels.style.width = `${width}px`;
    }
    draw(props) {
        let {draw, ...drawProps} = props,
            {height, width} = drawProps,
            vg = this.vg;
        // console.log('draing '+ vg)
        // vg.getContext()
        //
        if (vg.width !== width) {
            vg.width = width;
        }

        if (vg.height !== height) {
            vg.height = height;
        }

        // vg.fillRect(0,0,20,30)

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

// module.exports = CanvasDrawing;
