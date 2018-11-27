import PureComponent from "./PureComponent";
import React from 'react'
import PropTypes from 'prop-types';

import DrawFunctions from '../functions/DrawFunctions';
import CanvasDrawing from "../CanvasDrawing";

/**
 * Extends PathwaysScoreView (but the old one)
 */
export default class VerticalPathwaySetScoresView extends PureComponent {

    constructor(props){
        super(props);
    }

    render(){

        const { data, cohortIndex, labelHeight, width} = this.props ;
        console.log('input data,',data)
        if(!data || !data.pathways){
            return <div>No data {cohortIndex}</div>
        }
        // need a size and vertical start for each
        let layout = data.pathways.map( ( p , index ) => {
           return { start: index * labelHeight, size: labelHeight }
        } );
        console.log('layout',layout)
        const totalHeight = layout.length *  labelHeight ;
        // let layoutData = layout(width, returnedValue.data);
        return (
            <div>
                <CanvasDrawing
                    {...this.props}
                    width={width}
                    layout={layout}
                    draw={DrawFunctions.drawPathwayView}
                    cohortIndex={cohortIndex}
                    labelHeight={labelHeight}
                    height={totalHeight}
                    data={data}
                />
            </div>
        )
    }
}

VerticalPathwaySetScoresView.propTypes = {
    data: PropTypes.any,
    cohortIndex: PropTypes.any,
};
