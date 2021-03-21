import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {GeneSetSubCohortBox} from './GeneSetSubCohortBox'
import BaseStyle from '../css/base.css'
import HoverFeatureView from './hover/HoverGeneView'
import SelectGeneView from './hover/SelectGeneView'
import {generateXenaLink} from '../functions/XenaLinkFunctions'
import {showXenaViewLink} from '../functions/DataFunctions'
import {Avatar} from 'react-toolbox/lib/avatar'
import XenaLogo from './xena.png'
import FaExternalLink from 'react-icons/lib/fa/external-link'
import {standardizeColor} from '../functions/ColorFunctions'


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


  render() {

    const cohortColor = this.props.cohortColor[this.props.cohortIndex]
    const standardizedColor = standardizeColor(cohortColor,1)
    const standardizedBackgroundColor = standardizeColor(cohortColor,0.3)

    if (this.props.geneDataStats && this.props.geneDataStats[this.props.cohortIndex].samples) {
      const externalLink = generateXenaLink(this.props)
      return (
        <div
          className={this.props.cohortIndex===0 ? BaseStyle.cohortBackgroundLeft:  BaseStyle.cohortBackgroundRight}
          style={{
            borderColor: `${standardizedColor}` ,
            // borderColor: standardizedColor,
            borderStyle: 'solid' ,
            backgroundColor: `${standardizedBackgroundColor}` ,
            // backgroundColor: standardizedColor,
            borderWidth: '5px',
            marginTop: 50,
            // zIndex:-20,
            marginLeft: this.props.cohortIndex === 0 ? 0 : 182 + 182  + 222 + 250 + 10
          }}
        />
        ,
        <div
          className={this.props.cohortIndex===0 ? BaseStyle.geneInfoLeft:  BaseStyle.geneInfoRight}
        >

          <GeneSetSubCohortBox
            cohortIndex={this.props.cohortIndex}
            color={cohortColor}
            geneDataStats={this.props.geneDataStats}
            onEditCohorts={this.props.onEditCohorts}
            subCohortCounts={this.props.subCohortCounts}
          />
          {
            (showXenaViewLink(this.props.view)  ||
                  (!showXenaViewLink(this.props.view) && this.props.open)) &&
                <div className={BaseStyle.ssInfoBox} style={{color:cohortColor}}>
                  <a
                    className={BaseStyle.xenaLinkOut}
                    href={externalLink}
                    rel="noopener noreferrer"
                    target='_blank'
                    title={externalLink}>
                    <Avatar
                      image={XenaLogo}
                    />
                    <div style={{display: 'inline',margin: 2}}>
                      View in Xena
                    </div>
                    <FaExternalLink/>
                  </a>
                </div>
          }
          {this.props.open &&
              <SelectGeneView
                data={this.props.geneDataStats[this.props.cohortIndex]}
              />
          }
          {
            this.canShowHover() &&
                <HoverFeatureView
                  cohortIndex={this.props.cohortIndex}
                  data={this.props.geneHoverData ? this.props.geneHoverData[this.props.cohortIndex] : null}
                  maxValue={this.props.maxValue}
                  view={this.props.view}
                />
          }

        </div>
      )
    }
    return <div/>
  }

}

GeneSetInformationColumn.propTypes = {
  cohort: PropTypes.any.isRequired,
  cohortColor: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  geneDataStats: PropTypes.any,
  geneHoverData: PropTypes.any,
  maxValue: PropTypes.any.isRequired,
  onEditCohorts: PropTypes.any.isRequired,
  open: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
  subCohortCounts: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,

}
