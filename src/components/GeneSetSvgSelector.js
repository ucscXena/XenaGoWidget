import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {fontColor, getSelectColor, getHoverColor} from "../functions/ColorFunctions";


export class GeneSetSvgSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.selected,
            pathways: props.pathways,
        };
    }

    /**
     * Score is from 0 to 1
     * @param score
     * @param selected
     * @param hovered
     * @param labelOffset
     * @param left
     * @param width
     * @param labelHeight
     * @param colorMask
     * @returns {*}
     */
    labelStyle(score, selected, hovered, labelOffset, left, width, labelHeight, colorMask) {

        let colorString = 'rgba(';
        colorString += colorMask[0];
        colorString += ',';
        colorString += colorMask[1];
        colorString += ',';
        colorString += colorMask[2];
        colorString += ',';
        colorString += score + ')';

        // console.log('SH',selected,hovered)
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
                // position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                backgroundColor: colorString,
                strokeWidth: 2,
                cursor: 'pointer'
            }
        }
    }

    render() {
        let {pathways, selected, hovered, width, labelString, labelHeight, item, geneLength, highScore, labelOffset, left, colorMask} = this.props;
        let colorDensity = 0.5;
        labelHeight = 20;
        let labelWidget = 150;
        let className = 'asdf';
        colorMask = [0.5, 0.5, 0.5];
        // labelOffset = 0;



        return pathways.map((p, index) => {
            let labelString = p.golabel;
            return (
                <svg
                    style={this.labelStyle(colorDensity, selected, hovered, labelOffset, left, width, labelHeight, colorMask)}
                    className={className}
                    key={p.golabel}
                >
                    <text x={10} y={10} fontFamily='Arial' fontSize={10}
                          fill={fontColor(colorDensity, selected, hovered)}
                    >
                        {width < 10 ? '' : labelString}
                    </text>
                </svg>
            );
        });
    }

    // render() {
    //     let {width, labelString, labelHeight, item, geneLength, highScore} = this.props;
    //     let className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g, '-');
    //     let colorDensity = this.getColorDensity(item.density, geneLength, highScore);
    //     return (
    //         <svg
    //             style={this.style(colorDensity)}
    //             className={className}
    //         >
    //             <text x={-labelHeight + 2} y={10} fontFamily='Arial' fontSize={10} fill={this.fontColor(colorDensity)}
    //                   transform='rotate(-90)'
    //             >
    //                 {width < 10 ? '' : labelString}
    //             </text>
    //         </svg>
    //     );
    // }
}

GeneSetSvgSelector.propTypes = {
    value: PropTypes.any,
    pathways: PropTypes.any,
};
