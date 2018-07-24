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

    drawOverviewLabels(width, height, layout, pathways, selectedPathways, hoveredPathways, labelHeight, labelOffset, colorMask) {

        if (layout[0].size <= 1) {
            return;
        }

        const highestScore = pathways.reduce((max, current) => {
            let score = current.density / current.gene.length;
            return (max > score) ? max : score;
        }, 0);

        if (pathways.length === layout.length) {
            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let labelString, hovered, selected;
                if (geneLength === 1) {
                    labelString = d.gene[0];
                    hovered = hoveredPathways.indexOf(labelString) >= 0;
                    selected = selectedPathways.indexOf(labelString) >= 0;
                }
                else {
                    labelString = '(' + d.gene.length + ') ';
                    // pad for 1000, so 4 + 2 parans
                    while (labelString.length < 5) {
                        labelString += ' ';
                    }

                    labelString += d.golabel;
                    selected = selectedPathways.indexOf(d.golabel) >= 0;

                    hovered = intersection(hoveredPathways, d.gene).length > 0;
                    hovered = hovered || hoveredPathways.indexOf(d.golabel)===0 ;
                }
                return (
                    <HeaderLabel
                        labelHeight={labelHeight}
                        labelOffset={labelOffset}
                        highScore={highestScore}
                        geneLength={geneLength}
                        left={el.start}
                        width={el.size}
                        item={d}
                        selected={selected}
                        hovered={hovered}
                        labelString={labelString}
                        colorMask={colorMask}
                        key={labelString}
                    />
                )
            });
        }
    }

    drawTissueOverlay(div, props) {
        let {pathwayLabelHeight, geneLabelHeight, width, height, layout, referenceLayout, associateData, selectedPathways, hoveredPathways, data: {pathways, referencePathways}} = props;

        if (associateData.length === 0) {
            return;
        }


        let labels;

        if (referencePathways) {

            // TODO: for each gene, map the other pathways that gene is involved in
            let pathwayMapping = pathways.map(p => {
                return {
                    label: p.gene[0],
                    density: p.density,
                }
            });


            // calculates the scores for the pathways based on existing gene density
            let newRefPathways = referencePathways.map(r => {

                let density = 0;

                // TODO: this could be a lot faster
                for (let gene of  r.gene) {
                    let found = pathwayMapping.filter(pm => pm.label === gene);
                    if (found.length > 0) {
                        density += found.reduce((sum, a) => sum + a.density, 0);
                    }
                }

                // TODO: there is a race condition in here, that is messing this up
                return {
                    goid: r.goid,
                    golabel: r.golabel,
                    gene: r.gene,
                    density: density,
                };
            });

            let l1 = this.drawOverviewLabels(width, height, referenceLayout, newRefPathways, selectedPathways, hoveredPathways, pathwayLabelHeight, 0, getPathwayColorMask());
            let l2 = this.drawOverviewLabels(width, height, layout, pathways, [], hoveredPathways, geneLabelHeight, pathwayLabelHeight, getGeneColorMask());
            labels = [...l1, ...l2];
        }
        else {
            labels = this.drawOverviewLabels(width, height, layout, pathways, selectedPathways, hoveredPathways, pathwayLabelHeight, 0, getPathwayColorMask());
        }
        return labels;

    }

    render() {
        const {width, height, onClick, onMouseMove, onMouseOut, offset} = this.props;
        return (
            <div style={{...styles.overlay, width, height, top: 74 + offset}}
                 onMouseMove={onMouseMove}
                 onMouseOut={onMouseOut}
                 onClick={onClick}
            >
                {this.drawTissueOverlay(this, this.props)}
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
};
