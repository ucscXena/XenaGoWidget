import React from 'react'
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
import ExampleExpression from "../../tests/data/bulkExpression";
import ExampleCopyNumber from "../../tests/data/bulkCopyNumber";
import ExampleSamples from "../../tests/data/samples";
import PathWays from "../../tests/data/tgac";
import {Button} from 'react-toolbox/lib/button';
import {Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";
import {sum} from 'underscore';


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
            ]
        }
    }


    render() {
        let appLength = this.state.apps.length;
        // let statBox = this.generateGlobalStatsForApps(this.state.apps);
        // this.state.apps.map( (a) => a.statBox = statBox );
        return this.state.apps.map((app, index) => {
            return (
                <div key={app.key} style={{border: 'solid'}}>
                    <XenaGoApp appData={app} statGenerator={this.generateStats} stats={this.state.statBox}/>

                    {index > 0 &&
                    // if its not the first one, then allow for a deletion
                    <CardActions>
                        <Button label='- Remove Cohort' raised flat onClick={() => this.removeCohort(app)}/>
                    </CardActions>
                    }

                    {index === appLength - 1 &&
                    // if its the last one, then allow for an add
                    <CardActions>
                        <Button label='+ Add Cohort' raised primary onClick={() => this.duplicateCohort(app)}/>
                    </CardActions>
                    }


                </div>
            )
        });
    }

    // just duplicate the last state
    duplicateCohort(app) {
        // console.log('duplicating cohort: '+ index)
        let newCohort = JSON.parse(JSON.stringify(app));
        newCohort.key = this.state.apps[this.state.apps.length - 1].key + 1;
        let apps = JSON.parse(JSON.stringify(this.state.apps));

        // calculate the render offset based on the last offset
        let {renderHeight, renderOffset} = apps[apps.length - 1];
        newCohort.renderOffset = renderOffset + renderHeight + 10;
        apps.push(newCohort);

        // let statBox = this.generateGlobalStatsForApps(apps);
        // apps.map( (a) => a.statBox = statBox );


        this.setState({
            apps: apps
        });
    };

    removeCohort(app) {
        let apps = JSON.parse(JSON.stringify(this.state.apps)).filter((f) => f.key !== app.key);
        // let statBox = this.generateGlobalStatsForApps(apps);
        // apps.map( (a) => a.statBox = statBox );
        this.setState({
            apps: apps
        });
    }

    generateStats = (appData) => {

        // for each app get the column scores
        console.log('generating stats with app');
        console.log(appData);


        // for each column, associate columns with pathways
        let summedPathways = appData.data.map((a, index) => {
                let pathway = appData.pathways[index];
                return {
                    'name': pathway,
                    'sum': sum(a)
                }
            }
        );

        let apps = JSON.parse(JSON.stringify(this.state.apps));

        apps[appData.index].summedColumn = summedPathways;

        // generate a global stat box
        let statBox = this.generateGlobalStats(apps);

        this.setState({
            apps: apps,
            statBox: statBox,
        });

    };

    maxStats = 9;

    getName(c){
        return  c.name.gene.length === 1 ? c.name.gene[0] : c.name.golabel ;
    }

    /**
     *
     * show top-5 correlated pathways with color (32%/25%/17%) GO Pathway X
     * show top-5 correlated genes with color (32%/25%/17%) Genex X
     * show highly correlated genes
     * @param apps
     * @returns {*}
     */
    generateGlobalStats(apps) {
        // only one app, maybe provide something?
        // if(apps.length<2){
        //     return {};
        // }

        // assume everything is a gene for now

        // dumb way, just add up the columns to get the highest

        // here, we want an array of A[name] = score;

        let columnList = apps.map(app => app.summedColumn);

        let columnObjectList = columnList.map( (cl) => {
            let columnObject = {};
            cl.forEach( c => {
                return columnObject[this.getName(c)] = c.sum
            });
            return columnObject;
        });
        console.log('col');
        console.log(columnObjectList);

        let finalObjectList = columnObjectList[0];
        // console.log('col rest');
        // console.log(columnObjectList.slice(1));
        columnObjectList.slice(1).forEach( (col) => {

            Object.keys(finalObjectList).forEach( k => {
                let otherValue = col[k];
                otherValue = otherValue===undefined ? 0 : otherValue ;
                finalObjectList[k] *= otherValue ;
            });
            // col.forEach( c => {
            //    let name = c.name.gene[0];
            //    let nameStat = finalObjectList[name] ;
            // });
        });

        // console.log('finalObjectList')
        // console.log(finalObjectList)


        // let globalStat = {};
        // apps.forEach(app => {
        //     app.summedColumn.forEach(column => {
        //         console.log('name')
        //         let name = column.name.gene[0];
        //         let nameStat = globalStat[name];
        //         // a novel one
        //         if (!nameStat) {
        //             nameStat = column.sum
        //         }
        //         // combine them
        //         else {
        //             nameStat *= column.sum;
        //         }
        //         globalStat[name] = nameStat;
        //     });
        // });

        let commonGenes = [];
        Object.keys(finalObjectList).forEach(k => {
                if(finalObjectList[k]>0) {
                    let newGene = {
                        'name': k,
                        'score': finalObjectList[k],
                    };
                    commonGenes.push(newGene);
                }
            }
        );


        let reducedGenes = commonGenes.sort((a, b) => {
            return b.score - a.score;
        });

        if (reducedGenes.length > this.maxStats) {
            reducedGenes = reducedGenes.slice(0, this.maxStats);
        }


        return {
            commonGenes: reducedGenes
        }
    }
}
