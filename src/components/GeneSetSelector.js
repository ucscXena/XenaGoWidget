import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {
  getHighlightedColor,
} from '../functions/ColorFunctions';
import * as d3 from 'd3';

let interpolate ;

export class GeneSetSelector extends PureComponent {

  /**
     * Score is from 0 to 1
     * @param score
     * @param selected
     * @param hovered
     * @param width
     * @param labelHeight
     * @param highlighted
     * @returns {*}
     */
  static labelStyle(score, selected, hovered, width, labelHeight, highlighted) {

    if (selected) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        boxShadow: '0 0 4px 4px blue',
        borderRadius: '25px',

      };
    }

    else if (hovered) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px green',
        cursor: 'pointer'
      };
    }
    else if (highlighted)  {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px ' + getHighlightedColor(),
        cursor: 'pointer'
      };
    }
    else {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 2,
        cursor: 'pointer'
      };
    }
  }

  pillStyle(score) {
    let colorString = interpolate(score);

    return {
      top: 0,
      left: 0,
      height: this.props.labelHeight,
      strokeWidth: 1,
      stroke: colorString,
      fill: colorString,

      cursor: 'pointer'
    };
  }

    onClick = (geneSet) => {
      this.props.onClick(geneSet);
    };

    onMouseOut = () => {
      this.props.onHover(null);
    };

    onHover = (geneSet) => {
      this.props.onHover(geneSet ? geneSet : null);
    };


    render() {
      let {geneStateColors,pathways, selectedPathway, topOffset, hoveredPathway, width, labelHeight, highlightedGene} = this.props;
      if (selectedPathway===undefined) {
        return (
          <div/>
        );
      }
      interpolate = d3.scaleLinear().domain([geneStateColors.lowDomain,geneStateColors.midDomain,geneStateColors.highDomain]).range([geneStateColors.lowColor,geneStateColors.midColor,geneStateColors.highColor]).interpolate(d3.interpolateRgb.gamma(geneStateColors.gamma));

      return pathways.map((p) => {
        let labelString = '(' + p.gene.length + ') ' + p.golabel;
        let hovered = hoveredPathway ? p.golabel === hoveredPathway.golabel : false ;
        let selected = selectedPathway.pathway.golabel === p.golabel;
        let highlighted = p.gene.indexOf(highlightedGene) >= 0;

        return (
          <svg
            key={p.golabel}
            onMouseDown={this.onClick.bind(this, p)}
            onMouseOut={this.onMouseOut.bind(this, p)}
            onMouseOver={this.onHover.bind(this, p)}
            style={GeneSetSelector.labelStyle((p.firstObserved + p.secondObserved) / 2.0, selected, hovered,  width, labelHeight, highlighted)}
          >
            {p.firstGeneExpressionPathwayActivity &&
            <rect
              height={labelHeight} style={this.pillStyle(100*p.firstGeneExpressionPathwayActivity)} width={width / 2 - 1}
              x={0}
            />
            }
            {p.firstObserved &&
                    <rect
                      height={labelHeight} style={this.pillStyle(p.firstChiSquared)} width={width / 2 - 1}
                      x={0}
                    />
            }
            {p.secondGeneExpressionPathwayActivity &&
            <rect
              height={labelHeight} style={this.pillStyle(100*p.secondGeneExpressionPathwayActivity)} width={width / 2}
              x={width / 2 + 1}
            />
            }
            {p.secondObserved &&
                    <rect
                      height={labelHeight} style={this.pillStyle(p.secondChiSquared)} width={width / 2}
                      x={width / 2 + 1}
                    />
            }
            <text
              fill={'black'} fontFamily='Arial' fontSize={12} fontWeight={'bold'} x={10}
              y={topOffset}
            >
              {width < 10 ? '' : labelString}
            </text>
          </svg>
        );
      });
    }

}

GeneSetSelector.propTypes = {
  geneStateColors: PropTypes.any,
  highlightedGene: PropTypes.any,
  hoveredPathway: PropTypes.any,
  labelHeight: PropTypes.any.isRequired,
  onClick: PropTypes.any.isRequired,
  onHover: PropTypes.any.isRequired,
  onMouseOut: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
  selectedPathway: PropTypes.any,
  topOffset: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,
};
