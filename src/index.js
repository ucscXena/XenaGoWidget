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
    console.log('root pathway hovered: '+props)
}

function onClickPathway(props){
    alert('root pathway clicked: '+ props)
    // if(props){
    //     console.log(props)
    // }
}

function onHoverGene(props){
    console.log('root gene hovered: '+props)
}

function onClickGene(props){
    alert('root gene clicked: '+ props)
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

        // we will change this on the fly, I think.
        let smallData = {
            expression: ExampleExpression,
            pathways: ExamplePathWays,
            samples: ExampleSamples,
        };

        return <div>
            <div style={ExampleStyle.column1}>
                <h2>Cohorts</h2>
                <CohortSelector cohorts={ExampleCohortsData}/>
                <HoverView id="hoverPathwayViewId"/>
                <TissueView id="pathwayViewId" width="400" height="800" data={data} onClick={onClickPathway} onHover={onHoverPathway}/>
            </div>
            <div className={ExampleStyle.column2}>
                <HoverView id="hoverGeneViewId" />
                <TissueView id="geneViewId" width="400" height="800" data={smallData}  onClick={onClickGene} onHover={onHoverGene}/>
            </div>
        </div>
    }
}

