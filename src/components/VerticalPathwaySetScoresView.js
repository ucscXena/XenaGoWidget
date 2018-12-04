import PureComponent from "./PureComponent";
import React from 'react'
import PropTypes from 'prop-types';

import DrawFunctions from '../functions/DrawFunctions';
import CanvasDrawing from "../CanvasDrawing";
import {findAssociatedData, findPruneData} from '../functions/DataFunctions';
import {clusterSampleSort} from '../functions/SortFunctions';
import {pluck, flatten} from 'underscore';
import {FILTER_PERCENTAGE, LABEL_A, LABEL_B, MIN_FILTER} from "./XenaGeneSetApp";


/**
 * Extends PathwaysScoreView (but the old one)
 */
export default class VerticalPathwaySetScoresView extends PureComponent {

    constructor(props){
        super(props);
    }

    // TODO: restructure
    getGenesForPathways(pathways) {
        return Array.from(new Set(flatten(pluck(pathways, 'gene'))));
    };

    render(){

        let { data, cohortIndex, filter, selectedSort, labelHeight, width,selectedCohort} = this.props ;
        const {expression, pathways, samples, copyNumber, referencePathways} = data;

        if(!data || !data.pathways){
            return <div>Loading Cohort {cohortIndex === 0 ? LABEL_A : LABEL_B }</div>
        }
        // need a size and vertical start for each
        let layout = data.pathways.map( ( p , index ) => {
           return { start: index * labelHeight, size: labelHeight }
        } );
        const totalHeight = layout.length *  labelHeight ;
        let geneList = this.getGenesForPathways(pathways);


        // TODO: fix sort somehow

        // TODO: fix filter somehow?
        filter = filter ? filter : 'All';

        // call

        // need to get an associatedData
        let hashAssociation = {
            expression,
            copyNumber,
            geneList,
            pathways,
            samples,
            filter,
            MIN_FILTER,
            cohortIndex,
            selectedCohort
        };
        if (expression === undefined || expression.length === 0) {
            return <div>Loading...</div>
        }
        let associatedData = findAssociatedData(hashAssociation);
        let filterMin = Math.trunc(FILTER_PERCENTAGE * samples.length);

        let hashForPrune = {
            associatedData,
            pathways,
            filterMin
        };
        let prunedColumns = findPruneData(hashForPrune);
        prunedColumns.samples = samples;
        let returnedValue = clusterSampleSort(prunedColumns);

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
                    associatedData={returnedValue.data}
                    data={{
                        expression,
                        pathways: returnedValue.pathways,
                        referencePathways,
                        samples,
                        sortedSamples: returnedValue.sortedSamples
                    }}
                />
            </div>
        )
    }
}

VerticalPathwaySetScoresView.propTypes = {
    data: PropTypes.any,
    cohortIndex: PropTypes.any,
};
