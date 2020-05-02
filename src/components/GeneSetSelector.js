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
      height: labelHeight-1,
      strokeWidth: 1,
      stroke: colorString,
      fill: colorString,
      opacity: selected ? 1 : 0.2,
      cursor: 'pointer',
      padding: 0,
      margin: 0,
      borderSpacing: 0,
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
      cursor: 'pointer',
      padding: 0,
      margin: 0,
      borderSpacing: 0,
    }
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
        cursor: 'pointer',
        margin: 0,
        padding: 0,
      }
    }
    else
    if (selected) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        // boxShadow: '0 0 4px 4px blue',
        borderRadius: '25px',
        cursor: 'pointer',
        margin: 0,
        padding: 0,

      }
    }
    else if (highlighted)  {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        borderRadius: '15px',
        boxShadow: '0 0 2px 2px ' + getHighlightedColor(),
        cursor: 'pointer',
        margin: 0,
        padding: 0,
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
        // borderRadius: '15px',
        // boxShadow: '0 0 2px 2px green',
        cursor: 'pointer'
      }
    }

    if (selected) {
      return {
        height: labelHeight,
        width: width,
        strokeWidth: 1,
        // boxShadow: '0 0 4px 4px purple',
        // borderRadius: '25px',
        cursor: 'pointer'
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

  onMouseOut = (nullgene,event) => {
    event.target.setAttribute('stroke','none')
    this.props.onHover(null)
  };

  onHoverGene = (gene0,gene1,event) => {
    if(gene0 && gene1){
      gene0.firstGeneExpressionMean = gene0.geneExpressionMean
      gene0.secondGeneExpressionMean = gene1.geneExpressionMean
    }
    gene0.source = 'Gene'
    event.target.setAttribute('stroke','orange')
    this.props.onHover(gene0 ? { pathway: gene0, tissue: 'Header'} : null)
  };

  onHover = (geneSet,event) => {
    event.target.setAttribute('stroke','green')
    this.props.onHover(geneSet ? { pathway: geneSet, tissue: 'Header'} : null)
  };

  generateGeneSetLabel(p, selected, hovered, width, labelHeight, highlighted, open, labelString, topOffset) {
    return [
      <rect
        height={labelHeight}
        key={p.golabel+'0'}
        onMouseDown={this.onClick.bind(this, p)}
        onMouseOut={this.onMouseOut.bind(this, p)}
        onMouseOver={this.onHover.bind(this, p)}
        style={isViewGeneExpression(this.props.view) ?
          GeneSetSelector.pillStyleExp(p.firstGeneExpressionPathwayActivity,selected || !open,labelHeight) :
          GeneSetSelector.pillStyle(p.firstChiSquared,selected || !open,labelHeight)
        }
        width={width / 2 - 1} x={0}
        y={topOffset-labelHeight-1}
      />
      ,
      <rect
        height={labelHeight}
        key={p.golabel+'1'}
        onMouseDown={this.onClick.bind(this, p)}
        onMouseOut={this.onMouseOut.bind(this, p)}
        onMouseOver={this.onHover.bind(this, p)}
        // style={GeneSetSelector.pillStyleExp(p.secondGeneExpressionPathwayActivity,selected || !open,labelHeight)}
        style={isViewGeneExpression(this.props.view) ?
          GeneSetSelector.pillStyleExp(p.secondGeneExpressionPathwayActivity,selected || !open,labelHeight) :
          GeneSetSelector.pillStyle(p.secondChiSquared,selected || !open,labelHeight)
        }
        width={width / 2} x={width / 2 + 1}
        y={topOffset-labelHeight-1}
      />
      ,
      <text
        fill={selected || !open ? 'black' : 'gray'}
        fontFamily='Arial'
        fontSize={12}
        fontWeight={'bold'}
        key={p.golabel+'text'}
        onMouseDown={this.onClick.bind(this, p)} onMouseOut={this.onMouseOut.bind(this, p)} onMouseOver={this.onHover.bind(this, p)}
        style={{pointer:'cursor'}}
        x={10}
        y={topOffset-5}
      >
        {width < 10 ? '' : labelString}
      </text>
    ]
  }

  generateGeneEntryLabel(gene0, gene1, selected, hovered, width, labelHeight, highlighted, open, labelString, topOffset) {
    return [
      <rect
        height={labelHeight}
        key={gene0.gene[0]+'0'}
        onMouseDown={this.onClick.bind(this, gene0)}
        onMouseOut={this.onMouseOut.bind(this, gene0)}
        onMouseOver={this.onHoverGene.bind(this, gene0,gene1)}
        style={isViewGeneExpression(this.props.view) ?
          GeneSetSelector.pillStyleExp(gene0.geneExpressionMean,selected,labelHeight)  :
          GeneSetSelector.pillStyle(gene0.affected,selected,labelHeight)
        }
        width={width / 2 - 1}
        x={0}
        y={topOffset-labelHeight}
      />
      ,
      <rect
        height={labelHeight}
        key={gene0.gene[0]+'1'}
        onMouseDown={this.onClick.bind(this, gene0)}
        onMouseOut={this.onMouseOut.bind(this, gene0)}
        onMouseOver={this.onHoverGene.bind(this, gene0,gene1)}
        style={isViewGeneExpression(this.props.view) ?
          GeneSetSelector.pillStyleExp(gene1.geneExpressionMean,selected,labelHeight)  :
          GeneSetSelector.pillStyle(gene1.affected,selected,labelHeight)
        }
        width={width / 2}
        x={width / 2 + 1}
        y={topOffset-labelHeight}
      />
      ,
      <text
        fill={'black'}
        fontFamily='Arial'
        fontSize={12}
        fontWeight={'bold'}
        key={gene0.gene[0]+'text'}
        onMouseDown={this.onClick.bind(this, gene0)} onMouseOut={this.onMouseOut.bind(this, gene0)} onMouseOver={this.onHoverGene.bind(this, gene0,gene1)}
        x={10}
        y={topOffset-5}
      >
        {gene0.gene[0]}
      </text>
    ]
  }

  render() {
    let {geneData,pathways, selectedPathway, topOffset, hoveredPathway, width, labelHeight, highlightedGene} = this.props

    let yOffset = topOffset+4

    const layoutLength = pathways.length + (geneData && geneData[0].pathways ? geneData[0].pathways.length : 0)

    return (
      <svg style={{
        height: labelHeight * layoutLength,
        width:width,
        cursor: 'pointer',
      }}>
        {pathways.map((p) => {
          let labelString = '(' + p.gene.length + ') ' + p.golabel
          labelString = labelString.replace(/_/g,' ')
          let hovered = hoveredPathway ? p.golabel === hoveredPathway.golabel : false
          let selected = selectedPathway.pathway.golabel === p.golabel
          const open = selectedPathway.open
          let highlighted = p.gene.indexOf(highlightedGene) >= 0

          let geneSetArray = this.generateGeneSetLabel(p,selected,hovered,width,labelHeight, highlighted,open,labelString,yOffset)

          if(selected && geneData[0].pathways){
            let genesToAdd = []
            for( let index = 0 ; index < geneData[0].pathways.length ; ++index){
              let gene0 = geneData[0].pathways[index]
              let gene1 = geneData[1].pathways[index]
              let hovered = hoveredPathway ? hoveredPathway.gene === gene0.gene : false
              yOffset += labelHeight
              let geneEntry =  this.generateGeneEntryLabel(gene0,gene1,selected,hovered,width,labelHeight, highlighted,open,labelString,yOffset)
              genesToAdd.push(  geneEntry )
            }
            geneSetArray.push(genesToAdd)
          }

          yOffset += labelHeight
          return geneSetArray
        }
        )}
      </svg>)
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
