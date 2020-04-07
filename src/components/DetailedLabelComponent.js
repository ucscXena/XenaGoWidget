import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../css/base.css'
import Tooltip from 'react-toolbox/lib/tooltip'
import Link from 'react-toolbox/lib/link'
import {VERTICAL_GENESET_DETAIL_WIDTH} from './XenaGeneSetApp'

const TooltipLink = Tooltip(Link)

const COHORT_LENGTH= 15
const SUBCOHORT_LENGTH = 25
// let getShortName = (name) => (name.length>MAGIC_LENGTH ? name.substr(0,MAGIC_LENGTH-3)+'..' : name);

function getShortName(name,length){
  return (name.length>length? name.substr(0,length-3)+'..' : name)
}

function cleanSubCohortName(name){
  const firstIndex = name.indexOf('.')
  if(firstIndex>0) return name.substr(firstIndex+1)
  return name
}

function getSelectedSubCohorts(selectedSubCohorts,length) {
  if(selectedSubCohorts.length===0){ return ''}
  if(selectedSubCohorts.length===1){
    return getShortName(cleanSubCohortName(selectedSubCohorts))
  }
  return getShortName( selectedSubCohorts.map( s => cleanSubCohortName(s)).join(','),length)
}

export class DetailedLabelComponent extends PureComponent {

  render() {
    const {cohortIndex,onEditCohorts} = this.props
    const cohort = this.props.cohort[cohortIndex]
    const color = this.props.cohortColor[cohortIndex]
    const pathwayData = this.props.pathwayData[cohortIndex]
    const width= VERTICAL_GENESET_DETAIL_WIDTH * 2

    const cohortName = getShortName(cohort.name,COHORT_LENGTH)
    const subCohortDetails = getSelectedSubCohorts(cohort.selectedSubCohorts,SUBCOHORT_LENGTH)
    return (
      <table>
        <tbody>
          <tr>
            <td className={BaseStyle.cohortAGeneSetViewer} style={{backgroundColor:color}} width={width/2 +30}>
              <div className={BaseStyle.geneSetHeaderLabel}>
                <TooltipLink
                  className={BaseStyle.infoLink} href="#" label={cohortName +' '+subCohortDetails}
                  onClick={()=> onEditCohorts()}
                  tooltip={cohort.name}
                />
                {pathwayData.samples &&
              <div className={BaseStyle.inlinePathwayChip}>
                {pathwayData.samples.length}
              </div>
                }
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

DetailedLabelComponent.propTypes = {
  cohort: PropTypes.any.isRequired,
  cohortColor: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  onEditCohorts: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
}
