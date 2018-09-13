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


    getLabelForPoint(event, props) {

    }


    onClick = (event) => {
        console.log('local mouse CLICK event', event);
        let {onClick, associateData} = this.props;
        if (associateData.length && onClick) {
            onClick(this.getLabelForPoint(event, this.props))
        }
        // return {
        //     pathway: pathways[pathwayIndex],
        //     tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
        //     expression,
        //     metaSelect: metaSelect
        // };
    };

    onMouseOut = (event) => {
        console.log('local mouse out event', event);
        let {onHover} = this.props;
        onHover(null);
        // return {
        //     pathway: pathways[pathwayIndex],
        //     tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
        //     expression,
        //     metaSelect: metaSelect
        // };
    };

    onHover = (event) => {
        console.log('local mouse enter event', event);
        let {onHover} = this.props;
        if (onHover) {
            let pointData = this.getLabelForPoint(event, this.props);
            onHover(pointData);
        }
        else {
            onHover(null);
        }
        // return {
        //     pathway: pathways[pathwayIndex],
        //     tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
        //     expression,
        //     metaSelect: metaSelect
        // };
    };

    render() {
        let {pathways, selected, hovered, width, labelString, labelHeight, item, geneLength, highScore, labelOffset, left, colorMask, onClick, onMouseHover, onMouseOut} = this.props;
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
            let density = Math.random();

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


        return newRefPathways.map((p, index) => {
            let labelString = p.golabel;
            colorDensity = p.density;
            return (
                <svg
                    style={this.labelStyle(colorDensity, selected, hovered, labelOffset, left, width, labelHeight, colorMask)}
                    className={className}
                    onMouseDown={this.onClick}
                    onMouseOut={this.onMouseOut}
                    onMouseOver={this.onHover}
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

}

GeneSetSvgSelector.propTypes = {
    value: PropTypes.any,
    pathways: PropTypes.any,
};
