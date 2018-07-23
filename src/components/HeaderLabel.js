import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";
import {getSelectColor, getHoverColor} from '../functions/ColorFunctions'

export class HeaderLabel extends PureComponent {

    maxColor = 256;

    constructor(props) {
        super(props);
    }


    style() {
        let {item: {density}, geneLength, selected, hovered, highScore, labelOffset, left, width, labelHeight, colorMask} = this.props;

        let color = Math.round(this.maxColor * (1.0 - (density / geneLength / highScore)));
        color = 1 - color / 256;

        let colorString = 'rgba(';
        colorString += colorMask[0];
        colorString += ',';
        colorString += colorMask[1];
        colorString += ',';
        colorString += colorMask[2];
        colorString += ',';
        colorString += color + ')';

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
                backgroundColor: getHoverColor(),
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
                cursor: 'pointer'
            }
        }
    }

    fontColor() {
        let {selected, hovered} = this.props;

        if (hovered) {
            return !selected ? '#1A535C' : getHoverColor();
        }

        if (selected) {
            return '#F7FFF7';
        }


        return 'black';
    }

    render() {
        let {width, labelString, labelHeight, item} = this.props;
        let className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
        return (
            <svg
                style={this.style()}
                className={className}
            >
                <text x={-labelHeight + 2} y={10} fontFamily='Arial' fontSize={10} fill={this.fontColor()}
                      transform='rotate(-90)'
                >
                    {width < 10 ? '' : labelString}
                </text>
            </svg>
        );
    }
}

HeaderLabel.propTypes = {
    labelOffset: PropTypes.any,
    labelHeight: PropTypes.any,
    colorString: PropTypes.string,
    left: PropTypes.any,
    width: PropTypes.any,
    labelString: PropTypes.string,
    highScore: PropTypes.number,
    item: PropTypes.any,
    selected: PropTypes.any,
    hovered: PropTypes.any,
    colorMask: PropTypes.any,
    geneLength: PropTypes.any,
};
