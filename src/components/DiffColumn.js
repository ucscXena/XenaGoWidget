import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'


export class DiffColumn extends PureComponent {

  constructor(props) {
    super(props)
  }


  render(){
    let { cohortIndex,geneData,labelHeight,selectedPathway, pathways,width } = this.props
    console.log('1 ass data',geneData,selectedPathway,pathways)
    const TOP_OFFSET = 298
    if(geneData && geneData.length === 2 && geneData[cohortIndex].pathways){
      const selectedPathwayIndex =pathways.findIndex( p => {
        return p.golabel  === selectedPathway.pathway.golabel
      })
      console.log('selected pathway index: ',selectedPathwayIndex)
      return (
        <svg
          style={{
            zIndex: 100,
            x: 0,
            top: (labelHeight * selectedPathwayIndex)  + TOP_OFFSET,
            height: labelHeight * (geneData[cohortIndex].pathways.length+1),
            position: 'absolute',
            color: 'black',
            pointerEvents: 'none',
            stroke: 'black',
            strokeWidth: '2px',
            width: width,
            border: '1px solid black'
          }}
        >
          return {
            geneData[cohortIndex].pathways.map( (g,index) => {
              return (
                <text fontSize={22} key={g.gene[0]} x={5} y={labelHeight*(index+2)}>
                  {g.diffScore}, {index}
                </text>
              )
            })
          }
        </svg>

      )
    }
    else{
      return <div/>
    }
    // return (<div
    //   style={{
    //     backgroundColor: 'brown',
    //     color: 'green',
    //     position: 'absolute',
    //     zIndex: 2000,
    //     x: 50,
    //     y: 50,
    //     width: width,
    //     height: labelHeight ,
    //   }}>
    // </div>)
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
  // selectedCohort: PropTypes.any.isRequired,
  selectedPathway: PropTypes.any,
  width: PropTypes.any.isRequired,
}
