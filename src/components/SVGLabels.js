import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {HeaderLabel} from "../components/HeaderLabel";
import {intersection} from 'underscore';
import {getGeneColorMask, getPathwayColorMask} from '../functions/ColorFunctions'


let styles = {
    overlay: {
        position: 'absolute'
        , display: 'block'
        , zIndex: 1000
        , opacity: 1
    }
};


export default class SVGLabels extends PureComponent {

    constructor(props) {
        super(props);
    }

    drawOverviewLabels(width, height, layout, pathways, selectedPathways, hoveredPathways, labelHeight, labelOffset, colorMask, cohortIndex) {

        if (layout[0].size <= 1) {
            return;
        }

        // const highestScore = pathways.reduce((max, current) => {
        //     let score = current.density / current.gene.length;
        //     return (max > score) ? max : score;
        // }, 0);
        const numSamples = this.props.data.samples.length;

        if (pathways.length === layout.length) {
            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let labelString = '';
                let hovered, selected;
                let labelKey = '';
                if (geneLength === 1) {
                    // labelString = cohortIndex === 1 ? d.gene[0] : '';
                    labelString = d.gene[0];
                    hovered = hoveredPathways.indexOf(d.gene[0]) >= 0;
                    selected = selectedPathways.indexOf(labelString) >= 0;
                    labelKey = d.gene[0];
                }
                else {
                    // if(cohortIndex===1){
                    labelString = '(' + d.gene.length + ') ';
                    // pad for 1000, so 4 + 2 parans
                    while (labelString.length < 5) {
                        labelString += ' ';
                    }
                    labelString += d.golabel;
                    // }
                    selected = selectedPathways.indexOf(d.golabel) >= 0;

                    hovered = intersection(hoveredPathways, d.gene).length > 0;
                    hovered = hovered || hoveredPathways.indexOf(d.golabel) === 0;
                    labelKey = d.golabel;
                }
                return (
                    <HeaderLabel
                        labelHeight={labelHeight}
                        labelOffset={labelOffset}
                        numSamples={numSamples}
                        geneLength={geneLength}
                        left={el.start}
                        width={el.size}
                        item={d}
                        selected={selected}
                        hovered={hovered}
                        labelString={labelString}
                        colorMask={colorMask}
                        key={labelKey + '-' + cohortIndex}
                    />
                )
            });
        }
    }

    drawTissueOverlay() {
        let {geneLabelHeight, width, height, layout, associateData, cohortIndex, hoveredPathways, data: {pathways}} = this.props;

        if (associateData.length === 0) {
            return;
        }


        // draw genes
        let offset = cohortIndex === 0 ? height - geneLabelHeight : 0;
        return this.drawOverviewLabels(width, height, layout, pathways, [], hoveredPathways, geneLabelHeight, offset, getGeneColorMask(), cohortIndex);
    }

    render() {
        const {width, height, onClick, onMouseMove, onMouseOut, offset} = this.props;


        return (
            <div style={{...styles.overlay, width, height, top: 74 + offset}}
                 onMouseMove={onMouseMove}
                 onMouseOut={onMouseOut}
                 onClick={onClick}
            >
                {this.drawTissueOverlay()}
            </div>
        )
    }
}
SVGLabels.propTypes = {
    width: PropTypes.any,
    height: PropTypes.any,
    offset: PropTypes.any,
    onClick: PropTypes.any,
    onMouseOver: PropTypes.any,
    onMouseOut: PropTypes.any,
    pathwayLabelHeight: PropTypes.any,
    geneLabelHeight: PropTypes.any,
    cohortIndex: PropTypes.any,
};
