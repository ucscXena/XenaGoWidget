import PureComponent from './PureComponent';
import React from 'react';
import PropTypes from 'prop-types';

import DrawFunctions from '../functions/DrawFunctions';
import {VIEW_ENUM} from '../data/ViewEnum';
import CanvasDrawing from './CanvasDrawing';
import {getLabelForIndex} from '../functions/CohortFunctions';
import {pruneColumns} from '../functions/DataFunctions';

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
  let {labelHeight, pathways,cohortIndex, width,associatedData} = props;
  // eslint-disable-next-line no-unused-vars
  let {x, y} = getMousePos(event);
  let pathwayIndex = pathwayIndexFromY(y, labelHeight);
  let sampleIndex = sampleIndexFromX(x,width, cohortIndex, associatedData[0].length);

  let pathway = pathways[pathwayIndex];
  if(VIEW_ENUM.PARADIGM){
    // let activity = data.paradigmPathwayActivity[pathwayIndex][sampleIndex];
    console.log('look up ',cohortIndex,pathwayIndex,sampleIndex);
    let activity = associatedData[pathwayIndex][sampleIndex].paradigmPathwayActivity;
    // console.log('activity',activity,activity)
    if(cohortIndex===0){
      pathway.firstParadigmPathwayActivity = activity ;
    }
    else{
      pathway.secondParadigmPathwayActivity = activity ;
    }
  }
  // return update( pathways[pathwayIndex],{
  //   tissue: { $set: sampleIndex < 0 ? 'Header' : data.samples[sampleIndex]},
  //   cohortIndex: { $set: cohortIndex},
  // });
  return {
    pathway: pathway,
    tissue: sampleIndex < 0 ? 'Header' : associatedData[pathwayIndex][sampleIndex].sample,
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


    render() {

      let {cohortIndex, labelHeight, pathways, width, selectedGeneSet,associatedData} = this.props;
      console.log('VSGS selected',selectedGeneSet);
      // const {expression } = data;
      if (!associatedData) {
        return <div>Loading Cohort {getLabelForIndex(cohortIndex)}</div>;
      }
      // need a size and vertical start for each
      let layout = pathways.map((p, index) => {
        return {start: index * labelHeight, size: labelHeight};
      });

      const totalHeight = layout.length * labelHeight;
      if (associatedData.length === 0) {
        return <div>Loading...</div>;
      }
      // let associatedDataKey = createAssociatedDataKey(hashAssociation);
      // let associatedData = findAssociatedData(hashAssociation,associatedDataKey);
      //
      // let prunedColumns = findPruneData(associatedData,associatedDataKey);
      // console.log('Gene Set pruned columns',prunedColumns);
      let prunedColumns = pruneColumns(associatedData,pathways);
      console.log('pruned columns',prunedColumns,associatedData);
      // prunedColumns.samples = samples;
      // console.log('B input pruned columns',prunedColumns.samples,'vs',samples);
      // let returnedValue = sortSampleActivity(filter,prunedColumns,selectedGeneSet) ;
      // console.log('output returned value',returnedValue);
      // sharedAssociatedData[cohortIndex] = prunedColumns.data;


      return (
        <div>
          <CanvasDrawing
            {...this.props}
            associatedData={associatedData}
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
  associatedData: PropTypes.any,
  cohortIndex: PropTypes.any.isRequired,
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
