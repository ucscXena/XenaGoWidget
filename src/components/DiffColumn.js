import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {isViewGeneExpression} from '../functions/DataFunctions'


export class DiffColumn extends PureComponent {

  constructor(props) {
    super(props)
  }

  calculateDiamond(finalScore,maxValue,width,height,cohortIndex,geneIndex) {
    const diamondWidth = 20
    const diamondHeight = height
    const heightOffset = (geneIndex+1) * height
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
    let { cohortIndex,geneData,maxValue, filter, labelHeight,selectedPathway, pathways,width } = this.props
    if(geneData && geneData.length === 2 && geneData[cohortIndex].pathways){
      const selectedPathwayIndex = pathways.findIndex( p => {
        return p.golabel  === selectedPathway.pathway.golabel
      })
      // const topOffset = isViewGeneExpression(filter) ? 202 + ((labelHeight +1)*selectedPathwayIndex) : 212 + (labelHeight*selectedPathwayIndex)
      console.log('selected pathway index',selectedPathwayIndex)
      const topOffset = isViewGeneExpression(filter) ? (labelHeight * selectedPathwayIndex) + 210 : (labelHeight * selectedPathwayIndex) + 215
      console.log('the top offset is',topOffset)
      return (
        <svg
          key={selectedPathway.pathway.golabel + '-'+cohortIndex}
          style={{
            zIndex: 100,
            x: 0,
            top: topOffset,
            height: labelHeight * (geneData[cohortIndex].pathways.length+1)-2,
            width: width-2,
            position: 'absolute',
            color: 'black',
            pointerEvents: 'none',
            boxShadow: '1px 1px 1px 1px gray',
            border: '2px solid black',
            borderRadius: '5px',
          }}
        >
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
                  // <text fontSize={22} key={g.gene[0]} x={50} y={labelHeight*(index+2)}>
                  //   {finalScore.toFixed(0)}
                  //   {/*, {index}*/}
                  // </text>
                  // ,
                  <polygon
                    fill='black'
                    key={g.gene[0]}
                    points={this.calculateDiamond(finalScore,maxValue,width,labelHeight,cohortIndex,index)}
                    stroke='black'/>
                ]
              }
            })
          }
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
  filter: PropTypes.any.isRequired,
  geneData: PropTypes.any,
  labelHeight: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
  selectedPathway: PropTypes.any,
  width: PropTypes.any.isRequired,
}
