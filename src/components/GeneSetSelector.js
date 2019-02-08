import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {intersection} from 'underscore';
import {
    getHighlightedColor,
    getGeneSetColorMask
} from "../functions/ColorFunctions";
import * as d3 from "d3";

let interpolate ;

export class GeneSetSelector extends PureComponent {

    constructor(props) {
        super(props);
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
     * @param highlighted
     * @returns {*}
     */
    labelStyle(score, selected, hovered, labelOffset, left, width, labelHeight, colorMask, highlighted) {

        if (selected) {
            return {
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                strokeWidth: 1,
                boxShadow: '0 0 4px 4px blue',
                borderRadius: '25px',

            }
        }

        else if (hovered) {
            return {
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                strokeWidth: 1,
                borderRadius: '15px',
                boxShadow: '0 0 2px 2px green',
                cursor: 'pointer'
            }
        }
        else if (highlighted)  {
            return {
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                strokeWidth: 1,
                borderRadius: '15px',
                boxShadow: '0 0 2px 2px ' + getHighlightedColor(),
                cursor: 'pointer'
            }
        }
        else {
            return {
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                strokeWidth: 2,
                cursor: 'pointer'
            }
        }
    }

    pillStyle(score) {
        let colorString = interpolate(score);

        return {
            top: 0,
            left: 0,
            height: this.props.labelHeight,
            strokeWidth: 1,
            stroke: colorString,
            fill: colorString,

            cursor: 'pointer'
        }
    }


    onClick = (geneSet, event) => {
        let {onClick} = this.props;
        if (onClick) {
            onClick(geneSet);
        }
    };

    onMouseOut = () => {
        let {onHover} = this.props;
        onHover(null);
    };

    onHover = (geneSet, event) => {
        let {onHover} = this.props;
        if (onHover) {
            onHover(geneSet);
        }
        else {
            onHover(null);
        }
    };


    render() {
        let {geneStateColors,pathways, selectedPathways, topOffset, hoveredPathways, width, labelHeight, highlightedGene, labelOffset, left,showReciprocalPathway} = this.props;
        if (selectedPathways.length === 0) {
            return (
                <div></div>
            )
        }
        let newRefPathways =  JSON.parse(JSON.stringify(pathways));
        let hoveredLabel = hoveredPathways ? hoveredPathways.golabel : '';
        let genesToHover = hoveredPathways ? hoveredPathways.gene : '';
        let selectedLabels = selectedPathways.map(p => p && p.golabel);
        let colorMask = getGeneSetColorMask();
        interpolate = d3.scaleLinear().domain([-geneStateColors.domain,0,geneStateColors.domain]).range([geneStateColors.lowColor,geneStateColors.midColor,geneStateColors.highColor]).interpolate(d3.interpolateRgb.gamma(geneStateColors.gamma));
        // interpolate = d3.scaleLinear().domain([-this.props.domain,0,this.props.domain]).range([this.props.lowColor,'white',this.props.highColor]).interpolate(d3.interpolateRgb.gamma(this.props.gamma));

        return newRefPathways.map((p) => {
            let labelString = '(' + p.gene.length + ') ' + p.golabel;
            let hovered = hoveredPathways ? p.golabel === hoveredPathways.golabel : false ;
            if(showReciprocalPathway){
                hovered = hovered ||  intersection(genesToHover, p.gene).length > 0;
                hovered = hovered || p.gene.indexOf(hoveredLabel) >= 0;
            }
            let selected = selectedLabels.indexOf(p.golabel) >= 0;
            let highlighted = p.gene.indexOf(highlightedGene) >= 0;

            return (
                <svg
                    style={this.labelStyle((p.firstObserved + p.secondObserved) / 2.0, selected, hovered, labelOffset, left, width, labelHeight, colorMask, highlighted)}
                    onMouseDown={this.onClick.bind(this, p)}
                    onMouseOut={this.onMouseOut.bind(this, p)}
                    onMouseOver={this.onHover.bind(this, p)}
                    key={p.golabel}
                >
                    {p.firstObserved &&
                    <rect width={width / 2 - 1} x={0} height={labelHeight}
                          style={this.pillStyle(p.firstChiSquared)}/>
                    }
                    {p.secondObserved &&
                    <rect width={width / 2} x={width / 2 + 1} height={labelHeight}
                          style={this.pillStyle(p.secondChiSquared)}/>
                    }
                    <text x={10} y={topOffset} fontFamily='Arial' fontWeight={'bold'} fontSize={12}
                          fill={'black'}
                    >
                        {width < 10 ? '' : labelString}
                    </text>
                </svg>
            );
        });
    }

}

GeneSetSelector.propTypes = {
    pathways: PropTypes.any.isRequired,
    width: PropTypes.any.isRequired,
    selectedPathways: PropTypes.any.isRequired,
    hoveredPathways: PropTypes.any,
    labelHeight: PropTypes.any.isRequired,
    topOffset: PropTypes.any.isRequired,
    onClick: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    onMouseOut: PropTypes.any.isRequired,
    highlightedGene: PropTypes.any,
};
