import PureComponent from './PureComponent'
import React from 'react'
import PropTypes from 'prop-types'

import DrawFunctions from '../functions/DrawFunctions'
import CanvasDrawing from './CanvasDrawing'
import {getLabelForIndex} from '../functions/CohortFunctions'
import {getSelectedGeneSetIndex, isViewGeneExpression} from '../functions/DataFunctions'


function findGeneSetIndexFromY(y, labelHeight) {
  return Math.round((y - 15) / labelHeight)
}

function getMousePos(evt) {
  let rect = evt.currentTarget.getBoundingClientRect()
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

function sampleIndexFromX(x, width, cohortIndex, sampleLength) {
  if(cohortIndex===0){
    return Math.trunc( x / (width / sampleLength) )
  }
  else
  if(cohortIndex===1){
    return Math.trunc( x / (width / sampleLength) )
  }
  else{
    // eslint-disable-next-line no-console
    console.error('how we get here?')
  }

  return undefined
}

function getPointData(event, props) {
  let {filter,labelHeight, geneData, pathways,cohortIndex, width,associatedData,selectedPathway} = props
  let {x, y} = getMousePos(event)
  const selectedGeneSetIndex = getSelectedGeneSetIndex(selectedPathway,pathways)
  const pathwayIndexFromY = findGeneSetIndexFromY(y, labelHeight)

  let sampleIndex = sampleIndexFromX(x,width, cohortIndex, associatedData[0].length)
  const isGeneSelected = selectedGeneSetIndex >= pathwayIndexFromY ? false : pathwayIndexFromY <= selectedGeneSetIndex + geneData.pathways.length

  let pathway
  if(isGeneSelected){
    pathway = geneData.pathways[pathwayIndexFromY - selectedGeneSetIndex-1]
    pathway.source = 'Gene'
  }
  else{
    pathway = pathways[selectedGeneSetIndex >= pathwayIndexFromY ? pathwayIndexFromY : pathwayIndexFromY - geneData.pathways.length]
    pathway.source = 'GeneSet'
  }

  if(isViewGeneExpression(filter)){
    if(associatedData===undefined || pathwayIndexFromY<0 || cohortIndex < 0 || associatedData[pathwayIndexFromY][sampleIndex]===undefined) return null
    let activity = associatedData[pathwayIndexFromY][sampleIndex].geneExpressionPathwayActivity
    if(cohortIndex===0){
      pathway.firstSampleGeneExpressionPathwayActivity = activity
    }
    else{
      pathway.secondSampleGeneExpressionPathwayActivity = activity
    }
  }
  else {
    if(associatedData===undefined || pathwayIndexFromY<0 || cohortIndex < 0 || associatedData[pathwayIndexFromY][sampleIndex]===undefined) return null
    let activity = associatedData[pathwayIndexFromY][sampleIndex]
    // TODO: map activity to sample-based activity
    if(cohortIndex===0){
      pathway.firstSampleCnvHigh = activity.cnvHigh
      pathway.firstSampleCnvLow = activity.cnvLow
      pathway.firstSampleMutation2 = activity.mutation2
      pathway.firstSampleMutation3 = activity.mutation3
      pathway.firstSampleMutation4 = activity.mutation4
      pathway.firstSampleTotal = activity.total
    }
    else{
      pathway.secondSampleCnvHigh = activity.cnvHigh
      pathway.secondSampleCnvLow = activity.cnvLow
      pathway.secondSampleMutation2 = activity.mutation2
      pathway.secondSampleMutation3 = activity.mutation3
      pathway.secondSampleMutation4 = activity.mutation4
      pathway.secondSampleTotal = activity.total
    }

  }

  // TODO: handle other types here?
  return {
    pathway: pathway,
    tissue: sampleIndex < 0 ? 'Header' : associatedData[pathwayIndexFromY][sampleIndex].sample,
    cohortIndex,
  }
}


/**
 * Extends PathwaysScoreView (but the old one)
 */
export default class VerticalGeneSetScoresView extends PureComponent {

    handleHoverOut = () => {
      this.props.onHover(null)
    };

    handleHover = (event) => {
      this.props.onHover(getPointData(event, this.props))
    };

    handleClick = (event) => {
      this.props.onClick(getPointData(event, this.props))
    };


    render() {
      let {cohortIndex, geneData, labelHeight, width, associatedData, maxValue, pathways, selectedPathway} = this.props
      if (!associatedData) {
        return <div>Loading Cohort {getLabelForIndex(cohortIndex)}</div>
      }
      let pathwayIndex = getSelectedGeneSetIndex(selectedPathway,pathways)

      // need a size and vertical start for each
      let inputPathways = [...pathways.slice(0,pathwayIndex+1),...geneData.pathways,...pathways.slice(pathwayIndex+1)]
      let layout = inputPathways.map((p, index) => {
        return {start: index * labelHeight, size: labelHeight}
      })

      const totalHeight = layout.length * labelHeight
      if (associatedData.length === 0) {
        return <div>Loading...</div>
      }

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
            maxValue={maxValue}
            onClick={this.handleClick}
            onHover={this.handleHover}
            onMouseOut={this.handleHoverOut}
            width={width}
          />
        </div>
      )
    }

}

VerticalGeneSetScoresView.propTypes = {
  associatedData: PropTypes.any,
  cohortIndex: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
  geneData: PropTypes.any,
  labelHeight: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  onClick: PropTypes.any.isRequired,
  onHover: PropTypes.any.isRequired,
  onMouseOut: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,
  selectedPathway: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,
}
