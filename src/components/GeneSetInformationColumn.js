import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {GeneSetSubCohortBox} from './GeneSetSubCohortBox'
import BaseStyle from '../css/base.css'
import HoverGeneView from './hover/HoverGeneView'
import SelectGeneView from './hover/SelectGeneView'

export class GeneSetInformationColumn extends PureComponent {

  constructor(props) {
    super(props)
  }


  canShowHover() {
    const {geneHoverData,cohortIndex} = this.props
    if(!geneHoverData || geneHoverData.length !== 2) return false
    // if they both are tissue 'Header' then show
    if(geneHoverData[0].tissue === geneHoverData[1].tissue && geneHoverData[1].tissue === 'Header') {
      return true
    }
    // or if the selected cohort is NOT
    return geneHoverData[cohortIndex].tissue !== 'Header'
  }

  render(){

    const cohortColor = this.props.cohortColor[this.props.cohortIndex]

    return (
      <div
        className={BaseStyle.geneSetDetailBox}
        style={{backgroundColor:cohortColor}}
      >
        {this.props.geneDataStats && this.props.geneDataStats[this.props.cohortIndex].samples &&
        <GeneSetSubCohortBox
          cohortIndex={this.props.cohortIndex}
          geneDataStats={this.props.geneDataStats}
          onEditCohorts={this.props.onEditCohorts}
          subCohortCounts={this.props.subCohortCounts}
        />
        }
        {this.props.open &&
          <SelectGeneView
            data={this.props.geneDataStats[this.props.cohortIndex]}
          />
        }
        {
          this.canShowHover() &&
          <HoverGeneView
            cohortIndex={this.props.cohortIndex}
            data={this.props.geneHoverData ? this.props.geneHoverData[this.props.cohortIndex] : null}
            view={this.props.view}
          />
        }


      </div>
    )
  }

}

GeneSetInformationColumn.propTypes = {
  cohort: PropTypes.any.isRequired,
  cohortColor: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  geneDataStats: PropTypes.any,
  geneHoverData: PropTypes.any,
  onEditCohorts: PropTypes.any.isRequired,
  open: PropTypes.any.isRequired,
  subCohortCounts: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,

}
