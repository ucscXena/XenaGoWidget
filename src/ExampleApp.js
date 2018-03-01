import React, {Component} from 'react'
import ExampleCohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import TissueView from "./components/TissueView";
import ExamplePathWays from "../tests/data/tgac";
// import ExampleExpression from "../tests/data/expression";
import ExampleExpression from "../tests/data/bulkExpression";
import ExampleSamples from "../tests/data/samples";
import ExampleStyle from "../demo/src/example.css";
import HoverView from "./components/HoverView"
import {Col, Grid, Row} from "react-bootstrap";


export default class SampleApp extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hoverData: {
                aaa: 'aaaaValue',
                bbb: 'bbbbValue',
                x: null,
                y: null,
                tissue: null,
                pathway: null,
                score: null
            },
            clickData: {
                aaa: 'aaaaValue',
                bbb: 'bbbbValue',
                x: null,
                y: null,
                tissue: null,
                pathway: null,
                score: null
            }
        };

        this.hoverPathway = this.hoverPathway.bind(this);
        this.clickPathway = this.clickPathway.bind(this);


    }

    clickPathway(props) {
        if (props && props.x) {
            this.setState({clickData: props});
        }
    }

    hoverPathway(props) {
        if (props && props.x) {
            this.setState({hoverData: props});
        }
    }

    render() {
        let data = {
            expression: ExampleExpression,
            pathways: ExamplePathWays,
            samples: ExampleSamples,
        };

        // we will change this on the fly, I think.
        let geneData = {
            expression: ExampleExpression,
            pathways: ExamplePathWays,
            samples: ExampleSamples,
        };

        const alignTop = {
            marginLeft: '40px',
            paddingLeft: '40px',
            // border: '5px solid pink',
            // textColor: 'red',
            verticalAlign: 'top'
        };


        return (
            <div>
                <table>
                    <tr>
                        <td>
                            <h2>Cohorts</h2>
                            <CohortSelector cohorts={ExampleCohortsData}/>
                            <TissueView id="pathwayViewId" width="400" height="800" data={data}
                                        onClick={this.clickPathway} onHover={this.hoverPathway}/>
                        </td>
                        <td style={alignTop}>
                            <HoverView title="Hover" data={this.state.hoverData}/>
                            <HoverView title="Clicked" data={this.state.clickData}/>
                        </td>
                    </tr>
                </table>
            </div>
        );
    }
}

