import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {
  getHighlightedColor,
} from '../functions/ColorFunctions'
import * as d3 from 'd3'

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
        cursor: 'pointer'

      }
    }

    else if (hovered) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px green',
        cursor: 'pointer'
      }
    }
    else if (highlighted)  {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px ' + getHighlightedColor(),
        cursor: 'pointer'
      }
    }
    else {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 2,
        cursor: 'pointer'
      }
    }
  }

  static geneLabelStyle(score, selected, hovered, width, labelHeight, highlighted) {

    if (selected) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        boxShadow: '0 0 4px 4px purple',
        borderRadius: '25px',
        // cursor: 'pointer'
      }
    }

    else if (hovered) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px green',
        cursor: 'pointer'
      }
    }
    else if (highlighted)  {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px ' + getHighlightedColor(),
        cursor: 'pointer'
      }
    }
    else {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 2,
        cursor: 'pointer'
      }
    }
  }

  onClick = (geneSet) => {
    this.props.onClick({ pathway: geneSet, tissue: 'Header'})
  };

  onMouseOut = () => {
    this.props.onHover(null)
  };

  onHoverGene = (gene0,gene1) => {
    if(gene0 && gene1){
      gene0.firstGeneExpressionMean = gene0.geneExpressionMean
      gene0.secondGeneExpressionMean = gene1.geneExpressionMean
    }
    gene0.source = 'Gene'
    this.props.onHover(gene0 ? { pathway: gene0, tissue: 'Header'} : null)
  };

  onHover = (geneSet) => {
    this.props.onHover(geneSet ? { pathway: geneSet, tissue: 'Header'} : null)
  };

  render() {
    let {geneStateColors,geneData,pathways, selectedPathway, topOffset, hoveredPathway, width, labelHeight, highlightedGene, maxValue} = this.props
    console.log('props',this.props)

    let interpolateExp = d3.scaleLinear().domain([-maxValue*1.5, geneStateColors.midDomain, maxValue*1.5]).range([geneStateColors.lowColor,geneStateColors.midColor,geneStateColors.highColor]).interpolate(d3.interpolateRgb.gamma(geneStateColors.gamma))
    let interpolate = d3.scaleLinear().domain([geneStateColors.lowDomain, geneStateColors.midDomain, geneStateColors.highDomain]).range([geneStateColors.lowColor,geneStateColors.midColor,geneStateColors.highColor]).interpolate(d3.interpolateRgb.gamma(geneStateColors.gamma))

    let pillStyleExp = score => {
      let colorString = interpolateExp(score)
      return {
        top: 0,
        left: 0,
        height: this.props.labelHeight,
        strokeWidth: 1,
        stroke: colorString,
        fill: colorString,

        cursor: 'pointer'
      }
    }

    let pillStyle = score => {
      let colorString = interpolate(score)
      return {
        top: 0,
        left: 0,
        height: this.props.labelHeight,
        strokeWidth: 1,
        stroke: colorString,
        fill: colorString,

        cursor: 'pointer'
      }
    }


    return pathways.map((p) => {
      let labelString = '(' + p.gene.length + ') ' + p.golabel
      labelString = labelString.replace(/_/g,' ')
      let hovered = hoveredPathway ? p.golabel === hoveredPathway.golabel : false
      let selected = selectedPathway.pathway.golabel === p.golabel
      let highlighted = p.gene.indexOf(highlightedGene) >= 0

      let geneSetArray = [
        <svg
          key={p.golabel}
          onMouseDown={this.onClick.bind(this, p)}
          onMouseOut={this.onMouseOut.bind(this, p)}
          onMouseOver={this.onHover.bind(this, p)}
          style={GeneSetSelector.labelStyle((p.firstObserved + p.secondObserved) / 2.0, selected, hovered,  width, labelHeight, highlighted)}
        >
          {p.firstGeneExpressionPathwayActivity &&
          <rect
            height={labelHeight} style={pillStyleExp(p.firstGeneExpressionPathwayActivity)} width={width / 2 - 1}
            x={0}
          />
          }
          {p.firstObserved &&
                  <rect
                    height={labelHeight} style={pillStyle(p.firstChiSquared)} width={width / 2 - 1}
                    x={0}
                  />
          }
          {p.secondGeneExpressionPathwayActivity &&
          <rect
            height={labelHeight} style={pillStyleExp(p.secondGeneExpressionPathwayActivity)} width={width / 2}
            x={width / 2 + 1}
          />
          }
          {p.secondObserved &&
                  <rect
                    height={labelHeight} style={pillStyle(p.secondChiSquared)} width={width / 2}
                    x={width / 2 + 1}
                  />
          }
          <text
            fill={'black'} fontFamily='Arial' fontSize={12} fontWeight={'bold'} x={10}
            y={topOffset}
          >
            {width < 10 ? '' : labelString}
          </text>
          {/*<text*/}
          {/*  fill={'black'} fontFamily='Arial' fontSize={12} fontWeight={'bold'} x={120}*/}
          {/*  y={topOffset}*/}
          {/*>*/}
          {/*  {diffScore},  {diffX.toFixed(0)},  {width.toFixed(0)}*/}
          {/*</text>*/}
        </svg>
      ]


      // let diffXArray = [
      //   <svg
      //     key={p.golabel}
      //     style={{
      //       position: 'absolute',
      //       y: topOffset,
      //       x: -200,
      //       width: width,
      //       // backgroundColor: 'orange',
      //       // color: 'brown',
      //       // stroke: 'pink 2x solid',
      //       height: this.props.labelHeight,
      //       zIndex: 2000,
      //     }}
      //   >
      //     <rect
      //       fill='green'
      //       height={labelHeight}
      //       width={width/2}
      //       x={-50}
      //       y={3}
      //     />
      //   </svg>
      // ]
      // geneSetArray.push(diffXArray)

      if(selected && geneData[0].pathways){
        let genesToAdd = []
        for( let index = 0 ; index < geneData[0].pathways.length ; ++index){
          let gene0 = geneData[0].pathways[index]
          let gene1 = geneData[1].pathways[index]
          let geneEntry = (<svg
            key={gene0.gene[0]}
            onMouseDown={this.onClick.bind(this, gene0)}
            onMouseOut={this.onMouseOut.bind(this, gene0)}
            onMouseOver={this.onHoverGene.bind(this, gene0,gene1)}
            style={GeneSetSelector.geneLabelStyle((gene0.geneExpressionMean + gene1.geneExpressionMean) / 2.0, selected, hovered, width, labelHeight, highlighted)}
          >
            {gene0.geneExpressionMean &&
              <rect
                height={labelHeight} style={pillStyleExp(gene0.geneExpressionMean)} width={width / 2 - 1}
                x={0}
              />
            }
            {p.firstObserved &&
              <rect
                height={labelHeight} style={pillStyle(gene0.firstChiSquared)} width={width / 2 - 1}
                x={0}
              />
            }
            {gene1.geneExpressionMean &&
              <rect
                height={labelHeight} style={pillStyleExp(gene1.geneExpressionMean)} width={width / 2}
                x={width / 2 + 1}
              />
            }
            {p.secondObserved &&
              <rect
                height={labelHeight} style={pillStyle(gene1.secondChiSquared)} width={width / 2}
                x={width / 2 + 1}
              />
            }
            <text
              fill={'black'} fontFamily='Arial' fontSize={12} fontWeight={'bold'} x={10}
              y={topOffset}
            >
              {/*{width < 10 ? '' : labelString}*/}
              {gene0.gene[0]}
            </text>
          </svg>
          )
          genesToAdd.push(  geneEntry )
        }
        geneSetArray.push(genesToAdd)
      }

      return geneSetArray
    })
  }
}

GeneSetSelector.propTypes = {
  geneColors: PropTypes.any,
  geneData: PropTypes.any,
  geneStateColors: PropTypes.any,
  highlightedGene: PropTypes.any,
  hoveredPathway: PropTypes.any,
  labelHeight: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  onClick: PropTypes.any.isRequired,
  onHover: PropTypes.any.isRequired,
  onMouseOut: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
  selectedPathway: PropTypes.any,
  topOffset: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,
}
