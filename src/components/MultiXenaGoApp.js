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
                    renderHeight: 800,
                    renderOffset: 0,
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
        let statBox = this.generateGlobalStatsForApps(this.state.apps);
        this.state.apps.map( (a) => a.statBox = statBox );
        return this.state.apps.map( (app,index) => {
            return (
            <div key={app.key} style={{border:'solid'}}>
                <XenaGoApp appState={app}/>

                {index > 0 &&
                // if its not the first one, then allow for a deletion
                <CardActions>
                    <Button label='- Remove Cohort' raised flat onClick={ () => this.removeCohort(app)}/>
                </CardActions>
                }

                {index === appLength-1 &&
                // if its the last one, then allow for an add
                <CardActions>
                    <Button label='+ Add Cohort' raised primary onClick={ () => this.duplicateCohort(app)}/>
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

        // calculate the render offset based on the last offset
        let {renderHeight,renderOffset} = apps[apps.length-1];
        newCohort.renderOffset = renderOffset + renderHeight + 10;
        apps.push(newCohort);

        let statBox = this.generateGlobalStatsForApps(apps);
        apps.map( (a) => a.statBox = statBox );


        this.setState({
            apps: apps
        });
    };

    removeCohort(app) {
        let apps = JSON.parse(JSON.stringify(this.state.apps)).filter( (f) => f.key !== app.key  ) ;
        let statBox = this.generateGlobalStatsForApps(apps);
        apps.map( (a) => a.statBox = statBox );
        this.setState({
            apps: apps
        });
    }

    generateGlobalStatsForApps(apps) {
        return {
            commonGenes:[
                {name:'ARC1',score:32},
                {name:'BRCA3',score:44}
            ],
            commonPathways:[
                {name:'DNA something',score:32},
                {name:'other something',score:44}
            ],
        }
    }
}
