import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {HeaderLabel} from "../components/HeaderLabel";
import {getGeneColorMask} from '../functions/ColorFunctions'




export default class LabelSet extends PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        const {
            associateData
            , pathways
            , layout
            , hoveredPathways
            , selectedPathways
            , highlightedGene
            , labelHeight
            , labelOffset
            , colorMask
            , cohortIndex
            , shadingValue
            , data
        } = this.props;
        if (data && data.samples && associateData && associateData.length > 0 && pathways.length === layout.length) {
            const numSamples = data.samples.length;
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
        else {
            return <div></div>;
        }
    }
}
LabelSet.propTypes = {
    associateData: PropTypes.any.isRequired,
    pathways: PropTypes.any.isRequired,
    data: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired,
    hoveredPathways: PropTypes.any.isRequired,
    selectedPathways: PropTypes.any.isRequired,
    // highlightedGene: PropTypes.any.isRequired,
    labelHeight: PropTypes.any.isRequired,
    labelOffset: PropTypes.any.isRequired,
    colorMask: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    shadingValue: PropTypes.any.isRequired,
};
