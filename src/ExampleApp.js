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
            pathwayData: {
                expression: ExampleExpression,
                pathways: ExamplePathWays,
                samples: ExampleSamples,
            },
            geneData: {
                expression: [],
                pathways: [],
                samples: [],
            },
            pathwayHoverData: {
                aaa: 'aaaaValue',
                bbb: 'bbbbValue',
                x: null,
                y: null,
                tissue: null,
                pathway: null,
                score: null
            },
            pathwayClickData: {
                aaa: 'aaaaValue',
                bbb: 'bbbbValue',
                x: null,
                y: null,
                tissue: null,
                pathway: null,
                score: null
            },
            geneHoverData: {
                aaa: 'aaaaValue',
                bbb: 'bbbbValue',
                x: null,
                y: null,
                tissue: null,
                gene: null,
                score: null
            },
            geneClickData: {
                aaa: 'aaaaValue',
                bbb: 'bbbbValue',
                x: null,
                y: null,
                tissue: null,
                pathway: null,
                score: null
            },

        };

        this.hoverPathway = this.hoverPathway.bind(this);
        this.clickPathway = this.clickPathway.bind(this);
        this.hoverGene = this.hoverGene.bind(this);
        this.clickGene = this.clickGene.bind(this);


    }

    clickPathway(props) {
        if (props && props.x) {
            this.setState({pathwayClickData: props});
            this.setState({geneData: this.state.pathwayData});

            console.log(this.state.pathwayClickData)
        }
    }

    hoverPathway(props) {
        if (props && props.x) {
            this.setState({pathwayHoverData: props});
        }
    }

    clickGene(props) {
        if (props && props.x) {
            this.setState({geneClickData: props});
        }
    }

    hoverGene(props) {
        if (props && props.x) {
            this.setState({geneHoverData: props});
        }
    }

    render() {

        const alignTop = {
            marginLeft: '40px',
            paddingLeft: '40px',
            verticalAlign: 'top',
            width: '100px'
        };

        const geneAlignment = {
            paddingTop: '100px',
            marginTop: '100px',
            marginLeft: '40px',
            paddingLeft: '40px',
            verticalAlign: 'top',
            width: '100px'
        };

        return (
            <div>
                <table>
                    <tbody>
                    <tr>
                        <td>
                            <h2>Cohorts</h2>
                            <CohortSelector cohorts={ExampleCohortsData}/>
                            <TissueView id="pathwayViewId" width="400" height="800" data={this.state.pathwayData}
                                        onClick={this.clickPathway} onHover={this.hoverPathway}/>
                        </td>
                        <td style={alignTop}>
                            <HoverView title="Hover" data={this.state.pathwayHoverData}/>
                            <HoverView title="Clicked" data={this.state.pathwayClickData}/>
                        </td>
                        { this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                            <td style={geneAlignment}>
                                <TissueView id="geneViewId" width="400" height="800" data={this.state.geneData}
                                            onClick={this.clickGene} onHover={this.hoverGene}/>
                            </td>
                        }
                        <td style={alignTop}>
                            <HoverView title="Hover" data={this.state.geneHoverData}/>
                            <HoverView title="Clicked" data={this.state.geneClickData}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

