import ReactDOM from 'react-dom'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {omit,isEqual} from 'underscore'

// const omitArray = ['associatedData','draw','data'];
const omitArray = ['draw','data']
const styles = {
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
}

export default class CanvasDrawing extends Component {


  componentDidMount() {
    let canvas = ReactDOM.findDOMNode(this.refs.canvas)
    this.vg = canvas.getContext('2d')
    this.draw(this.props)
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(newProps) {
    if (this.vg && ( !isEqual(omit(newProps,omitArray),
      omit(this.props,omitArray)) ) ) {
      this.draw(newProps)
    }
  }

  shouldComponentUpdate() {
    return false
  }

  draw(props) {
    let {draw, ...drawProps} = props,
      {height, width} = drawProps,
      el = ReactDOM.findDOMNode(this.refs.canvas),
      vg = this.vg

    if (el.width !== width) {
      el.width = width
    }

    if (el.height !== height) {
      el.height = height
    }

    draw(vg, drawProps)
  }

  render() {
    let {width, height} = this.props
    return (
      <canvas
        height={height}
        id='expressionOverview'
        onClick={this.props.onClick}
        onMouseMove={this.props.onHover} onMouseOut={this.props.onMouseOut}
        ref='canvas'
        style={styles.canvas}
        width={width}
      />
    )
  }

}
CanvasDrawing.propTypes = {
  associatedData: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  draw: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired,
  onClick: PropTypes.any, // gets passed in the other functions
  onHover: PropTypes.any,
  onMouseOut: PropTypes.any,
  width: PropTypes.any.isRequired,
}

