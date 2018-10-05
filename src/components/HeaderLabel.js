import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";
import {getSelectColor, getHoverColor, getWhiteColor, getDarkColor,scoreData} from '../functions/ColorFunctions'

export class HeaderLabel extends PureComponent {


    constructor(props) {
        super(props);
    }


    /**
     * Score is from 0 to 1
     * @param score
     * @returns {*}
     */
    style(score) {
        let {selected, hovered, labelOffset, left, width, labelHeight, colorMask} = this.props;

        let colorString = 'rgba(';
        colorString += colorMask[0];
        colorString += ',';
        colorString += colorMask[1];
        colorString += ',';
        colorString += colorMask[2];
        colorString += ',';
        colorString += score + ')';

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
                backgroundColor: getHoverColor(score),
                strokeWidth: 1,
                // outline: 'thin dotted gray',
                borderRadius: '15px',
                boxShadow: '0 0 1px 1px gray',
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

    fontColor(colorDensity) {
        let {selected, hovered} = this.props;

        if (hovered) {
            return !selected ? getDarkColor() : getHoverColor(colorDensity);
        }

        if (selected) {
            return getWhiteColor();
        }


        return colorDensity < 0.7 ? 'black' : getWhiteColor();
    }

    render() {
        let {width, labelString, labelHeight, item, geneLength, maxScore} = this.props;
        let className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
        // let colorDensity = getColorDensity(item.density, geneLength, highScore);
        let colorDensity = scoreData(item.density , maxScore,geneLength);
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
    labelOffset: PropTypes.any,
    labelHeight: PropTypes.any,
    colorString: PropTypes.string,
    left: PropTypes.any,
    width: PropTypes.any,
    labelString: PropTypes.string,
    maxScore: PropTypes.number,
    item: PropTypes.any,
    selected: PropTypes.any,
    hovered: PropTypes.any,
    colorMask: PropTypes.any,
    geneLength: PropTypes.any,
};
