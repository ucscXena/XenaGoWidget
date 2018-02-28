import React, {Component} from 'react'
import ExampleCohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import TissueView from "./components/TissueView";
import ExamplePathWays from "../tests/data/tgac";
// import ExampleExpression from "../tests/data/expression";
import ExampleExpression from "../tests/data/bulkExpression";
import ExampleSamples from "../tests/data/samples";
import ExampleStyle from "../tests/example.css";
import HoverView from "./components/HoverView"

function onHoverPathway(props){
    console.log('root hovered: '+props)
}

function onClickPathway(props){
    console.log('root clicked: '+ props)
    // if(props){
    //     console.log(props)
    // }
}

export default class Example extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        let data = {
            expression: ExampleExpression,
            pathways: ExamplePathWays,
            samples: ExampleSamples,
        };


        return <div>
            <div style={ExampleStyle.column1}>
                <h2>Cohorts</h2>
                <CohortSelector cohorts={ExampleCohortsData}/>
                <TissueView id="pathwayViewId" width="400" height="800" data={data} onClick={onClickPathway} onHover={onHoverPathway}/>
                <HoverView id="hoverPathwayViewId"/>
            </div>
            {/*<div className={ExampleStyle.column2}>*/}
                {/*<TissueView id="geneViewId" width="400" height="800" data={data}/>*/}
                {/*<HoverView id="hoverGeneViewId" width="400" height="800" data={data}/>*/}
            {/*</div>*/}
        </div>
    }
}

