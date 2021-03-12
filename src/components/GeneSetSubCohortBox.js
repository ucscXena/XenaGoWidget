import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../css/base.css'
import {Dialog} from 'react-toolbox/lib'
import Link from 'react-toolbox/lib/link'
import FaEdit from 'react-icons/lib/fa/edit'

const MAX_SUB_COHORTS = 5


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
    const {color,cohortIndex, geneDataStats, onEditCohorts, subCohortCounts} = this.props
    const samplesLength = geneDataStats[cohortIndex].samples.length
    const selectedCohort = geneDataStats[cohortIndex].selectedCohort
    if(!subCohortCounts || subCohortCounts.length!==2) return <div>Calculating</div>
    return (
      <div className={BaseStyle.bottomInfoBox} style={{borderColor: color}}>
        <h3 className={BaseStyle.cohortTitle}>{selectedCohort.name}</h3>
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
                if(selectedCohort.selectedSubCohorts.length===1 && subCohortCounts[cohortIndex][s]===0){
                  return (
                    <li className={BaseStyle.noteError} key={s}>
                      Note: No sub cohorts available for {s} <br/>so ALL available samples selected.
                    </li>
                  )
                }
                else{
                  return (
                    <li key={s}>{s} ({subCohortCounts[cohortIndex][s]})</li>
                  )
                }
              }
              )}
            </ul>
          </div>
        </Dialog>
        <hr/>
        <div>
          <b>{samplesLength} samples</b>
          <button
            className={BaseStyle.editCohorts}
            onClick={() => onEditCohorts()}
          >
            Edit <FaEdit/>
          </button>
        </div>
        <hr/>
        { selectedCohort.selectedSubCohorts.length < selectedCohort.subCohorts.length && selectedCohort.selectedSubCohorts.length > 0 && selectedCohort.selectedSubCohorts.length <= MAX_SUB_COHORTS &&
          <ul className={BaseStyle.noBullets}>
            {selectedCohort.selectedSubCohorts.sort().map( s => {
              if(selectedCohort.selectedSubCohorts.length===1 && subCohortCounts[cohortIndex][s]===0) {
                return (
                  <li className={BaseStyle.noteError} key={s}>
                    Note: No sub cohorts available for {s} so ALL available samples selected.
                  </li>
                )
              }
              else
              if(!isNaN(subCohortCounts[cohortIndex][s])) {
                return (
                  <li key={s}>{s} ({subCohortCounts[cohortIndex][s]})</li>
                )
              }
            }
            )}
          </ul>
        }
        {selectedCohort.selectedSubCohorts.length === selectedCohort.subCohorts.length &&
        <div style={{marginLeft: 7,marginTop: 10}}>Showing all available samples</div>
        }
        { selectedCohort.selectedSubCohorts.length < selectedCohort.subCohorts.length && selectedCohort.selectedSubCohorts.length > 0 && selectedCohort.selectedSubCohorts.length > MAX_SUB_COHORTS &&
        <ul className={BaseStyle.noBullets}>
          {selectedCohort.selectedSubCohorts.sort().slice(0,MAX_SUB_COHORTS).map( s => {
            return (
              <li key={s}>{s}({subCohortCounts[cohortIndex][s]})</li>
            )
          }
          )}
          <li>
            <Link
              className={BaseStyle.subGroupButton}
              label={this.allSubCohortsStatement(selectedCohort.selectedSubCohorts)} onClick={()=>this.setState({showInfo: true})}/>
          </li>
        </ul>
        }
      </div>
    )
  }

}

GeneSetSubCohortBox.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  color: PropTypes.any.isRequired,
  geneDataStats: PropTypes.any.isRequired,
  onEditCohorts: PropTypes.any.isRequired,
  subCohortCounts: PropTypes.any,
}
