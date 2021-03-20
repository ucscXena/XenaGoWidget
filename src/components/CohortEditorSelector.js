import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import React from 'react'
import {Button} from 'react-toolbox/lib/button'
import BaseStyle from '../css/base.css'
import {
  fetchCohortData, getAllSubCohortPossibleSamples,
  getCohortDetails,
  getCohortsForView, getSamplesFromSelectedSubCohorts, getSubCohortsForCohort,
  getSubCohortsOnlyForCohort,
} from '../functions/CohortFunctions'
import update from 'immutability-helper'
import Link from 'react-toolbox/lib/link'
import {AppStorageHandler} from '../service/AppStorageHandler'

function calculateCanSave(samples,cohorts){
  // if we have sub cohorts and we must have samples, otherwise we will automatically choose everything anyway
  return (
    (
      (cohorts[0].subCohorts.length> 0 && samples[0].length ) ||
      (cohorts[0].subCohorts.length===0) ||
      (samples[0].length === 0 && cohorts[0].selectedSubCohorts.length===1 && cohorts[0].selectedSubCohorts[0]==='UNASSIGNED')
    )
    &&
    (
      (cohorts[1].subCohorts.length> 1 && samples[1].length ) ||
      (cohorts[1].subCohorts.length===0) ||
      (samples[1].length === 0 && cohorts[1].selectedSubCohorts.length===1 && cohorts[1].selectedSubCohorts[0]==='UNASSIGNED')
    )
  )
}

export class CohortEditorSelector extends PureComponent {

  constructor(props) {
    super(props)
    const availableSamples = [getAllSubCohortPossibleSamples(props.cohort[0].name),getAllSubCohortPossibleSamples(props.cohort[1].name)]
    const selectedSamples =[getSamplesFromSelectedSubCohorts(props.cohort[0],availableSamples[0]),getSamplesFromSelectedSubCohorts(props.cohort[1],availableSamples[1])]
    this.state = {
      view: props.view,
      cohort: props.cohort,
      canSave: calculateCanSave(selectedSamples,props.cohort),
      availableSamples,
      selectedSamples,
      fetchSamples: false,
    }
  }

