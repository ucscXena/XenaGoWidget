import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import React from 'react';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox';
import {
  fetchCohortData, getAllSubCohortPossibleSamples,
  getCohortDetails,
  getCohortsForView, getSamplesFromSelectedSubCohorts, getSubCohortsForCohort,
  getSubCohortsOnlyForCohort,
  getViewsForCohort
} from '../functions/CohortFunctions';
import {intersection} from '../functions/MathFunctions';
import update from 'immutability-helper';
import Link from 'react-toolbox/lib/link';
import {
  fetchSampleData,
} from '../functions/FetchFunctions';


export class CohortEditorSelector extends PureComponent {

  constructor(props) {
    super(props);
    const availableSamples = [getAllSubCohortPossibleSamples(props.cohort[0].name),getAllSubCohortPossibleSamples(props.cohort[1].name)];
    const selectedSamples =[getSamplesFromSelectedSubCohorts(props.cohort[0],availableSamples[0]),getSamplesFromSelectedSubCohorts(props.cohort[1],availableSamples[1])];
    this.state = {
      view: props.view,
      cohort: props.cohort,
      availableSamples,
      selectedSamples,
      fetchSamples: true,
      subCohortCounts: undefined,
    };
  }

  handleCohortChange = (event,cohortIndex) => {
    const selectedCohortName = event.target.value ;
    let cohortDetails = getCohortDetails({name: selectedCohortName});
    cohortDetails.subCohorts = getSubCohortsOnlyForCohort(selectedCohortName);
    cohortDetails.selectedSubCohorts =  cohortDetails.subCohorts ;
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:cohortDetails}
    });
    this.updateSampleState(newCohortState);
  };

  swapCohorts() {
    const newCohortState = update(this.state.cohort,{
      [0]: { $set:this.state.cohort[1]},
      [1]: { $set:this.state.cohort[0]}
    });
    this.updateSampleState(newCohortState);
  }

  copyCohorts(fromCohortIndex,toCohortIndex) {
    const newCohortState = update(this.state.cohort,{
      [toCohortIndex]: { $set:this.state.cohort[fromCohortIndex]},
    });
    this.updateSampleState(newCohortState);
  }

  handleSubCohortChange = (event,cohortIndex) => {
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]));

    if(event.target.checked && !newCohort.selectedSubCohorts.find( s => s===event.target.value )  ){
      newCohort.selectedSubCohorts.push(event.target.value);
    }
    else
    if(!event.target.checked ){
      newCohort.selectedSubCohorts =   newCohort.selectedSubCohorts.filter( s => s!==event.target.value);
    }

    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    });
    this.updateSampleState(newCohortState);
  };

  handleViewChange = (event) => {
    this.setState({view: event.target.value});
  };

  selectNone(cohortIndex){
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]));
    // newCohort.selectedSubCohorts = newCohort.subCohorts ;
    newCohort.selectedSubCohorts = [] ;
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    });
    this.updateSampleState(newCohortState);
  }

  selectOnly(cohortIndex,item){
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]));
    // newCohort.selectedSubCohorts = newCohort.subCohorts ;
    newCohort.selectedSubCohorts = [item] ;
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    });
    this.updateSampleState(newCohortState);
  }

  updateSampleState(newCohortState) {
    const availableSamples = [getAllSubCohortPossibleSamples(newCohortState[0].name),getAllSubCohortPossibleSamples(newCohortState[1].name)];
    const selectedSamples =[getSamplesFromSelectedSubCohorts(newCohortState[0],availableSamples[0]),getSamplesFromSelectedSubCohorts(newCohortState[1],availableSamples[1])];
    this.setState({
      cohort: newCohortState,
      availableSamples,
      selectedSamples,
    });
  }

  selectAll(cohortIndex){
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]));
    newCohort.selectedSubCohorts = newCohort.subCohorts ;
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    });
    this.updateSampleState(newCohortState);
  }

  handleSampleDataCounts = (cohortA,cohortB) => {
    console.log('input counts A',cohortA);
    console.log('input counts B',cohortB);

    const newSubCohortCounts =  [
      cohortA.subCohortCounts.map( s => {
        let returnOjb = { };
        returnOjb[s.name] = s.count ;
        return returnOjb;
      })
      ,
      cohortB.subCohortCounts.map( s => {
        let returnOjb = { };
        returnOjb[s.name] = s.count ;
        return returnOjb;
      })
    ];


    console.log('new sub counts',newSubCohortCounts);

    this.setState({
      fetchSamples: false,
      subCohortCounts: newSubCohortCounts,
    });
  };

  getCountForKey(input,key){
    const returnValue = input.filter( s => {
      return Object.keys(s)[0]===key;
    });
    return returnValue && returnValue.length>0 ? returnValue[0]: undefined;
  }

  render(){

    const { onCancelCohortEdit, onChangeView} = this.props;
    const { fetchSamples, view, cohort , selectedSamples, availableSamples , subCohortCounts} = this.state ;
    const cohorts = getCohortsForView(view);
    const availableCohorts = fetchCohortData().filter( c => cohorts.indexOf(c.name)>=0 );
    const allowableViews = intersection(getViewsForCohort(cohort[0].name),getViewsForCohort(cohort[1].name));
    const subCohorts = [getSubCohortsForCohort(cohort[0].name),getSubCohortsForCohort(cohort[1].name)];


    console.log('fetching samples',fetchSamples);
    console.log('input sub cohorts',subCohorts);
    if(fetchSamples){
      fetchSampleData(cohort,view,this.handleSampleDataCounts);
    }

    if(!subCohortCounts){
      return (<div>Loading</div>) ;
    }
    else
    if(subCohortCounts){

      console.log('sub cohort counts',subCohortCounts);
      // console.log('find one',subCohortCounts[1].filter( s => {
      //   console.log('s',Object.keys(s)[0])
      //   return Object.keys(s)[0]==='PRAD.3-ETV4';
      // }));
      return (
        <div>
          <div className={BaseStyle.cohortEditorBox}>
            <Button
              icon='save' label='Save' onClick={() => {
                onChangeView(cohort,view);
              }} primary raised
            />
            <Button icon='cancel' label='Cancel' onClick={onCancelCohortEdit} raised/>
          </div>
          <table className={BaseStyle.cohortEditorBox}>
            <tbody>
              <tr>
                <td>
              Analysis:
                  <select
                    onChange={this.handleViewChange}
                    value={view}
                  >
                    {
                      Object.entries(allowableViews).map( f => {
                        return (
                          <option key={f[1]} value={f[1]}>{f[1]}</option>
                        );
                      })
                    }
                  </select>
                </td>
                <td>
                  <Button flat floating icon='subdirectory_arrow_right' mini onClick={() => this.copyCohorts(0,1)} style={{display:'inline'}}/>
                  <Button flat floating icon='swap_horiz' mini onClick={() => this.swapCohorts()} style={{display:'inline'}}/>
                  <Button flat floating icon='subdirectory_arrow_left' mini onClick={() => this.copyCohorts(1,0)} style={{display:'inline'}}/>
                </td>
              </tr>
              <tr>
                <th>
                  <u>Cohort A</u>
                  <select
                    className={BaseStyle.softflow}
                    onChange={(event) => this.handleCohortChange(event,0)}
                    style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}
                    value={cohort[0].name}
                  >
                    {
                      availableCohorts.map(c => {
                        return (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        );
                      })
                    }
                  </select>
                </th>
                <th>
                  <u>Cohort B</u>
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
                        );
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
                              disabled={!subCohorts[0][sc]}
                              onChange={(event) => this.handleSubCohortChange(event,0)}
                              type='checkbox'
                              value={sc}
                            />
                            {sc} (
                            <a href='#' onClick={() => this.selectOnly(0,sc)}>
                              {subCohorts[0][sc] ? subCohorts[0][sc].length : 0}
                            </a>
                            )
                          </li>
                        );
                      })  }
                    </ul>
                  </div>
                  }
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
                    {cohort[1].subCohorts.map(sc => {
                      return (
                        <li key={sc}>
                          <input
                            checked={cohort[1].selectedSubCohorts.find( s => sc===s ) !== undefined}
                            disabled={!subCohorts[1][sc]}
                            onChange={(event) => this.handleSubCohortChange(event,1)}
                            type='checkbox'
                            value={sc}
                          />
                          {sc} (
                          <a href='#' onClick={() => this.selectOnly(1,sc)}>
                            {subCohorts[1][sc] ? subCohorts[1][sc].length : 0}
                          </a>
                          )
                        </li>
                      );
                    })}
                  </ul>
                </div>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  }
}
CohortEditorSelector.propTypes = {
  cohort: PropTypes.any.isRequired,
  onCancelCohortEdit: PropTypes.any.isRequired,
  onChangeView: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
};
