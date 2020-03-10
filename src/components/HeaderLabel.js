import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import underscore from 'underscore'
import {
  getWhiteColor,
  getHighlightedColor
} from '../functions/ColorFunctions'
import * as d3 from 'd3'
import {isViewGeneExpression, scoreData} from '../functions/DataFunctions'
import {interpolateGeneExpressionFunction} from '../functions/DrawFunctions'

let interpolate 
const highColor = '#1A535C'
const lowColor = '#FFFFFF'

export class HeaderLabel extends PureComponent {


  constructor(props) {
    super(props)
    this.state = {
      hovered: false
    }
  }

  shouldComponentUpdate(nextProps) {
    return !underscore.isEqual(nextProps, this.props)
  }

  /**
     * Score is from 0 to 1
     * @param score
     * @returns {*}
     */
  style(score) {
    let {labelOffset, left, width, labelHeight, highlighted} = this.props
    let colorString = interpolate(score)
    if (highlighted) {
      return {
        position: 'absolute',
        top: labelOffset,
        left: left,
        height: labelHeight,
        width: width,
        backgroundColor: colorString,
        boxShadow: '0 0 2px 2px inset ' + getHighlightedColor(),
        strokeWidth: 1,
        cursor: 'crosshair'
      }
    }
    else {
      return {
        position: 'absolute',
        top: labelOffset,
        left: left,
        height: labelHeight,
        width: width,
        backgroundColor: colorString,
        strokeWidth: 1,
        cursor: 'crosshair',
      }
    }
  }

    fontColor = (colorDensity) => {
      return colorDensity < 0.7 ? 'black' : getWhiteColor()
    };

    render() {
      let {width, filter, labelString, labelHeight, item, geneLength, numSamples, colorSettings} = this.props
      let colorDensity 
      if(isViewGeneExpression(filter)) {
        colorDensity = item.geneExpressionMean
        interpolate = (score) => interpolateGeneExpressionFunction(score)
      }
      else {
        colorDensity = scoreData(item.samplesAffected, numSamples, geneLength) * colorSettings.shadingValue
        interpolate = d3.scaleLinear().domain([0,1]).range([lowColor,highColor]).interpolate(d3.interpolateRgb.gamma(colorSettings.geneGamma))
      }
      return (
        <svg
          style={this.style(colorDensity)}
        >
          <text
            fill={this.fontColor(colorDensity)}
            fontFamily='Arial'
            fontSize={10}
            transform='rotate(-90)'
            x={-labelHeight + 4}
            y={10}
          >
            {width < 10 ? '' : labelString.replace(/_/g,' ')}
          </text>
        </svg>
      )
    }
}

HeaderLabel.propTypes = {
  colorSettings: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
  geneLength: PropTypes.any.isRequired,
  highlighted: PropTypes.any.isRequired,
  item: PropTypes.any.isRequired,
  labelHeight: PropTypes.any.isRequired,
  labelOffset: PropTypes.any.isRequired,
  labelString: PropTypes.string.isRequired,
  left: PropTypes.any.isRequired,
  numSamples: PropTypes.number.isRequired,
  width: PropTypes.any.isRequired,
}
