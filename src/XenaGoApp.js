import React from 'react'
import PureComponent from './components/PureComponent';
import ExampleCohortsData from '../tests/data/cohorts'
import {CohortSelector} from "./components/CohortSelector";
import TissueExpressionView from "./components/PathwayScoresView";
import ExamplePathWays from "../tests/data/tgac";
import ExampleExpression from "../tests/data/bulkExpression";
import ExampleSamples from "../tests/data/samples";
// import ExampleStyle from "../demo/src/example.css";
import HoverPathwayView from "./components/HoverPathwayView"
import HoverGeneView from "./components/HoverGeneView";
// import update from 'immutability-helper';
import mutationVector from "./data/mutationVector";
import {FilterSelector} from "./components/FilterSelector";


export default class XenaGoApp extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            pathwayData: {
                expression: ExampleExpression,
                pathways: ExamplePathWays,
                samples: ExampleSamples,
            },
            tissueExpressionFilter: '',
            geneExpressionFilter: '',
            geneData: {
                expression: [],
                pathways: [],
                samples: [],
            },
            pathwayHoverData: {
                tissue: null,
                pathway: null,
                score: null
            },
            pathwayClickData: {
                tissue: null,
                pathway: null,
                score: null
            },
            geneHoverData: {
                tissue: null,
                gene: null,
                score: null
            },
            geneClickData: {
                tissue: null,
                pathway: null,
                score: null
            },

        };

        this.hoverPathway = this.hoverPathway.bind(this);
        this.clickPathway = this.clickPathway.bind(this);
        this.hoverGene = this.hoverGene.bind(this);
        this.clickGene = this.clickGene.bind(this);

        this.filterTissueType = this.filterTissueType.bind(this);
        this.filterGeneType = this.filterGeneType.bind(this);

    }

    clickPathway(pathwayClickData) {
        var {expression, samples} = this.state.pathwayData;
        var {goid, golabel, gene} = pathwayClickData.pathway;

        var pathways = gene.map(gene => ({goid, golabel, gene: [gene]}));

        this.setState({
            pathwayClickData,
            geneData: {
                expression,
                samples,
                pathways,
                selectedPathway: pathwayClickData.pathway
            }
        });
    }

    hoverPathway(props) {
		this.setState({pathwayHoverData: props});
    }

    clickGene(props) {
		this.setState({geneClickData: props});
    }

    hoverGene(props) {
		this.setState({geneHoverData: props});
    }

    filterTissueType(filter) {
        this.setState({tissueExpressionFilter: filter});
    }

    filterGeneType(filter) {
        console.log('filtering egene :'+filter)
        this.setState({geneExpressionFilter: filter});
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
                            <h2>Mutation Type</h2>
                            <FilterSelector filters={mutationVector} selected={this.state.tissueExpressionFilter}
                                            pathwayData={this.state.pathwayData}
                                            onChange={this.filterTissueType}/>
                            <TissueExpressionView id="pathwayViewId" width="400" height="800"
                                                  data={this.state.pathwayData} titleText="Mutation Score"
                                                  filter={this.state.tissueExpressionFilter}
                                                  onClick={this.clickPathway} onHover={this.hoverPathway}/>
                        </td>
                        <td style={alignTop}>
                            <HoverPathwayView title="Hover" data={this.state.pathwayHoverData}/>
                            <HoverPathwayView title="Clicked" data={this.state.pathwayClickData}/>
                        </td>
                        {this.state.geneData && this.state.geneData.expression.rows && this.state.geneData.expression.rows.length > 0 &&
                        <td style={geneAlignment}>
                            <h2>Mutation Type</h2>
                            <FilterSelector filters={mutationVector} selected={this.state.geneExpressionFilter}
                                            pathwayData={this.state.geneData}
                                            onChange={this.filterGeneType}/>
                            <TissueExpressionView id="geneViewId" width="400" height="800" data={this.state.geneData}
                                                selected={this.state.geneData.selectedPathway}
                                                filter={this.state.geneExpressionFilter}
                                                onClick={this.clickGene} onHover={this.hoverGene}/>
                        </td>
                        }
                        <td style={alignTop}>
                            <HoverGeneView title="Hover" data={this.state.geneHoverData}/>
                            <HoverGeneView title="Clicked" data={this.state.geneClickData}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

