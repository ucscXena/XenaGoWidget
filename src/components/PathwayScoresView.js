import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import CanvasDrawing from './CanvasDrawing';
import DrawFunctions from '../functions/DrawFunctions';
import {sumInstances} from '../functions/MathFunctions';
import LabelWrapper from './LabelWrapper';


export const GENE_LABEL_HEIGHT = 50;
const UP_BUFFER = -3;
const DOWN_BUFFER = 1;

const style = {
  xenaGoView: {
    opacity: 1,
    // border: 'solid black 0.5px',
    boxShadow: '0 0 2px 2px #ccc '
  },
  fadeIn: {
    opacity: 1,
    transition: 'opacity 0.5s ease-out'
  }
  , fadeOut: {
    opacity: 0.6,
    transition: 'opacity 1s ease'
  }
  , wrapper: {
    position: 'relative',
    zIndex: 1,
    overflow: 'hidden',
    backgroundColor: '#F7FFF7'
  }
};

function getMousePos(evt) {
  let rect = evt.currentTarget.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getExpressionForDataPoint(pathwayIndex, tissueIndex, cohortIndex, associatedData) {
  let pathwayArray = associatedData[pathwayIndex];
  if (!pathwayArray) {
    return 0;
  }
  const numSamples = associatedData[0].length;
  if(tissueIndex < 0 ){
    return {affected: sumInstances(pathwayArray), total: numSamples };
  }
  else{
    return cohortIndex === 0 ? pathwayArray[numSamples - tissueIndex -1] : pathwayArray[tissueIndex]; // sample
  }
}

let tissueIndexFromY = (y, height, labelHeight, count, cohortIndex) => {
  let index = 0;
  switch (cohortIndex) {
  case 0:
    index = y <= (height - (labelHeight + UP_BUFFER)) ? Math.trunc((height - labelHeight - y) * count / (height - (labelHeight + UP_BUFFER))) : -1;
    break;
  case 1:
    index = y < (labelHeight + DOWN_BUFFER) ? -1 : Math.trunc((y - (labelHeight + DOWN_BUFFER)) * count / (height - (labelHeight + DOWN_BUFFER)));
    break;
  default:
    // eslint-disable-next-line no-console
    console.error('error', y, height, labelHeight, count, cohortIndex, UP_BUFFER);

  }
  return index;
};

let pathwayIndexFromX = (x, layout) => {
  let pathwayIndex = layout.findIndex(({start, size}) => start <= x && x < start + size);
  let layoutInstance = layout[pathwayIndex];
  if (layoutInstance) {
    let layoutMiddle = Math.round(layoutInstance.start + (layoutInstance.size / 2.0));
    return {pathwayIndex: pathwayIndex, selectCnv: x < layoutMiddle};
  } else {
    return {pathwayIndex: pathwayIndex, selectCnv: false};
  }
};

function getPointData(event, layout, associatedData, sortedSamples, pathways, height, cohortIndex) {
  let {x, y} = getMousePos(event);
  let {pathwayIndex, selectCnv} = pathwayIndexFromX(x, layout);
  let tissueIndex = tissueIndexFromY(y, height, GENE_LABEL_HEIGHT, sortedSamples.length, cohortIndex);
  let expression = getExpressionForDataPoint(pathwayIndex, tissueIndex, cohortIndex, associatedData);
  return {
    pathway: pathways[pathwayIndex],
    tissue: tissueIndex < 0 ? 'Header' : sortedSamples[tissueIndex],
    expression: expression,
    selectCnv: selectCnv
  };
}


export default class PathwayScoresView extends PureComponent {

  constructor(props) {
    super(props);
  }


    handleLabelHoverOut = () => {
      let {onHover} = this.props;
      onHover(null);
    };

    handleLabelHover = (event) => {
      let {onHover,height,cohortIndex,layoutData,dataStats: { data,pathways , sortedSamples }} = this.props;
      let pointData = getPointData(event, layoutData, data, sortedSamples, pathways, height, cohortIndex);
      if (pointData) {
        onHover(pointData);
      } else {
        onHover(null);
      }
    };

    render() {
      const {
        height, offset, cohortIndex,
        colorSettings, highlightedGene,
        showDetailLayer, calculatedWidth,
        showDiffLayer, layoutData,
      } = this.props;

      let {data,sortedSamples, pathways} = this.props.dataStats;

      return (
        <div style={style.xenaGoView}>
          {showDetailLayer &&
                <CanvasDrawing
                  associatedData={data}
                  cohortIndex={cohortIndex}
                  draw={DrawFunctions.drawGeneView}
                  height={height}
                  layout={layoutData}
                  width={calculatedWidth}
                />
          }
          <LabelWrapper
            cohortIndex={cohortIndex}
            colorSettings={colorSettings}
            geneLabelHeight={GENE_LABEL_HEIGHT}
            height={height}
            highlightedGene={highlightedGene}
            layout={layoutData}
            numSamples={sortedSamples.length}
            offset={offset}
            onMouseMove={this.handleLabelHover}
            onMouseOut={this.handleLabelHoverOut}
            pathways={pathways}
            showDiffLayer={showDiffLayer}
            width={calculatedWidth}
          />
        </div>
      );
    }
}

PathwayScoresView.propTypes = {
  calculatedWidth: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  colorSettings: PropTypes.any,
  dataStats: PropTypes.object.isRequired,
  filter: PropTypes.any.isRequired,
  height: PropTypes.number.isRequired,
  highlightedGene: PropTypes.any,
  layoutData: PropTypes.any.isRequired,
  offset: PropTypes.number.isRequired,
  onHover: PropTypes.any.isRequired,
  showDetailLayer: PropTypes.any,
  showDiffLayer: PropTypes.any,
};


