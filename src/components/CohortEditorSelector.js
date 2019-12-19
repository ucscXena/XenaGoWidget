import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import React from 'react';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox';
import {
  fetchCohortData,
  getCohortDetails,
  getCohortsForView, getSubCohortsForCohort,
  getSubCohortsOnlyForCohort,
  getViewsForCohort
} from '../functions/CohortFunctions';
import {intersection} from '../functions/MathFunctions';
import update from 'immutability-helper';
import Link from 'react-toolbox/lib/link';

export class CohortEditorSelector extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      view: props.view,
      cohort: props.cohort,
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
    this.setState({
      cohort: newCohortState
    });
  };

  swapCohorts() {
    const newCohortState = update(this.state.cohort,{
      [0]: { $set:this.state.cohort[1]},
      [1]: { $set:this.state.cohort[0]}
    });
    this.setState({
      cohort: newCohortState
    });
  }

  copyCohorts(fromCohortIndex,toCohortIndex) {
    const newCohortState = update(this.state.cohort,{
      [toCohortIndex]: { $set:this.state.cohort[fromCohortIndex]},
    });
    this.setState({
      cohort: newCohortState
    });
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
    this.setState({
      cohort: newCohortState
    });
  };

  handleViewChange = (event) => {
    this.setState({view: event.target.value});
  };

  selectAll(cohortIndex){
    let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]));
    newCohort.selectedSubCohorts = newCohort.subCohorts ;
    const newCohortState = update(this.state.cohort,{
      [cohortIndex]: { $set:newCohort},
    });
    this.setState({
      cohort: newCohortState
    });
  }

  // handleSelectOnly = (value,cohortIndex) => {
  //   let newCohort = JSON.parse(JSON.stringify(this.state.cohort[cohortIndex]));
  //   newCohort.selectedSubCohorts = JSON.parse(JSON.stringify([value])) ;
  //   const newCohortState = update(this.state.cohort,{
  //     [cohortIndex]: { selectedSubCohorts: { $set : [value]}},
  //   });
  //   this.setState({
  //     cohort: newCohortState
  //   });
  // };


  render(){

    const { onCancelCohortEdit, onChangeView} = this.props;
    const { view, cohort } = this.state ;
    const cohorts = getCohortsForView(view);
    const availableCohorts = fetchCohortData().filter( c => cohorts.indexOf(c.name)>=0 );
    const allowableViews = intersection(getViewsForCohort(cohort[0].name),getViewsForCohort(cohort[1].name));

    console.log('avaialble cohorts',availableCohorts);
    console.log('current cohort',cohort);

    const subCohorts = [getSubCohortsForCohort(cohort[0].name),getSubCohortsForCohort(cohort[1].name)];
    console.log('sub cohorts',subCohorts);
    console.log('sub cohorts filtered',subCohorts[0]['OVCA.Immunoreactive'].length);

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
              View:
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
                <br/>
                {cohort[0].name}
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
                <br/>
                {cohort[1].name}
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
                      label={`(Select All ${cohort[0].subCohorts.length})`}
                      onClick={() => this.selectAll(0)}
                      style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                    />
                    <ul className={BaseStyle.subCohortList}>
                      {cohort[0].subCohorts.map( sc => {
                        return (
                          <li key={sc}>
                            <input
                              checked={cohort[0].selectedSubCohorts.find( s => sc===s )}
                              disabled={!subCohorts[0][sc]}
                              onChange={(event) => this.handleSubCohortChange(event,0)}
                              type='checkbox'
                              value={sc}
                            />
                            {sc} ({subCohorts[0][sc] ? subCohorts[0][sc].length : 0})
                            {/*<Link*/}
                            {/*  href='#' label={'(Only)'} onClick={() => { this.handleSelectOnly(sc,0); }}*/}
                            {/*  style={{display:'inline', marginLeft: 4,fontSize: 'small'}}*/}
                            {/*/>*/}
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
                    label={`(Select All ${cohort[1].subCohorts.length})`}
                    onClick={() => this.selectAll(1)}
                    style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                  />
                  <ul className={BaseStyle.subCohortList}>
                    {cohort[1].subCohorts.map(sc => {
                      return (
                        <li key={sc}>
                          <input
                            checked={cohort[1].selectedSubCohorts.find( s => sc===s )}
                            disabled={!subCohorts[1][sc]}
                            onChange={(event) => this.handleSubCohortChange(event,1)}
                            type='checkbox'
                            value={sc}
                          />
                          {sc} ({subCohorts[1][sc] ? subCohorts[1][sc].length : 0})
                          {/*<Link*/}
                          {/*  href='#' label={'(Only)'} onClick={() => { this.handleSelectOnly(sc,1); }}*/}
                          {/*  style={{display:'inline', marginLeft: 4,fontSize: 'small'}}*/}
                          {/*/>*/}
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
CohortEditorSelector.propTypes = {
  cohort: PropTypes.any.isRequired,
  onCancelCohortEdit: PropTypes.any.isRequired,
  onChangeView: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
};
