import React, {Component} from 'react'
import ExampleCohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import CanvasDrawing from "./CanvasDrawing";
import TissueView from "./components/TissueView";
import ExampleTGACData from "../tests/data/tgac";


export default class Example extends Component {
  render() {
    return <div>
      <h2>Cohorts</h2>
      <CohortSelector cohorts={ExampleCohortsData}/>

      <TissueView width="400" height="400" data={ExampleTGACData}/>

      {/*<CanvasDrawing width={100} height={100}/>*/}

    </div>
  }
}

