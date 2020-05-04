import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../css/base.css'


export class DiffColumn extends PureComponent {

  constructor(props) {
    super(props)
  }

  calculateDiamond(finalScore,maxValue,width,height,cohortIndex,geneIndex,topOffset) {
    const diamondWidth = 20
    const diamondHeight = height
    const heightOffset = ((geneIndex+1) * height) + topOffset
    const scoreOffset = Math.abs(finalScore / maxValue * width)
    if(cohortIndex === 0){
      return `${width - scoreOffset} ${heightOffset + height /2},
                     ${width - scoreOffset + (diamondWidth / 2)} ${heightOffset},
                      ${width - scoreOffset + (diamondWidth / 2)} ${heightOffset + diamondHeight}`
    }
    else{
      return `${scoreOffset} ${heightOffset + height /2},
                     ${scoreOffset - (diamondWidth / 2)} ${heightOffset},
                      ${scoreOffset - (diamondWidth / 2)} ${heightOffset + diamondHeight}`
    }
  }

  render(){
    let { cohortIndex,geneData,maxValue,  labelHeight,selectedPathway, pathways,width } = this.props
    if(geneData && geneData.length === 2 && geneData[cohortIndex].pathways){
      const selectedPathwayIndex = pathways.findIndex( p => {
        return p.golabel  === selectedPathway.pathway.golabel
      })
      const topOffset = labelHeight * selectedPathwayIndex
      const geneLength = + (geneData && geneData[0].pathways ? geneData[0].pathways.length : 0)
      const layoutLength = pathways.length + geneLength
      return (
        <svg style={{
          height: labelHeight * layoutLength,
          width:width,
          cursor: 'pointer',
          position: 'absolute',
          zIndex: 5,
          pointerEvents: 'none',
        }}>
          return {
            geneData[cohortIndex].pathways.map( (g,index) => {
              if( (g.diffScore > 0 && cohortIndex===0) || (g.diffScore < 0 && cohortIndex ===1)){
                let finalScore = g.diffScore
                if(cohortIndex===0 && g.diffScore > maxValue){
                  finalScore = maxValue
                }
                if(cohortIndex===1 && g.diffScore < -maxValue){
                  finalScore = -maxValue
                }
                return [
                  <polygon
                    fill='black'
                    key={g.gene[0]+cohortIndex}
                    points={this.calculateDiamond(finalScore,maxValue,width,labelHeight,cohortIndex,index,topOffset)}
                    stroke='black'
                  />
                ]
              }
            })
          }
          <rect
            className={BaseStyle.selectedGeneset} height={labelHeight} width={width} x={0}
            y={topOffset}
          />
          <rect
            className={BaseStyle.selectedGenes}
            height={labelHeight*geneLength}
            width={width} x={0}
            y={topOffset+labelHeight}
          />
        </svg>
      )
    }
    else{
      return <div/>
    }
  }

}

DiffColumn.propTypes = {
  associatedData: PropTypes.any,
  cohortIndex: PropTypes.any.isRequired,
  geneData: PropTypes.any,
  labelHeight: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
  selectedPathway: PropTypes.any,
  width: PropTypes.any.isRequired,
}
