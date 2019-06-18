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
import {observer} from "mobx-react";
import {SelectionStore} from "../store/SelectionStore";

let interpolate ;
const highColor = '#1A535C';
const midColor = '#A4DDE6';
const lowColor = '#FFFFFF';

@observer
export class HeaderLabel extends React.Component{


    constructor(props) {
        super(props);
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return !underscore.isEqual(nextProps, this.props);
    // }

    /**
     * Score is from 0 to 1
     * @param score
     * @param hovered
     * @returns {*}
     */
    style(score,hovered) {
        let {selected,  labelOffset, left, width, labelHeight, highlighted} = this.props;

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
                boxShadow: '0 0 2px 2px green inset',
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
                boxShadow: '0 0 2px 2px inset ' + getHighlightedColor(),
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

    // shouldComponentUpdate(nextProps, nextState, nextContext) {
    //     console.log('3 re-calculating hover shoud? ')
    //     return SelectionStore.getStore().isHovered(nextProps.labelString);
    // }

    render() {
        // const selectionStore = SelectionStore.INSTANCE;
        let {width, labelString, labelHeight, item, geneLength, numSamples, colorSettings} = this.props;
        const hovered = SelectionStore.getStore().hoveredGene === labelString;
        // const hovered = selectionStore.isHovered(labelString);
        // console.log('2 re-calculating hover',hovered);
        // const hovered = SelectionStore.getStore().isHovered(labelString);
        // console.log('hovered store changed', hovered,selectionStore.hoveredGene,labelString)
        let className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
        let colorDensity = scoreData(item.samplesAffected, numSamples, geneLength) * colorSettings.shadingValue;
        interpolate = d3.scaleLinear().domain([0,1]).range([lowColor,highColor]).interpolate(d3.interpolateRgb.gamma(colorSettings.geneGamma));
        return (
            <svg
                style={this.style(colorDensity,hovered)}
                className={className}
            >
                <text x={-labelHeight + 4} y={10} fontFamily='Arial' fontSize={10} fill={this.fontColor(colorDensity)}
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
    // hovered: PropTypes.any.isRequired,
    geneLength: PropTypes.any.isRequired,
    highlighted: PropTypes.any.isRequired,
    colorSettings: PropTypes.any.isRequired,
};