  handleCohortChange = (event,cohortIndex) => {
    const selectedCohortName = event.target.value
    let cohortDetails = getCohortDetails({name: selectedCohortName})
    cohortDetails.subCohorts = getSubCohortsOnlyForCohort(selectedCohortName)
    cohortDetails.selectedSubCohorts =  cohortDetails.subCohorts
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:cohortDetails}
    })
    this.updateSampleState(newCohortState)
  };

  swapCohorts() {
    const newCohortState = update(this.state.cohort,{
      [0]: { $set:this.state.cohort[1]},
      [1]: { $set:this.state.cohort[0]}
    })
    this.updateSampleState(newCohortState)
  }

  copyCohorts(fromCohortIndex,toCohortIndex) {
    const newCohortState = update(this.state.cohort,{
      [toCohortIndex]: { $set:this.state.cohort[fromCohortIndex]},
    })
    this.updateSampleState(newCohortState)
  }

  handleSubCohortChange = (event,cohortIndex) => {
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]))

    if(event.target.checked && !newCohort.selectedSubCohorts.find( s => s===event.target.value )  ){
      newCohort.selectedSubCohorts.push(event.target.value)
    }
    else
    if(!event.target.checked ){
      newCohort.selectedSubCohorts =   newCohort.selectedSubCohorts.filter( s => s!==event.target.value)
    }

    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    })
    this.updateSampleState(newCohortState)
  };

  selectNone(cohortIndex){
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]))
    // newCohort.selectedSubCohorts = newCohort.subCohorts ;
    newCohort.selectedSubCohorts = []
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    })
    this.updateSampleState(newCohortState)
  }

  selectOnly(cohortIndex,item){
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]))
    // newCohort.selectedSubCohorts = newCohort.subCohorts ;
    newCohort.selectedSubCohorts = [item]
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    })
    this.updateSampleState(newCohortState)
  }

  updateSampleState(newCohortState) {
    const availableSamples = [getAllSubCohortPossibleSamples(newCohortState[0].name),getAllSubCohortPossibleSamples(newCohortState[1].name)]
    const selectedSamples =[getSamplesFromSelectedSubCohorts(newCohortState[0],availableSamples[0]),getSamplesFromSelectedSubCohorts(newCohortState[1],availableSamples[1])]
    this.setState({
      cohort: newCohortState,
      canSave: calculateCanSave(selectedSamples,newCohortState),
      availableSamples,
      selectedSamples,
    })
  }

  clearTemporarySubCohorts() {

    if(confirm('Remove added subgroup?')){
      AppStorageHandler.clearSubCohorts()
      // TODO: reset the list
      let newCohortA = JSON.parse(JSON.stringify(this.state.cohort[0]))
      let newCohortB = JSON.parse(JSON.stringify(this.state.cohort[1]))

      let subCohortsA = getSubCohortsForCohort(this.state.cohort[0].name)
      let subCohortsB = getSubCohortsForCohort(this.state.cohort[1].name)
      newCohortA.subCohorts = Object.keys(subCohortsA)
      newCohortB.subCohorts = Object.keys(subCohortsB)
      newCohortA.selectedSubCohorts = Object.keys(subCohortsA)
      newCohortB.selectedSubCohorts = Object.keys(subCohortsB)

      // update state
      const newCohortState = update(this.state.cohort,{
        [0]: { $set:newCohortA},
        [1]: { $set:newCohortB},
      })
      this.updateSampleState(newCohortState)
    }
  }


  selectAll(cohortIndex){
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]))
    newCohort.selectedSubCohorts = newCohort.subCohorts
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    })
    this.updateSampleState(newCohortState)
  }

  render(){

    const { onCancelCohortEdit, onChangeView, subCohortCounts } = this.props
    const {  view, cohort , selectedSamples, availableSamples } = this.state
    const cohorts = getCohortsForView(view)
    const availableCohorts = fetchCohortData().filter( c => cohorts.indexOf(c.name)>=0 )
    const maximumSubCohorts = [getSubCohortsForCohort(cohort[0].name),getSubCohortsForCohort(cohort[1].name)]

    if(!subCohortCounts){
      return (<div>Loading</div>)
    }
    else
    if(subCohortCounts){
      return (
        <div>
          <table className={BaseStyle.cohortEditorBox}>
            <tbody>
              <tr>
                <td colSpan={3}>
                  <u>Current View:</u>Visualizing differences using '{view}'
                  {this.props.titleText}
                </td>
              </tr>
              <tr>
                <th colSpan={2} style={{textAlign: 'left'}}>
                  <select
                    className={BaseStyle.softflow}
                    onChange={(event) => this.handleCohortChange(event,0)}
                    value={cohort[0].name}
                  >
                    {
                      availableCohorts.map(c => {
                        return (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        )
                      })
                    }
                  </select>
                </th>
                <th style={{textAlign: 'left'}}>
                  <select
                    className={BaseStyle.softflow}
                    onChange={(event) => this.handleCohortChange(event,1)}
                    style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}
                    value={cohort[1].name}
                  >
                    {
                      availableCohorts.map(c => {
                        return (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        )
                      })
                    }
                  </select>
                </th>
              </tr>
              <tr className={BaseStyle.cohortEditorRow}>
                <td valign='top'>
                  { cohort[0].subCohorts && cohort[0].subCohorts.length>1 &&
                  <div>
                    <Link
                      href='#'
                      // label={`(Select All ${cohort[0].subCohorts.length} subcohorts)`}
                      label={'(Select All)'}
                      onClick={() => this.selectAll(0)}
                      style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                    />
                    <Link
                      href='#'
                      label={'(Clear)'}
                      onClick={() => this.selectNone(0)}
                      style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                    />
                    <hr/>
                    Selected { selectedSamples[0].length } / { availableSamples[0].length }
                    <ul className={BaseStyle.subCohortList}>
                      {cohort[0].subCohorts.map( sc => {
                        return (
                          <li key={sc}>
                            <input
                              checked={cohort[0].selectedSubCohorts.find( s => sc===s ) !==undefined}
                              disabled={!subCohortCounts[0][sc] && !maximumSubCohorts[0][sc]}
                              onChange={(event) => this.handleSubCohortChange(event,0)}
                              type='checkbox'
                              value={sc}
                            />
                            {sc} (
                            <a href='#' onClick={() => this.selectOnly(0,sc)}>
                              {subCohortCounts[0][sc] ? subCohortCounts[0][sc] : `< ${maximumSubCohorts[0][sc] ? maximumSubCohorts[0][sc].length: 0} `}
                            </a>
                            )
                          </li>
                        )
                      })  }
                    </ul>
                  </div>
                  }
                </td>
                <td>
                  <Button flat floating icon='arrow_right' mini onClick={() => this.copyCohorts(0,1)} style={{display:'inline'}}/>
                  <br/>
                  <Button flat floating icon='swap_horiz' mini onClick={() => this.swapCohorts()} style={{display:'inline'}}/>
                  <br/>
                  <Button flat floating icon='arrow_left' mini onClick={() => this.copyCohorts(1,0)} style={{display:'inline'}}/>
                </td>
                <td valign='top'>
                  {cohort[1].subCohorts && cohort[1].subCohorts.length>1 &&
                <div>
                  <Link
                    href='#'
                    label={'(Select All)'}
                    onClick={() => this.selectAll(1)}
                    style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                  />
                  <Link
                    href='#'
                    label={'(Clear)'}
                    onClick={() => this.selectNone(1)}
                    style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                  />
                  <hr/>
                  Selected { selectedSamples[1].length } / { availableSamples[1].length }
                  <ul className={BaseStyle.subCohortList}>
                    {cohort[1].subCohorts.filter( sc => sc!=='UNASSIGNED').map(sc => {
                      return (
                        <li key={sc}>
                          <input
                            checked={cohort[1].selectedSubCohorts.find( s => sc===s ) !== undefined}
                            disabled={!subCohortCounts[1][sc] && !maximumSubCohorts[1][sc]}
                            onChange={(event) => this.handleSubCohortChange(event,1)}
                            type='checkbox'
                            value={sc}
                          />
                          {sc} (
                          <a href='#' onClick={() => this.selectOnly(1,sc)}>
                            {subCohortCounts[1][sc] ? subCohortCounts[1][sc] : `< ${maximumSubCohorts[1][sc] ? maximumSubCohorts[1][sc].length: 0} `}
                          </a>
                          )
                        </li>
                      )
                    })}
                  </ul>
                </div>
                  }
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <hr/>
                  {/*<div className={BaseStyle.cohortEditorBox}>*/}
                  <Button
                    disabled={!this.state.canSave} icon='save' label='Save' onClick={() => {
                      onChangeView(cohort,view)
                    }} primary raised
                  />
                  <Button icon='cancel' label='Cancel' onClick={onCancelCohortEdit} raised/>
                  <Button
                    mini
                    onClick={() => this.clearTemporarySubCohorts()}
                    raised
                    style={{color:'orange',marginLeft:150,fontSize:'smaller'}}
                  >
                    Clear temporary subgroups
                  </Button>
                  {/*</div>*/}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
  }

}
CohortEditorSelector.propTypes = {
  cohort: PropTypes.any.isRequired,
  onCancelCohortEdit: PropTypes.any.isRequired,
  onChangeView: PropTypes.any.isRequired,
  subCohortCounts: PropTypes.any.isRequired,
  titleText: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
