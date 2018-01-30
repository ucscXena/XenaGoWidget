import React, {Component} from 'react'
import ExampleCohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";


export default class Example extends Component {
  render() {
    return <div>
      <h2>Cohorts</h2>
      <CohortSelector cohorts={ExampleCohortsData}/>
    </div>
  }
}

