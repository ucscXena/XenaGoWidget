import React, {Component} from 'react'
import ExampleCohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import CanvasDrawing from "./CanvasDrawing";
import TissueView from "./components/TissueView";


export default class Example extends Component {
  render() {
    return <div>
      <h2>Cohorts</h2>
      <CohortSelector cohorts={ExampleCohortsData}/>

      <TissueView width="100" height="100"/>

      {/*<CanvasDrawing width={100} height={100}/>*/}

    </div>
  }
}

