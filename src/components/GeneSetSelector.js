import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {
  getHighlightedColor,
} from '../functions/ColorFunctions'
import {isViewGeneExpression} from '../functions/DataFunctions'
import {interpolateCnvMutationColor, interpolateGeneExpression} from '../functions/DrawFunctions'

export class GeneSetSelector extends PureComponent {

  static pillStyleExp (score,selected,labelHeight) {
    let colorString = interpolateGeneExpression(score)
    return {
      top: 0,
      left: 0,
      height: labelHeight,
      strokeWidth: 1,
      stroke: colorString,
      fill: colorString,
      opacity: selected ? 1 : 0.2,
      cursor: 'pointer'
    }
  }

  static pillStyle (score,selected,labelHeight) {
    let colorString = interpolateCnvMutationColor(score)
    return {
      top: 0,
      left: 0,
      height: labelHeight,
      strokeWidth: 1,
      stroke: colorString,
      fill: colorString,
      opacity: selected ? 1 : 0.2,
      cursor: 'pointer'
    }
  }

  generateGeneSetExpressionArray(p, selected, hovered, width, labelHeight, highlighted, open,labelString,topOffset) {
    return [
      <svg
        key={p.golabel}
        onMouseDown={this.onClick.bind(this, p)}
        onMouseOut={this.onMouseOut.bind(this, p)}
        onMouseOver={this.onHover.bind(this, p)}
        style={GeneSetSelector.labelStyle((p.firstObserved + p.secondObserved) / 2.0, selected, hovered,  width, labelHeight, highlighted)}
      >
        {p.firstGeneExpressionPathwayActivity &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyleExp(p.firstGeneExpressionPathwayActivity,selected || !open,labelHeight)} width={width / 2 - 1}
          x={0}
        />
        }
        {p.firstObserved &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyle(p.firstChiSquared,selected || !open,labelHeight)} width={width / 2 - 1}
          x={0}
        />
        }
        {p.secondGeneExpressionPathwayActivity &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyleExp(p.secondGeneExpressionPathwayActivity,selected || !open,labelHeight)} width={width / 2}
          x={width / 2 + 1}
        />
        }
        {p.secondObserved &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyle(p.secondChiSquared,selected || !open,labelHeight)} width={width / 2}
          x={width / 2 + 1}
        />
        }
        <text
          fill={selected || !open ? 'black' : 'gray'} fontFamily='Arial' fontSize={12} fontWeight={'bold'} x={10}
          y={topOffset}
        >
          {width < 10 ? '' : labelString}
        </text>
      </svg>
    ]
  }

  generateGeneSetCnvMutationArray(p, selected, hovered, width, labelHeight, highlighted, open,labelString,topOffset) {
    return  [
      <svg
        key={p.golabel}
        onMouseDown={this.onClick.bind(this, p)}
        onMouseOut={this.onMouseOut.bind(this, p)}
        onMouseOver={this.onHover.bind(this, p)}
        style={GeneSetSelector.labelStyle((p.firstObserved + p.secondObserved) / 2.0, selected, hovered,  width, labelHeight, highlighted)}
      >
        {p.firstGeneExpressionPathwayActivity &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyleExp(p.firstGeneExpressionPathwayActivity,selected || !open,labelHeight)} width={width / 2 - 1}
          x={0}
        />
        }
        {p.firstObserved &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyle(p.firstChiSquared,selected || !open,labelHeight)} width={width / 2 - 1}
          x={0}
        />
        }
        {p.secondGeneExpressionPathwayActivity &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyleExp(p.secondGeneExpressionPathwayActivity,selected || !open,labelHeight)} width={width / 2}
          x={width / 2 + 1}
        />
        }
        {p.secondObserved &&
        <rect
          height={labelHeight} style={GeneSetSelector.pillStyle(p.secondChiSquared,selected || !open,labelHeight)} width={width / 2}
          x={width / 2 + 1}
        />
        }
        <text
          fill={selected || !open ? 'black' : 'gray'} fontFamily='Arial' fontSize={12} fontWeight={'bold'} x={10}
          y={topOffset}
        >
          {width < 10 ? '' : labelString}
        </text>
      </svg>
    ]

  }

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

    if (hovered) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px green',
        cursor: 'pointer'
      }
    }
    else
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


    if (hovered) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px green',
        cursor: 'pointer'
      }
    }

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
    if (highlighted)  {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px ' + getHighlightedColor(),
        cursor: 'pointer'
      }
    }
    return {
      height: labelHeight,
      width: width,
      strokeWidth: 2,
      cursor: 'pointer'
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
    let {geneData,pathways, selectedPathway, topOffset, hoveredPathway, width, labelHeight, highlightedGene,  view} = this.props
    // let interpolateGeneExpression = d3.scaleLinear().domain([-maxValue*1.5, MID_GENE_STATE_COLOR, maxValue*1.5]).range([LOW_GENE_STATE_COLOR,MID_GENE_STATE_COLOR,HIGH_GENE_STATE_COLOR]).interpolate(d3.interpolateRgb.gamma(GAMMA_GENE_STATE_COLOR))
    // let interpolateCnvMutation = d3.scaleLinear().domain([LOW_DOMAIN, MID_DOMAIN, HIGH_DOMAIN]).range([LOW_GENE_STATE_COLOR,MID_GENE_STATE_COLOR,HIGH_GENE_STATE_COLOR]).interpolate(d3.interpolateRgb)

    return pathways.map((p) => {
      let labelString = '(' + p.gene.length + ') ' + p.golabel
      labelString = labelString.replace(/_/g,' ')
      let hovered = hoveredPathway ? p.golabel === hoveredPathway.golabel : false
      let selected = selectedPathway.pathway.golabel === p.golabel
      const open = selectedPathway.open
      let highlighted = p.gene.indexOf(highlightedGene) >= 0

      let geneSetArray = isViewGeneExpression(view) ? this.generateGeneSetExpressionArray(p,selected,hovered,width,labelHeight, highlighted,open,labelString,topOffset)
        : this.generateGeneSetCnvMutationArray(p,selected,hovered,width,labelHeight, highlighted,open,labelString,topOffset)

      if(selected && geneData[0].pathways){
        let genesToAdd = []
        for( let index = 0 ; index < geneData[0].pathways.length ; ++index){
          let gene0 = geneData[0].pathways[index]
          let gene1 = geneData[1].pathways[index]
          let hovered = hoveredPathway ? hoveredPathway.gene === gene0.gene : false
          let geneEntry = (<svg
            key={gene0.gene[0]}
            onMouseDown={this.onClick.bind(this, gene0)}
            onMouseOut={this.onMouseOut.bind(this, gene0)}
            onMouseOver={this.onHoverGene.bind(this, gene0,gene1)}
            style={GeneSetSelector.geneLabelStyle((gene0.geneExpressionMean + gene1.geneExpressionMean) / 2.0, selected, hovered, width, labelHeight, highlighted)}
          >
            {gene0.geneExpressionMean &&
              <rect
                height={labelHeight} style={GeneSetSelector.pillStyleExp(gene0.geneExpressionMean,selected,labelHeight)} width={width / 2 - 1}
                x={0}
              />
            }
            {p.firstObserved &&
              <rect
                height={labelHeight} style={GeneSetSelector.pillStyle(gene0.firstChiSquared,selected,labelHeight)} width={width / 2 - 1}
                x={0}
              />
            }
            {gene1.geneExpressionMean &&
              <rect
                height={labelHeight} style={GeneSetSelector.pillStyleExp(gene1.geneExpressionMean,selected,labelHeight)} width={width / 2}
                x={width / 2 + 1}
              />
            }
            {p.secondObserved &&
              <rect
                height={labelHeight} style={GeneSetSelector.pillStyle(gene1.secondChiSquared,selected,labelHeight)} width={width / 2}
                x={width / 2 + 1}
              />
            }
            <text
              fill={'black'} fontFamily='Arial' fontSize={12} fontWeight={'bold'} x={10}
              y={topOffset}
            >
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
  geneData: PropTypes.any,
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
  view: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,
}
