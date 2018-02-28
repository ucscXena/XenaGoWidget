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

let hoverData = {
    aaa:'aaaaValue',
    bbb:'bbbbValue',
    x:null,
    y:null,
    tissue: null,
    pathway: null,
    score:null
};

let clickData = {
    aaa:'aaaaValue',
    bbb:'bbbbValue',
    x:null,
    y:null,
    tissue: null,
    pathway: null,
    score:null
};

function onHoverPathway(props){
    // console.log('root pathway hovered: '+props)
    if(props && props.x){
        // this.setState({hoverData:props});
        hoverData = props;
        // console.log('showing hover data');
        // console.log(props);
        // console.log(hoverData);
    }
}

function onClickPathway(props){
    // alert('root pathway clicked: '+ props)
    console.log('root pathway clicked: '+ props);
    if(props && props.x){
        hoverData = props;
        console.log('showing click data');
        console.log(props);
        console.log(hoverData);
    }
}

function onHoverGene(props){
    console.log('root gene hovered: '+props)
}

function onClickGene(props){
    alert('root gene clicked: '+ JSON.stringify(props))
    // if(props){
    //     console.log(props)
    // }
}

function HoverElement(props) {
    return (
        <div>
            <ul>
                <li>asldkfj</li>
                <li>{hoverData.aaa}</li>
                <li>{hoverData.x}</li>
                <li>{hoverData.y}</li>
                <li>asldfjk</li>
            {/*<input ref={props.hoverData} />*/}
            </ul>
        </div>
    );
};

export default class Example extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hoverData :{
                aaa:'aaaaValue',
                bbb:'bbbbValue',
                x:null,
                y:null,
                tissue: null,
                pathway: null,
                score:null
            },
            clickData:{
                aaa:'aaaaValue',
                bbb:'bbbbValue',
                x:null,
                y:null,
                tissue: null,
                pathway: null,
                score:null
            }
        };

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
                <HoverView id="hoverPathwayViewId" data={hoverData}/>
                <HoverElement hoverData={hoverData}/>
                <TissueView id="pathwayViewId" width="400" height="800" data={data} onClick={onClickPathway} onHover={onHoverPathway}/>
            </div>
            {/*<div className={ExampleStyle.column2}>*/}
                {/*/!*<HoverView id="hoverGeneViewId" />*!/*/}
                {/*<TissueView id="geneViewId" width="400" height="800" data={smallData}  onClick={onClickGene} onHover={onHoverGene}/>*/}
            {/*</div>*/}
        </div>
    }
}

