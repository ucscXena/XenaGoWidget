import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {HeaderLabel} from "../components/HeaderLabel";
import {intersection} from 'underscore';
import {getGeneColorMask} from '../functions/ColorFunctions'


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

        const numSamples = this.props.data.samples.length;

        if (pathways.length === layout.length) {
            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let labelString = '';
                let hovered, selected;
                let labelKey = '';
                if (geneLength === 1) {
                    labelString = d.gene[0];
                    hovered = hoveredPathways.indexOf(d.gene[0]) >= 0;
                    selected = selectedPathways.indexOf(labelString) >= 0;
                    labelKey = d.gene[0];
                }
                else {
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
    width: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    offset: PropTypes.any.isRequired,
    onClick: PropTypes.any.isRequired,
    onMouseMove: PropTypes.any.isRequired,
    onMouseOut: PropTypes.any.isRequired,
    geneLabelHeight: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
};
