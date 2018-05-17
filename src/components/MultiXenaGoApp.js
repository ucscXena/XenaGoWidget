import React from 'react'
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
import ExampleExpression from "../../tests/data/bulkExpression";
import ExampleCopyNumber from "../../tests/data/bulkCopyNumber";
import ExampleSamples from "../../tests/data/samples";
import PathWays from "../../tests/data/tgac";
import {Button} from 'react-toolbox/lib/button';
import {getGenePathwayLookup,getCopyNumberValue,getMutationScore} from '../functions/DataFunctions';
import {Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";
import {range, times} from 'underscore';



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

    /**
     * For each expression result, for each gene listed, for each column represented in the pathways, populate the appropriate samples
     *
     * @param expression
     * @param copyNumber
     * @param geneList
     * @param pathways
     * @param samples
     * @param filter
     * @param min
     * @returns {any[]}
     */
    associateData = (expression, copyNumber, geneList, pathways, samples, filter, min) => {
        // console.log('munge munge munge')
        // console.log(expression, copyNumber, geneList, pathways, samples, filter, min)
        //
        // console.log(this.state)
        filter = filter.indexOf('All') === 0 ? '' : filter;
        let returnArray = times(pathways.length, () => times(samples.length, () => 0))
        let sampleIndex = new Map(samples.map((v, i) => [v, i]));
        let genePathwayLookup = getGenePathwayLookup(pathways);

        // TODO: we should lookup the pathways and THEN the data, as opposed to looking up and then filtering
        if (!filter || filter === 'Mutation') {
            for (let row of expression.rows) {
                let effectValue = getMutationScore(row.effect, min);
                let pathwayIndices = genePathwayLookup(row.gene);

                for (let index of pathwayIndices) {
                    returnArray[index][sampleIndex.get(row.sample)] += effectValue;
                }
            }
        }


        if (!filter || filter === 'Copy Number') {

            // get list of genes in identified pathways
            for (let gene of geneList) {
                // if we have not processed that gene before, then process
                let geneIndex = geneList.indexOf(gene);

                let pathwayIndices = genePathwayLookup(gene);
                let sampleEntries = copyNumber[geneIndex]; // set of samples for this gene
                // we retrieve proper indices from the pathway to put back in the right place

                // get pathways this gene is involved in
                for (let index of pathwayIndices) {
                    // process all samples
                    for (let sampleEntryIndex in sampleEntries) {
                        let returnValue = getCopyNumberValue(sampleEntries[sampleEntryIndex]);
                        if (returnValue > 0) {
                            returnArray[index][sampleEntryIndex] += returnValue;
                        }
                    }
                }
            }

        }

        this.setState({
            statBox:{
                commonGenes:[
                    {name:'ARC1',score:7},
                    {name:'BRCA3',score:12}
                ],
                commonPathways:[
                    {name:'DNA something',score:9},
                    {name:'other something',score:3}
                ],
            }
        })

        return returnArray;

    };


    render() {
        let appLength = this.state.apps.length ;
        // let statBox = this.generateGlobalStatsForApps(this.state.apps);
        // this.state.apps.map( (a) => a.statBox = statBox );
        return this.state.apps.map( (app,index) => {
            return (
            <div key={app.key} style={{border:'solid'}}>
                <XenaGoApp appData={app} dataMunger={this.associateData} stats={this.state.statBox}/>

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
    duplicateCohort(app){
        // console.log('duplicating cohort: '+ index)
        let newCohort = JSON.parse(JSON.stringify(app));
        newCohort.key  = this.state.apps[this.state.apps.length-1].key + 1 ;
        let apps = JSON.parse(JSON.stringify(this.state.apps)) ;

        // calculate the render offset based on the last offset
        let {renderHeight,renderOffset} = apps[apps.length-1];
        newCohort.renderOffset = renderOffset + renderHeight + 10;
        apps.push(newCohort);

        // let statBox = this.generateGlobalStatsForApps(apps);
        // apps.map( (a) => a.statBox = statBox );


        this.setState({
            apps: apps
        });
    };

    removeCohort(app) {
        let apps = JSON.parse(JSON.stringify(this.state.apps)).filter( (f) => f.key !== app.key  ) ;
        // let statBox = this.generateGlobalStatsForApps(apps);
        // apps.map( (a) => a.statBox = statBox );
        this.setState({
            apps: apps
        });
    }
    //
    // generateGlobalStatsForApps(apps) {
    //     console.log('apps')
    //     console.log(apps)
    //     return {
    //         commonGenes:[
    //             {name:'ARC1',score:32},
    //             {name:'BRCA3',score:44}
    //         ],
    //         commonPathways:[
    //             {name:'DNA something',score:32},
    //             {name:'other something',score:44}
    //         ],
    //     }
    // }
}
