import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {getGeneColorMask} from '../functions/ColorFunctions'
import LabelSet from "./LabelSet";


let styles = {
    overlay: {
        position: 'absolute'
        , display: 'block'
        , zIndex: 10
        , opacity: 1
    }
};


export default class LabelWrapper extends PureComponent {

    constructor(props) {
        super(props);
    }


    render() {
        let {
            shadingValue
            , geneLabelHeight
            , width
            , height
            , layout
            , onClick
            , onMouseMove
            , onMouseOut
            , associateData
            , cohortIndex
            , hoveredPathways
            , highlightedGene
            , data: {pathways}
        } = this.props;


        // let offset = cohortIndex === 0 ? height - geneLabelHeight : 0;
        let offset = cohortIndex === 0 ? 225 : 250 ;
        return (
            <div style={{...styles.overlay, width, height, top: 74 + offset}}
                 onMouseMove={onMouseMove}
                 onMouseOut={onMouseOut}
                 onClick={onClick}
            >
                <LabelSet
                    associateData={associateData}
                    pathways={pathways}
                    layout={layout}
                    hoveredPathways={hoveredPathways}
                    selectedPathways={[]}
                    highlightedGene={highlightedGene}
                    labelHeight={geneLabelHeight}
                    labelOffset={offset}
                    colorMask={getGeneColorMask()}
                    cohortIndex={cohortIndex}
                    shadingValue={shadingValue}
                    data={this.props.data}
                />
            </div>
        )
    }
}
LabelWrapper.propTypes = {
    width: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    offset: PropTypes.any.isRequired,
    onClick: PropTypes.any.isRequired,
    onMouseMove: PropTypes.any.isRequired,
    onMouseOut: PropTypes.any.isRequired,
    geneLabelHeight: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
};
