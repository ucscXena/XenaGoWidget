import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import React from 'react';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox';
import {
  fetchCohortData,
  getCohortDetails,
  getCohortsForView,
  getSubCohortsOnlyForCohort,
  getViewsForCohort
} from '../functions/CohortFunctions';
import {intersection} from '../functions/MathFunctions';
import update from 'immutability-helper';

export class CohortEditorSelector extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      view: props.view,
      cohort: props.cohort,
      // cohort : props.cohort,
      // filter: props.filter,
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
    console.log('handling sub cohort change',event.target.value,cohortIndex);
    // this.props.onChange(event.target.value);
  };

  handleViewChange = (event) => {
    this.setState({view: event.target.value});
  };



  render(){

    const { onCancelCohortEdit, onChangeView} = this.props;
    const { view, cohort } = this.state ;
    const cohorts = getCohortsForView(view);
    console.log('getting cohorts for view',view,cohorts);
    const availableCohorts = fetchCohortData().filter( c => cohorts.indexOf(c.name)>=0 );
    console.log('local cohort B',cohort,view);
    const allowableViews = intersection(getViewsForCohort(cohort[0].name),getViewsForCohort(cohort[1].name));

    return (
      <div>
        <div className={BaseStyle.cohortEditorBox}>
          <Button icon='save' label='Save' onClick={onChangeView} primary raised/>
          <Button icon='cancel' label='Cancel' onClick={onCancelCohortEdit} raised/>
        </div>
        <table className={BaseStyle.cohortEditorBox}>
          <tbody>
            <tr>
              <td colSpan={2}>
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
              <td>
                <Button flat floating icon='subdirectory_arrow_right' mini onClick={() => this.copyCohorts(0,1)}/>
              </td>
              <td>
                <Button flat floating icon='swap_horiz' mini onClick={() => this.swapCohorts()}/>
              </td>
              <td>
                <Button flat floating icon='subdirectory_arrow_left' mini onClick={() => this.copyCohorts(1,0)}/>
              </td>
            </tr>
            <tr className={BaseStyle.cohortEditorRow}>
              <td valign='top'>
                { cohort[0].subCohorts &&
                <ul className={BaseStyle.subCohortList}>
                  {cohort[0].subCohorts.map( sc => {
                    return (
                      <li key={sc}>
                        <input
                          checked={cohort[0].selectedSubCohorts.find( s => sc===s )}
                          onChange={(event) => this.handleSubCohortChange(event,0)}
                          type='checkbox'
                          value={sc}
                        />
                        {sc}</li>
                    );
                  })  }
                </ul>
                }
              </td>
              <td valign='top'>
                {cohort[1].subCohorts &&
                <ul className={BaseStyle.subCohortList}>
                  {cohort[1].subCohorts.map(sc => {
                    return (
                      <li key={sc}>
                        <input
                          checked={cohort[1].selectedSubCohorts.find( s => sc===s )}
                          onChange={(event) => this.handleSubCohortChange(event,1)}
                          type='checkbox'
                          value={sc}
                        />
                        {sc}</li>
                    );
                  })}
                </ul>
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
  onChangeCohorts: PropTypes.any.isRequired,
  onChangeView: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
};
