import PureComponent from './PureComponent';
import React from 'react';
import PropTypes from 'prop-types';

import DrawFunctions from '../functions/DrawFunctions';
import {VIEW_ENUM} from '../data/ViewEnum';
import CanvasDrawing from './CanvasDrawing';
import {createAssociatedDataKey, findAssociatedData, findPruneData} from '../functions/DataFunctions';
import {
  clusterSampleSort,
  selectedSampleGeneExpressionActivitySort,
  selectedSampleParadigmActivitySort
} from '../functions/SortFunctions';
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

function sampleIndexFromX(x, width, cohortIndex, sampleLength) {
  if(cohortIndex===0){
    return Math.trunc( x / (width / sampleLength) );
  }
  else
  if(cohortIndex===1){
    return Math.trunc( x / (width / sampleLength) );
  }
  else{
    console.error('how we get here?');
  }

  return undefined;
}

function getPointData(event, props) {
  console.log('getting point data');
  let {labelHeight, pathways,cohortIndex, data, width} = props;
  // eslint-disable-next-line no-unused-vars
  let {x, y} = getMousePos(event);
  let pathwayIndex = pathwayIndexFromY(y, labelHeight);
  let sampleIndex = sampleIndexFromX(x,width, cohortIndex, data.samples.length);
  console.log('point data',pathwayIndex,sampleIndex);
  // return update( pathways[pathwayIndex],{
  //   tissue: { $set: sampleIndex < 0 ? 'Header' : data.samples[sampleIndex]},
  //   cohortIndex: { $set: cohortIndex},
  // });
  return {
    pathway: pathways[pathwayIndex],
    tissue: sampleIndex < 0 ? 'Header' : data.samples[sampleIndex],
    cohortIndex,
  };
  // return pathways[pathwayIndex];
}

/**
 * Extends PathwaysScoreView (but the old one)
 */
export default class VerticalGeneSetScoresView extends PureComponent {


    handleHoverOut = () => {
      this.props.onHover(null);
    };

    handleHover = (event) => {
      console.log('VGS',this.props.cohortIndex);
      this.props.onHover(getPointData(event, this.props));
    };

    handleClick = (event) => {
      this.props.onClick(getPointData(event, this.props));
    };

    sortSampleActivity(filter, prunedColumns, selectedGeneSet) {
      switch (filter) {
      case VIEW_ENUM.GENE_EXPRESSION:
        return selectedSampleGeneExpressionActivitySort(prunedColumns,selectedGeneSet);
      case VIEW_ENUM.PARADIGM:
        return selectedSampleParadigmActivitySort(prunedColumns,selectedGeneSet);
      default:
        return clusterSampleSort(prunedColumns);
      }
    }

    render() {

      let {data, cohortIndex, filter, labelHeight, selectedCohort, pathways, width} = this.props;
      const {expression, samples, copyNumber, geneExpression, geneExpressionPathwayActivity, paradigm,  paradigmPathwayActivity} = data;
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
        geneExpressionPathwayActivity,
        paradigm,
        paradigmPathwayActivity,
        geneList,
        pathways,
        samples,
        filter,
        selectedCohort
      };
      if (expression === undefined || expression.length === 0) {
        return <div>Loading...</div>;
      }
      let associatedDataKey = createAssociatedDataKey(hashAssociation);
      let associatedData = findAssociatedData(hashAssociation,associatedDataKey);

      let prunedColumns = findPruneData(associatedData,associatedDataKey);
      console.log('Gene Set pruned columns',prunedColumns.data);
      // prunedColumns.samples = samples;
      // console.log('B input pruned columns',prunedColumns.samples,'vs',samples);
      // let returnedValue = this.sortSampleActivity(filter,prunedColumns,selectedGeneSet) ;
      // console.log('output returned value',returnedValue);


      return (
        <div>
          <CanvasDrawing
            {...this.props}
            associatedData={prunedColumns.data}
            cohortIndex={cohortIndex}
            draw={DrawFunctions.drawGeneSetView}
            height={totalHeight}
            labelHeight={labelHeight}
            layout={layout}
            onClick={this.handleClick}
            onHover={this.handleHover}
            onMouseOut={this.handleHoverOut}
            width={width}
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
  selectedGeneSet: PropTypes.any,
  width: PropTypes.any.isRequired,
};
