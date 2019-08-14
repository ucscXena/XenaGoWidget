import PureComponent from "./PureComponent";
import React from 'react'
import PropTypes from 'prop-types';

import DrawFunctions from '../functions/DrawFunctions';
import CanvasDrawing from "./CanvasDrawing";
import {createAssociatedDataKey, findAssociatedData, findPruneData} from '../functions/DataFunctions';
import {clusterSampleSort} from '../functions/SortFunctions';
import {MIN_FILTER} from "./XenaGeneSetApp";
import {getGenesForPathways} from "../functions/CohortFunctions";

const HEADER_HEIGHT = 15;

function pathwayIndexFromY(y, labelHeight) {
    return Math.round((y - HEADER_HEIGHT) / labelHeight);
}

function getMousePos(evt) {
    let rect = evt.currentTarget.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function getPointData(event, props) {
    let {labelHeight, pathways} = props;
    let {x, y} = getMousePos(event);
    let pathwayIndex = pathwayIndexFromY(y, labelHeight);
    return pathways[pathwayIndex];
}

/**
 * Extends PathwaysScoreView (but the old one)
 */
export default class VerticalGeneSetScoresView extends PureComponent {

    constructor(props) {
        super(props);
    }

    onMouseOut = (event) => {
        this.props.onHover(null);
    };

    onHover = (event) => {
        let pointData = getPointData(event, this.props);
        this.props.onHover(pointData);
    };

    onClick = (event) => {
        this.props.onClick(getPointData(event, this.props))
    };

    render() {

        let {data, cohortIndex, filter, labelHeight, width, selectedCohort, cohortLabel,pathways} = this.props;
        const {expression, samples, copyNumber} = data;
        // console.log('input data',JSON.stringify(data))
        if (!data) {
            return <div>Loading Cohort {cohortLabel}</div>
        }
        // need a size and vertical start for each
        let layout = pathways.map((p, index) => {
            return {start: index * labelHeight, size: labelHeight}
        });

        const totalHeight = layout.length * labelHeight;
        let geneList = getGenesForPathways(pathways);


        // TODO: fix sort somehow

        // TODO: fix filter somehow?
        filter = filter ? filter : 'All';

        // need to get an associatedData
        let hashAssociation = {
            expression,
            copyNumber,
            geneList,
            pathways,
            samples,
            filter,
            selectedCohort
        };
        if (expression === undefined || expression.length === 0) {
            return <div>Loading...</div>
        }
        let associatedDataKey = createAssociatedDataKey(hashAssociation);
        let associatedData = findAssociatedData(hashAssociation,associatedDataKey);

        let prunedColumns = findPruneData(associatedData,associatedDataKey);
        prunedColumns.samples = samples;
        let returnedValue = clusterSampleSort(prunedColumns);

        return (
            <div>
                <CanvasDrawing
                    {...this.props}
                    width={width}
                    layout={layout}
                    draw={DrawFunctions.drawGeneSetView}
                    cohortIndex={cohortIndex}
                    labelHeight={labelHeight}
                    height={totalHeight}
                    associatedData={returnedValue.data}
                    onClick={this.onClick}
                    onHover={this.onHover}
                    onMouseOut={this.onMouseOut}
                    data={{
                        expression,
                        pathways: returnedValue.pathways,
                        samples,
                        sortedSamples: returnedValue.sortedSamples
                    }}
                />
            </div>
        )
    }
}

VerticalGeneSetScoresView.propTypes = {
    data: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    filter: PropTypes.any.isRequired,
    width: PropTypes.any.isRequired,
    labelHeight: PropTypes.any.isRequired,
    onClick: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    onMouseOut: PropTypes.any.isRequired,
    cohortLabel: PropTypes.any.isRequired,
};
