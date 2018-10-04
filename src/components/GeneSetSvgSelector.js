import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {intersection, union, flatten} from 'underscore';
import {
    fontColor,
    getHoverColor,
    getSelectColor,
    getPathwayColorMask,
    getColorDensity
} from "../functions/ColorFunctions";
import {LABEL_A, LABEL_B} from "./XenaGeneSetApp";

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
                // backgroundColor: getHoverColor(score),
                strokeWidth: 1,
                // border: 'solid red',
                // cursor: 'crosshair',
                // outline: '2px solid blue',
                boxShadow: '0 0 2px 2px red',
                borderRadius: '25px',

            }
        }

        else if (hovered) {
            return {
                // position: 'absolute',
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
                // backgroundColor: colorString,
                strokeWidth: 2,
                cursor: 'pointer'
            }
        }
    }

    pillStyle(score, colorMask) {
        let colorString = 'rgba(';
        colorString += colorMask[0];
        colorString += ',';
        colorString += colorMask[1];
        colorString += ',';
        colorString += colorMask[2];
        colorString += ',';
        colorString += score + ')';
        return {
            // position: 'absolute',
            top: 0,
            left: 0,
            height: 20,
            // width: 20,
            strokeWidth: 1,
            stroke: colorString,
            fill: colorString,

            cursor: 'pointer'
        }
    }


    onClick = (geneSet, event) => {
        // console.log('local mouse CLICK event', event, geneSet);
        let {onClick} = this.props;
        if (onClick) {
            onClick(geneSet);
        }
    };

    onMouseOut = (geneSet, event) => {
        // console.log('local mouse out event', geneSet);
        let {onHover} = this.props;
        onHover(null);
    };

    onHover = (geneSet, event) => {
        // console.log('local mouse enter event', geneSet);
        let {onHover} = this.props;
        if (onHover) {
            onHover(geneSet);
        }
        else {
            onHover(null);
        }
    };

    getSelectedGenes(selectedPathways, referencePathways) {
        if (!referencePathways) return [];

        let selectedPathwayGenes = flatten(selectedPathways.map(p => p.gene));

        // // let filteredGeneSet = referencePathways.filter(ref => {
        // //     return selectedPathwayGenes.indexOf(ref.golabel) >= 0;
        // // });
        // // TODO: should this process with the gen, as well?
        // let filteredGeneSet = referencePathways.filter(ref => {
        //     return selectedPathwayGenes.indexOf(ref.golabel) >= 0;
        // });
        // console.log('FILTERED GENES',selectedPathways,selectedPathwayGenes,referencePathways,filteredGeneSet);
        // return unique(flatten(filteredGeneSet.map(g => g.gene)));
        return selectedPathwayGenes
    }

    render() {
        let {pathways, selectedPathways, hoveredPathways, width, labelHeight, labelOffset, left} = this.props;
        labelHeight = 20;

        if (selectedPathways.length === 0) {
            return (
                <div></div>
            )
        }

        let selectedGenes = this.getSelectedGenes(selectedPathways, pathways);


        let newRefPathways = pathways.map(r => {

            //     // JICARD INDEX: https://en.wikipedia.org/wiki/Jaccard_index
            //     // intersection of values divided by union of values
            let overlappingGenes = intersection(selectedGenes, r.gene);
            let allGenes = union(selectedGenes, r.gene);
            let density = allGenes.length === 0 ? 0 : overlappingGenes.length / allGenes.length;

            // console.log('DENS 1: ', density);

            return {
                goid: r.goid,
                golabel: r.golabel,
                gene: r.gene,
                density: density,
                firstDensity: r.firstDensity,
                secondDensity: r.secondDensity,
            };
        });

        const highFirstScore = newRefPathways.reduce((max, current) => {
            let score = current.firstDensity / current.gene.length;
            // let score = current.gene.length;
            return (max > score) ? max : score;
        }, 0);
        const highSecondScore = newRefPathways.reduce((max, current) => {
            let score = current.secondDensity / current.gene.length;
            // let score = current.gene.length;
            return (max > score) ? max : score;
        }, 0);


        let hoveredLabel = hoveredPathways ? hoveredPathways.golabel : '';
        let genesToHover = hoveredPathways ? hoveredPathways.gene : '';
        let selectedLabels = selectedPathways.map(p => p && p.golabel);
        let colorMask = getPathwayColorMask();

        return newRefPathways.map((p, index) => {
            let labelString = '(' + p.gene.length + ') ' + p.golabel;

            let hovered = intersection(genesToHover, p.gene).length > 0;
            hovered = hovered || p.gene.indexOf(hoveredLabel) >= 0;
            let selected = selectedLabels.indexOf(p.golabel) >= 0;
            let firstDensity= getColorDensity(p.firstDensity , p.gene.length, highFirstScore);
            let secondDensity= getColorDensity(p.secondDensity , p.gene.length, highSecondScore);
            let colorDensity = firstDensity + secondDensity ;
            // console.log(firstDensity,secondDensity,colorDensity)
            return (
                <svg
                    style={this.labelStyle(colorDensity, selected, hovered, labelOffset, left, width, labelHeight, colorMask)}
                    onMouseDown={this.onClick.bind(this, p)}
                    onMouseOut={this.onMouseOut.bind(this, p)}
                    onMouseOver={this.onHover.bind(this, p)}
                    key={p.golabel}
                >
                    {firstDensity &&
                    <rect width={width / 2-1} x={0}
                          style={this.pillStyle(firstDensity, colorMask)}/>
                    }
                    {secondDensity &&
                    <rect width={width / 2} x={width / 2+1} height={labelHeight}
                          style={this.pillStyle(secondDensity, colorMask)}/>
                    }
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
