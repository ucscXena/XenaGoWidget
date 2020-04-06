import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {GeneSetSubCohortBox} from './GeneSetSubCohortBox'
import BaseStyle from '../css/base.css'
import HoverGeneView from './HoverGeneView'

export class GeneSetInformationColumn extends PureComponent {


  constructor(props) {
    super(props)
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
        {this.props.geneHoverData &&
        <HoverGeneView
          cohortIndex={this.props.cohortIndex}
          data={this.props.geneHoverData[this.props.cohortIndex]}
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
  subCohortCounts: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,

}
