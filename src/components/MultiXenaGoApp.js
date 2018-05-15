import React from 'react'
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import ExampleExpression from "../../tests/data/bulkExpression";
import ExampleCopyNumber from "../../tests/data/bulkCopyNumber";
import ExampleSamples from "../../tests/data/samples";
import PathWays from "../../tests/data/tgac";
import {Button} from 'react-toolbox/lib/button';
import {Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";


export default class MultiXenaGoApp extends PureComponent {
    constructor(props) {
        super(props);

        // initilialize an init app
        this.state = {
            apps: [
                {
                    key: 0,
                    selectedTissueSort: 'Cluster',
                    selectedGeneSort: 'Cluster',
                    selectedPathways: [],
                    sortTypes: ['Cluster', 'Hierarchical'],
                    pathwayData: {
                        cohort: 'TCGA Ovarian Cancer (OV)',
                        copyNumber: ExampleCopyNumber,
                        expression: ExampleExpression,
                        pathways: PathWays,
                        samples: ExampleSamples,
                    },
                    loadState: 'loading',
                    selectedCohort: 'TCGA Ovarian Cancer (OV)',
                    cohortData: {},
                    tissueExpressionFilter: 'All',
                    geneExpressionFilter: 'All',
                    minFilter: 2,
                    filterPercentage: 0.005,
                    geneData: {
                        copyNumber: [],
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
                },
                // {
                //     selectedTissueSort: 'Cluster',
                //     selectedGeneSort: 'Cluster',
                //     selectedPathways: [],
                //     sortTypes: ['Cluster', 'Hierarchical'],
                //     pathwayData: {
                //         cohort: 'TCGA Ovarian Cancer (OV)',
                //         copyNumber: ExampleCopyNumber,
                //         expression: ExampleExpression,
                //         pathways: PathWays,
                //         samples: ExampleSamples,
                //     },
                //     loadState: 'loading',
                //     selectedCohort: 'TCGA Ovarian Cancer (OV)',
                //     cohortData: {},
                //     tissueExpressionFilter: 'All',
                //     geneExpressionFilter: 'All',
                //     minFilter: 2,
                //     filterPercentage: 0.005,
                //     geneData: {
                //         copyNumber: [],
                //         expression: [],
                //         pathways: [],
                //         samples: [],
                //     },
                //     pathwayHoverData: {
                //         tissue: null,
                //         pathway: null,
                //         score: null
                //     },
                //     pathwayClickData: {
                //         tissue: null,
                //         pathway: null,
                //         score: null
                //     },
                //     geneHoverData: {
                //         tissue: null,
                //         gene: null,
                //         score: null
                //     },
                //     geneClickData: {
                //         tissue: null,
                //         pathway: null,
                //         score: null
                //     },
                // }
            ]
        }
    }


    render() {
        let appLength = this.state.apps.length ;
        return this.state.apps.map( (app,index) => {
            return (
            <div key={app.key} >
                <XenaGoApp appState={app}/>
                {index === appLength-1 &&
                // if its the last one, then allow for an add
                <CardActions>
                    <Button label='+ Add Cohort' raised primary onClick={ () => this.duplicateCohort(app)}/>
                </CardActions>
                }

                {index > 0 &&
                // if its not the first one, then allow for a deletion
                <CardActions>
                <Button label='- Remove Cohort' raised primary onClick={ () => this.removeCohort(app)}/>
                    </CardActions>
                }

            </div>
            )
        });
    }

    // just duplicate the last state
    duplicateCohort = (app) => {
        // console.log('duplicating cohort: '+ index)
        let newCohort = JSON.parse(JSON.stringify(app));
        newCohort.key  = this.state.apps[this.state.apps.length-1].key + 1 ;
        let apps = JSON.parse(JSON.stringify(this.state.apps)) ;
        apps.push(newCohort);
        this.setState({
            apps: apps
        });
    };

    removeCohort(app) {
        let apps = JSON.parse(JSON.stringify(this.state.apps)).filter( (f) => f.key !== app.key  ) ;
        this.setState({
            apps: apps
        });
    }
}
