import PureComponent from './PureComponent';
import React from 'react';
import PropTypes from 'prop-types';

import DrawFunctions from '../functions/DrawFunctions';
import { VERTICAL_GENESET_DETAIL_WIDTH ,VERTICAL_GENESET_SUPPRESS_WIDTH } from '../components/XenaGeneSetApp';
import CanvasDrawing from './CanvasDrawing';
import {createAssociatedDataKey, findAssociatedData, findPruneData} from '../functions/DataFunctions';
import {clusterSampleSort} from '../functions/SortFunctions';
import {getGenesForPathways, getLabelForIndex} from '../functions/CohortFunctions';

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
  // eslint-disable-next-line no-unused-vars
  let {x, y} = getMousePos(event);
  let pathwayIndex = pathwayIndexFromY(y, labelHeight);
  return pathways[pathwayIndex];
}

/**
 * Extends PathwaysScoreView (but the old one)
 */
export default class VerticalGeneSetScoresView extends PureComponent {

    handleHoverOut = () => {
      this.props.onHover(null);
    };

    handleHover = (event) => {
      this.props.onHover(getPointData(event, this.props));
    };

    handleClick = (event) => {
      this.props.onClick(getPointData(event, this.props));
    };

    render() {

      let {data, cohortIndex, filter, labelHeight, selectedCohort, pathways,showDetails} = this.props;
      const {expression, samples, copyNumber, geneExpression, geneExpressionPathwayActivity} = data;
      if (!data) {
        return <div>Loading Cohort {getLabelForIndex(cohortIndex)}</div>;
      }
      // need a size and vertical start for each
      let layout = pathways.map((p, index) => {
        return {start: index * labelHeight, size: labelHeight};
      });

      const totalHeight = layout.length * labelHeight;
      let geneList = getGenesForPathways(pathways);

      // need to get an associatedData
      let hashAssociation = {
        expression,
        copyNumber,
        geneExpression,
        geneList,
        pathways,
        samples,
        filter,
        geneExpressionPathwayActivity,
        selectedCohort
      };
      if (expression === undefined || expression.length === 0) {
        return <div>Loading...</div>;
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
            associatedData={returnedValue.data}
            cohortIndex={cohortIndex}
            draw={DrawFunctions.drawGeneSetView}
            height={totalHeight}
            labelHeight={labelHeight}
            layout={layout}
            onClick={this.handleClick}
            onHover={this.handleHover}
            onMouseOut={this.handleHoverOut}
            width={showDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}
          />
        </div>
      );
    }
}

VerticalGeneSetScoresView.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
  labelHeight: PropTypes.any.isRequired,
  onClick: PropTypes.any.isRequired,
  onHover: PropTypes.any.isRequired,
  onMouseOut: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,
  showDetails: PropTypes.any.isRequired,
};
