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
        , cursor: 'crosshair'
    }
};


export default class LabelWrapper extends PureComponent {

    constructor(props) {
        super(props);
    }


    render() {
        let {
            colorSettings
            , geneLabelHeight
            , width
            , height
            , layout
            , onClick
            , onMouseMove
            , onMouseOut
            , associateData
            , cohortIndex
            // , hoveredPathways
            , highlightedGene
            , offset
            , data: {pathways}
        } = this.props;

        return (
            <div style={{...styles.overlay, width, height, top: 77 + offset}}
                 onMouseMove={onMouseMove}
                 onMouseOut={onMouseOut}
                 onClick={onClick}
            >
                <LabelSet
                    associateData={associateData}
                    pathways={pathways}
                    layout={layout}
                    // hoveredPathways={hoveredPathways}
                    selectedPathways={[]}
                    highlightedGene={highlightedGene}
                    labelHeight={geneLabelHeight}
                    height={height}
                    colorMask={getGeneColorMask()}
                    cohortIndex={cohortIndex}
                    colorSettings={colorSettings}
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
