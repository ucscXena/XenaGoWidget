import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import React from 'react';
import {getGeneColorMask} from '../functions/ColorFunctions';
import LabelSet from './LabelSet';

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


  render() {
    let {
      colorSettings
      , geneLabelHeight
      , width
      , view
      , height
      , layout
      , onMouseMove
      , onMouseOut
      , cohortIndex
      , highlightedGene
      , offset
      , pathways
      , numSamples
    } = this.props;

    return (
      <div
        onMouseMove={onMouseMove}
        onMouseOut={onMouseOut}
        style={{...styles.overlay, width, height, top: 77 + offset}}
      >
        <LabelSet
          cohortIndex={cohortIndex}
          colorMask={getGeneColorMask()}
          colorSettings={colorSettings}
          height={height}
          highlightedGene={highlightedGene}
          labelHeight={geneLabelHeight}
          layout={layout}
          numSamples={numSamples}
          pathways={pathways}
          showDiffLayer={this.props.showDiffLayer}
          view={view}
        />
      </div>
    );
  }
}
LabelWrapper.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  colorSettings: PropTypes.any.isRequired,
  geneLabelHeight: PropTypes.any.isRequired,
  height: PropTypes.any.isRequired,
  highlightedGene: PropTypes.any,
  layout: PropTypes.any.isRequired,
  numSamples: PropTypes.any.isRequired,
  offset: PropTypes.any.isRequired,
  onMouseMove: PropTypes.any.isRequired,
  onMouseOut: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
  showDiffLayer: PropTypes.any,
  view: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,
};
