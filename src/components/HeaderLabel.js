import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";
import underscore from 'underscore'
import {
    getSelectColor,
    getWhiteColor,
    getHighlightedColor,
    scoreData,
} from '../functions/ColorFunctions'
import * as d3 from "d3";

let interpolate ;
const highColor = '#1A535C';
const midColor = '#A4DDE6';
const lowColor = '#FFFFFF';

export class HeaderLabel extends PureComponent {


    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !underscore.isEqual(nextProps, this.props);
    }

    /**
     * Score is from 0 to 1
     * @param score
     * @returns {*}
     */
    style(score) {
        let {selected, hovered, labelOffset, left, width, labelHeight, highlighted} = this.props;

        let colorString = interpolate(score);

        if (selected) {
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                backgroundColor: getSelectColor(),
                strokeWidth: 1,
                cursor: 'pointer'
            }
        }

        else if (hovered) {
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                backgroundColor: colorString,
                strokeWidth: 1,
                borderRadius: '15px',
                boxShadow: '0 0 2px 2px green',
                cursor: 'pointer'
            }
        }
        else if (highlighted) {
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                backgroundColor: colorString,
                boxShadow: '0 0 2px 2px ' + getHighlightedColor(),
                strokeWidth: 1,
                cursor: 'pointer'
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
                cursor: 'pointer',
            }
        }
    }

    fontColor(colorDensity) {
        return colorDensity < 0.7 ? 'black' : getWhiteColor();
    }

    render() {
        let {width, labelString, labelHeight, item, geneLength, numSamples, colorSettings} = this.props;
        let className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
        let colorDensity = scoreData(item.density, numSamples, geneLength) * colorSettings.shadingValue;
        console.log('gene gamma',colorSettings.geneGamma)
        interpolate = d3.scaleLinear().domain([0,0.5,1]).range([lowColor,midColor,highColor]).interpolate(d3.interpolateRgb.gamma(colorSettings.geneGamma));
        return (
            <svg
                style={this.style(colorDensity)}
                className={className}
            >
                <text x={-labelHeight + 2} y={10} fontFamily='Arial' fontSize={10} fill={this.fontColor(colorDensity)}
                      transform='rotate(-90)'
                >
                    {width < 10 ? '' : labelString}
                </text>
            </svg>
        );
    }
}

HeaderLabel.propTypes = {
    labelOffset: PropTypes.any.isRequired,
    labelHeight: PropTypes.any.isRequired,
    left: PropTypes.any.isRequired,
    width: PropTypes.any.isRequired,
    labelString: PropTypes.string.isRequired,
    numSamples: PropTypes.number.isRequired,
    item: PropTypes.any.isRequired,
    selected: PropTypes.any.isRequired,
    hovered: PropTypes.any.isRequired,
    geneLength: PropTypes.any.isRequired,
    highlighted: PropTypes.any.isRequired,
    colorSettings: PropTypes.any.isRequired,
};
