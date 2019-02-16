import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {HeaderLabel} from "../components/HeaderLabel";
import {getGeneColorMask} from '../functions/ColorFunctions'


let styles = {
    overlay: {
        position: 'absolute'
        , display: 'block'
        , zIndex: 10
        , opacity: 1
    }
};


export default class LabelSet extends PureComponent {

    constructor(props) {
        super(props);
    }

    drawOverviewLabels(width, height, layout, pathways, selectedPathways, hoveredPathways, labelHeight, labelOffset, colorMask, cohortIndex, highlightedGene,shadingValue) {

        if (layout[0].size <= 1) {
            return;
        }

        const numSamples = this.props.data.samples.length;
        if (pathways.length === layout.length) {
            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let hovered, selected;
                let labelKey = d.gene[0];
                let labelString = labelKey; // can this go away?
                hovered = hoveredPathways.indexOf(d.gene[0]) >= 0;
                selected = selectedPathways.indexOf(labelString) >= 0;
                let highlighted = highlightedGene === labelKey;
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
                        highlighted={highlighted}
                        labelString={labelString}
                        colorMask={colorMask}
                        key={labelKey + '-' + cohortIndex}
                        shadingValue={shadingValue}
                    />
                )
            });
        }
    }

    drawTissueOverlay() {
        let {shadingValue,geneLabelHeight, width, height, layout, associateData, cohortIndex, hoveredPathways, highlightedGene, data: {pathways}} = this.props;

        if (associateData.length === 0) {
            return;
        }

        // draw genes
        let offset = cohortIndex === 0 ? height - geneLabelHeight : 0;
        return this.drawOverviewLabels(width, height, layout, pathways, [], hoveredPathways, geneLabelHeight, offset, getGeneColorMask(), cohortIndex, highlightedGene,shadingValue);
    }

    render() {
        const {associateData,pathways,layout,hoveredPathways,selectedPathways,highlightedGene,labelHeight,labelOffset,numSamples,colorMask,cohortIndex,shadingValue} = this.props;
        // let offset = cohortIndex === 0 ? height - geneLabelHeight : 0;
        if (associateData.length >0 && pathways.length === layout.length) {
            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let hovered, selected;
                let labelKey = d.gene[0];
                let labelString = labelKey; // can this go away?
                hovered = hoveredPathways.indexOf(d.gene[0]) >= 0;
                selected = selectedPathways.indexOf(labelString) >= 0;
                let highlighted = highlightedGene === labelKey;
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
                        highlighted={highlighted}
                        labelString={labelString}
                        colorMask={colorMask}
                        key={labelKey + '-' + cohortIndex}
                        shadingValue={shadingValue}
                    />
                )
            });
        }
        else{
            return '<div></div>';
        }
    }
}
LabelSet.propTypes = {
    width: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    offset: PropTypes.any.isRequired,
    onClick: PropTypes.any.isRequired,
    onMouseMove: PropTypes.any.isRequired,
    onMouseOut: PropTypes.any.isRequired,
    geneLabelHeight: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
};
