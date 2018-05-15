import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {HeaderLabel} from "../components/HeaderLabel";


let styles = {
    overlay: {
        position: 'absolute'
        , display: 'block'
        , zIndex: 9999
        , opacity: 1
    }
};


export default class SVGLabels extends PureComponent {

    constructor(props){
        super(props);
    }

    drawOverviewLabels(width, height, layout, pathways, selectedPathways, labelHeight, labelOffset, colorMask) {

        if (layout[0].size <= 1) {
            return;
        }

        const highestScore = pathways.reduce((max, current) => (max > current.density) ? max : current.density,0);

        if (pathways.length === layout.length) {
            return layout.map((el, i) => {
                let d = pathways[i];

                // let color = Math.round(maxColor * (1.0 - (d.density / highestScore)));
                // let colorString = 'rgb(256,' + color + ',' + color + ')'; // sets the color to fill in the rectangle with
                let geneLength = d.gene.length;
                let labelString;
                if (geneLength === 1) {
                    labelString = d.gene[0];
                }
                else {
                    labelString = '(' + d.gene.length + ') ';
                    // pad for 1000, so 4 + 2 parans
                    while (labelString.length < 5) {
                        labelString += ' ';
                    }

                    labelString += d.golabel;
                }
                return (
                    <HeaderLabel
                        labelHeight={labelHeight}
                        labelOffset={labelOffset}
                        highScore={highestScore}
                        left={el.start}
                        width={el.size}
                        item={d}
                        selectedPathways={selectedPathways}
                        labelString={labelString}
                        colorMask={colorMask}
                        // onMouseClick={selectPathway}
                        key={labelString}
                    />
                )
            });
        }
    }

    drawTissueOverlay(div, props) {
        let {width, height, layout, referenceLayout, associateData, data: {selectedPathways, pathways, referencePathways}} = props;

        if (associateData.length === 0) {
            return;
        }


        let labels;
        if (referencePathways) {

            // TODO: for each gene, map the other pathways that gene is involved in
            let pathwayMapping = pathways.map( p => {
                return {
                    label:p.gene[0],
                    density: p.density,
                }
            });


            // calculates the scores for the pathways based on existing gene density
            let newRefPathways = referencePathways.map( r => {

                let density = 0 ;

                // TODO: this could be a lot faster
                for( let gene of  r.gene){
                    let found = pathwayMapping.filter( pm => pm.label === gene );
                    if(found.length>0){
                        density += found.reduce( (sum , a ) => sum + a.density , 0);
                    }
                }

                // TODO: there is a race condition in here, that is messing this up
                return  {
                    goid: r.goid,
                    golabel: r.golabel,
                    gene: r.gene,
                    density: density,
                };
            });

            let l1 = this.drawOverviewLabels(width, height, referenceLayout, newRefPathways, selectedPathways, 150, 0, [0, 1, 1]);
            let l2 = this.drawOverviewLabels(width, height, layout, pathways, [], 150, 150, [1, 0, 0]);
            labels = [...l1, ...l2];
        }
        else {
            labels = this.drawOverviewLabels(width, height, layout, pathways, selectedPathways, 150, 0, [0, 1, 1]);
        }
        return labels;

    }

    render() {
        const { width, height ,onClick,onMouseMove,offset} = this.props;
        return (
            <div style={{...styles.overlay, width, height,top:72+offset}}
                 onMouseMove={onMouseMove}
                 onClick={onClick}
            >
                { this.drawTissueOverlay(this,this.props) }
            </div>
        )
    }
}
SVGLabels.propTypes = {
    width: PropTypes.any,
    height: PropTypes.any,
    offset: PropTypes.any,
    // onMouseOver: PropTypes.any,
    onClick: PropTypes.any,
    onMouseOver: PropTypes.any,
};
