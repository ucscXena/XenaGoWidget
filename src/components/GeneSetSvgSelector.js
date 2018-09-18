import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {fontColor, getSelectColor} from "../functions/ColorFunctions";
// import {fontColor, getSelectColor, getHoverColor} from "../functions/ColorFunctions";


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
                // position: 'absolute',
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
                // position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                // backgroundColor: getHoverColor(score),
                backgroundColor: 'red',
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


    onClick = (geneSet, event) => {
        console.log('local mouse CLICK event', event, geneSet);
        let {onClick} = this.props;
        if (onClick) {
            onClick(geneSet);
        }
    };

    onMouseOut = (geneSet, event) => {
        console.log('local mouse out event', geneSet);
        let {onHover} = this.props;
        onHover(null);
    };

    onHover = (geneSet, event) => {
        console.log('local mouse enter event', geneSet);
        let {onHover} = this.props;
        if (onHover) {
            onHover(geneSet);
        }
        else {
            onHover(null);
        }
    };

    render() {
        let {pathways, selectedPathways, hoveredPathways, width, labelString, labelHeight, item, geneLength, highScore, labelOffset, left, colorMask, onClick, onHover, onMouseOut} = this.props;
        let colorDensity = 0.5;
        labelHeight = 20;
        let labelWidget = 150;
        let className = 'asdf';
        colorMask = [0.5, 0.5, 0.5];

        // labelOffset = 0;

        const highestScore = pathways.reduce((max, current) => {
            let score = current.density / current.gene.length;
            return (max > score) ? max : score;
        }, 0);

        console.log('props', this.props);
        console.log('pathways', pathways);

        let newRefPathways = pathways.map(r => {
            // let density = Math.random();
            let density = 0.2;

            //     // JICARD INDEX: https://en.wikipedia.org/wiki/Jaccard_index
            //     // intersection of values divided by union of values
            //     let allGenes = union(selectedGenes, r.gene);
            //     let density = allGenes.length === 0 ? 0 : overlappingGenes.length / allGenes.length;

            return {
                goid: r.goid,
                golabel: r.golabel,
                gene: r.gene,
                density: density,
            };
        });

        let hoveredLabels = hoveredPathways.map(p => p && p.golabel);
        let selectedLabels = selectedPathways.map(p => p && p.golabel);

        console.log('selected labels', selectedLabels)

        return newRefPathways.map((p, index) => {
            let labelString = '('+p.gene.length+') ' + p.golabel ;
            colorDensity = p.density;
            let hovered = hoveredLabels.indexOf(p.golabel) >= 0;
            let selected = selectedLabels.indexOf(p.golabel) >= 0;
            return (
                <svg
                    style={this.labelStyle(colorDensity, selected, hovered, labelOffset, left, width, labelHeight, colorMask)}
                    className={className}
                    onMouseDown={this.onClick.bind(this, p)}
                    onMouseOut={this.onMouseOut.bind(this, p)}
                    onMouseOver={this.onHover.bind(this, p)}
                    key={p.golabel}
                >
                    <text x={10} y={10} fontFamily='Arial' fontSize={10}
                          fill={fontColor(selected, hovered, colorDensity)}
                    >
                        {width < 10 ? '' : labelString}
                    </text>
                </svg>
            );
        });
    }

}

GeneSetSvgSelector.propTypes = {
    pathways: PropTypes.any,
    layout: PropTypes.any,
    width: PropTypes.any,
    referenceLayout: PropTypes.any,
    selectedPathways: PropTypes.any,
    hoveredPathways: PropTypes.any,
    associateData: PropTypes.any,
    pathwayLabelHeight: PropTypes.any,
    onClick: PropTypes.any,
    onHover: PropTypes.any,
    onMouseOut: PropTypes.any,
};
