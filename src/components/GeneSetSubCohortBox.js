import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../css/base.css'
// import {IconButton} from 'react-toolbox';
import {Dialog} from 'react-toolbox/lib'
import Tooltip from 'react-toolbox/lib/tooltip'
import Link from 'react-toolbox/lib/link'
import {Button} from 'react-toolbox'
import FaEdit from 'react-icons/lib/fa/edit'

const TooltipLink = Tooltip(Link)

const MAGIC_LENGTH = 28
const MAX_SUB_COHORTS = 7


export class GeneSetSubCohortBox extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      showInfo: false,
    }
  }

  allSubCohortsStatement(selectedSubCohorts) {
    return `View All ${selectedSubCohorts.length} subgroups`
  }

  render(){
    const {cohortIndex, geneDataStats, onEditCohorts, subCohortCounts} = this.props
    const samplesLength = geneDataStats[cohortIndex].samples.length
    const selectedCohort = geneDataStats[cohortIndex].selectedCohort
    const label = selectedCohort.name.length>MAGIC_LENGTH ? selectedCohort.name.substr(0,MAGIC_LENGTH-3)+'..' : selectedCohort.name
    if(!subCohortCounts || subCohortCounts.length!==2) return <div>Calculating</div>
    return (
      <div className={BaseStyle.bottomInfoBox}>
        <TooltipLink
          className={BaseStyle.infoLink} href="#" label={label}
          onClick={()=>this.setState({showInfo: true})}
          tooltip={selectedCohort.name}
        />
        <Dialog
          active={this.state.showInfo}
          onEscKeyDown={() => this.setState({showInfo:false})}
          onOverlayClick={() => this.setState({showInfo:false})}
          title={selectedCohort.name}
          type='normal'
        >
          <div>
            <ul>
              {selectedCohort.selectedSubCohorts.sort().map( s => {
                return (
                  <li key={s}>{s} ({subCohortCounts[cohortIndex][s]})</li>
                )
              }
              )}
            </ul>
          </div>
        </Dialog>
        <div className={BaseStyle.samplesBox}>
          {samplesLength} samples
          <Button mini onClick={() => onEditCohorts()}>
            <FaEdit/>
          </Button>
        </div>
        { selectedCohort.selectedSubCohorts.length < selectedCohort.subCohorts.length && selectedCohort.selectedSubCohorts.length > 0 && selectedCohort.selectedSubCohorts.length <= MAX_SUB_COHORTS &&
          <ul className={BaseStyle.noBullets}>
            {selectedCohort.selectedSubCohorts.sort().map( s => {
              return (
                <li key={s}>{s} ({subCohortCounts[cohortIndex][s]})</li>
              )
            }
            )}
          </ul>
        }
        { selectedCohort.selectedSubCohorts.length < selectedCohort.subCohorts.length && selectedCohort.selectedSubCohorts.length > 0 && selectedCohort.selectedSubCohorts.length > MAX_SUB_COHORTS &&
        <ul className={BaseStyle.noBullets}>
          {selectedCohort.selectedSubCohorts.sort().slice(0,MAX_SUB_COHORTS).map( s => {
            return (
              <li key={s}>{s}({subCohortCounts[s]})</li>
            )
          }
          )}
          <li>
            <Link  label={this.allSubCohortsStatement(selectedCohort.selectedSubCohorts)} onClick={()=>this.setState({showInfo: true})}/>
          </li>
        </ul>
        }
      </div>
    )
  }

}

GeneSetSubCohortBox.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  geneDataStats: PropTypes.any.isRequired,
  onEditCohorts: PropTypes.any.isRequired,
  subCohortCounts: PropTypes.any,
}
