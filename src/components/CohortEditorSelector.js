import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import React from 'react';
import BaseStyle from '../css/base.css';
import {Button} from 'react-toolbox';
import {fetchCohortData, getCohortsForView, getViewsForCohort} from '../functions/CohortFunctions';
import {intersection} from '../functions/MathFunctions';

export class CohortEditorSelector extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      view: props.view,
      // cohort : props.cohort,
      // filter: props.filter,
    };
  }

  handleChangeCohort = (event) => {
    console.log('handling cohort change',event.target.value);
    // this.props.onChange(event.target.value);
  };

  handleChangeSubCohort = (event) => {
    console.log('handling sub cohorrt ',event.target.value);
    // this.props.onChange(event.target.value);
  };

  handleChangeView = (event) => {
    console.log('handling change view',event.target.value);
    // this.props.onChange(event.target.value);
  };

  render(){

    const { cohort , onCancelCohortEdit, onChangeView, view} = this.props;
    const cohorts = getCohortsForView(view);
    const availableCohorts = fetchCohortData().filter( c => cohorts.indexOf(c.name)>=0 );
    const allowableViews = intersection(getViewsForCohort(cohort[0].name),getViewsForCohort(cohort[1].name));

    return (
      <div>
        <div className={BaseStyle.cohortEditorBox}>
        View:
          <select
            onChange={(event) => this.setState({view: [event.target.value,event.target.value]})}
            value={this.state.view}
          >
            {
              Object.entries(allowableViews).map( f => {
                return (
                  <option key={f[1]} value={f[1]}>{f[1]}</option>
                );
              })
            }
          </select>
          &nbsp;
          &nbsp;
          &nbsp;
          <Button icon='save' label='Save' onClick={onChangeView} primary raised/>
          <Button icon='cancel' label='Cancel' onClick={onCancelCohortEdit} raised/>
        </div>
        <table className={BaseStyle.cohortEditorBox}>
          <thead>
            <tr>
              <th>
              Cohort A: {cohort[0].name}
                <select
                  className={BaseStyle.softflow}
                  // onChange={this.handleChange}
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
              Cohort B: {cohort[1].name}
                <select
                  className={BaseStyle.softflow}
                  onChange={this.handleChange}
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
          </thead>
          <tbody>
            <tr className={BaseStyle.cohortEditorRow}>
              <td>
              Copy Right
              Vs All
              </td>
              <td>
              Swap
              </td>
              <td>
              Copy Left
              Vs All
              </td>
            </tr>
            <tr className={BaseStyle.cohortEditorRow}>
              <td valign='top'>
                <ul className={BaseStyle.subCohortList}>
                  {cohort[0].subCohorts.map( sc => {
                    return (
                      <li key={sc}>
                        <input type='checkbox' value={sc}/>
                        {sc}</li>
                    );
                  })  }
                </ul>
              </td>
              <td valign='top'>
                <ul className={BaseStyle.subCohortList}>
                  {cohort[1].subCohorts.map( sc => {
                    return (
                      <li key={sc}>
                        <input type='checkbox' value={sc}/>
                        {sc}</li>
                    );
                  })  }
                </ul>
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
