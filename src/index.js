import React, {Component} from 'react'
import ExampleCohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import TissueView from "./components/TissueView";
import ExamplePathWays from "../tests/data/tgac";
import ExampleExpression from "../tests/data/expression";
import ExampleSamples from "../tests/data/samples";


export default class Example extends Component {

  render() {
    let data = {
      expression: ExampleExpression,
        pathways: ExamplePathWays,
        samples: ExampleSamples,
    };

    return <div>
      <h2>Cohorts</h2>
      <CohortSelector cohorts={ExampleCohortsData}/>

      <TissueView width="400" height="400" data={data}/>

    </div>
  }
}

