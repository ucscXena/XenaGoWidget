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
        const { data, cohortIndex} = this.props.data ;
        return (
            <div>
                Left or Right Details
                <CanvasDrawing
                    // width={width}
                    // height={height}
                    // layout={layout}
                    // referenceLayout={referenceLayout}
                    // filter={filterString}
                    draw={DrawFunctions.drawPathwayView}
                    // selectedPathways={data.selectedPathways}
                    cohortIndex={cohortIndex}
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
