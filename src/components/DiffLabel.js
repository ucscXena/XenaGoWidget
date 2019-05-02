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

let interpolate;
const highColor = '#1A535C';
const midColor = '#A4DDE6';
const lowColor = '#FFFFFF';

export class DiffLabel extends PureComponent {


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
        let {labelOffset, left, width, labelHeight, cohortIndex} = this.props;

        // let colorString = interpolate(score);
        let colorString = cohortIndex === 0 ? 'green' : 'hotpink';

        return {
            position: 'absolute',
            top: labelOffset,
            left: left,
            height: labelHeight,
            width: width,
            backgroundColor: colorString,
            strokeWidth: 1,
            opacity: 0.5,
            cursor: 'pointer',
        }
    }

    //
    // fontColor(colorDensity) {
    //     return colorDensity < 0.7 ? 'black' : getWhiteColor();
    // }

    render() {
        // let {width, labelString, labelHeight, item, geneLength, numSamples, colorSettings} = this.props;
        let {item, geneLength, numSamples, colorSettings} = this.props;
        let className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
        let colorDensity = scoreData(item.density, numSamples, geneLength) * colorSettings.shadingValue;
        interpolate = d3.scaleLinear().domain([0, 1]).range([lowColor, highColor]).interpolate(d3.interpolateRgb.gamma(colorSettings.geneGamma));
        return (
            <svg
                style={this.style(colorDensity)}
                className={className}
            >
                {/*<text x={-labelHeight + 2} y={10} fontFamily='Arial' fontSize={10} fill={this.fontColor(colorDensity)}*/}
                {/*      transform='rotate(-90)'*/}
                {/*>*/}
                {/*    {width < 10 ? '' : labelString}*/}
                {/*</text>*/}
            </svg>
        );
    }
}

DiffLabel.propTypes = {
    labelOffset: PropTypes.any.isRequired,
    labelHeight: PropTypes.any.isRequired,
    left: PropTypes.any.isRequired,
    width: PropTypes.any.isRequired,
    labelString: PropTypes.string.isRequired,
    numSamples: PropTypes.number.isRequired,
    item: PropTypes.any.isRequired,
    geneLength: PropTypes.any.isRequired,
    colorSettings: PropTypes.any.isRequired,
};
