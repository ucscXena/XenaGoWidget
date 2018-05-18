import React from 'react'
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
import ExampleExpression from "../../tests/data/bulkExpression";
import ExampleCopyNumber from "../../tests/data/bulkCopyNumber";
import ExampleSamples from "../../tests/data/samples";
import PathWays from "../../tests/data/tgac";
import {Button} from 'react-toolbox/lib/button';
import {Switch, Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";
import {sum} from 'underscore';

const MAX_GLOBAL_STATS = 10;

export default class MultiXenaGoApp extends PureComponent {
    constructor(props) {
        super(props);

        // initilialize an init app
        this.state = {
            synchronizeSort: true,
            synchronizeSelection: true,
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
        return this.state.apps.map((app, index) => {
            let refString = 'xena-go-app-'+index;
            return (
                <div key={app.key} style={{border: 'solid'}}>


                    <XenaGoApp appData={app}
                               statGenerator={this.generateStats}
                               stats={this.state.statBox}
                               pathwaySelect={this.pathwaySelect}
                               ref={refString}
                    />

                    <Card>
                        {index === 0 &&
                        <CardActions>
                            <Switch
                                checked={this.state.synchronizeSort}
                                label="Synchronize sort"
                                onChange={() => this.toggleSynchronizeSort()}
                            />
                            <Switch
                                checked={this.state.synchronizeSelection}
                                label="Synchronize selection"
                                onChange={() => this.toggleSynchronizeSelection()}
                            />
                        </CardActions>
                        }

                        <CardActions>
                            {index > 0 &&
                            // if its not the first one, then allow for a deletion
                            <Button label='- Remove Cohort' raised flat onClick={() => this.removeCohort(app)}/>
                            }

                            {index === appLength - 1 &&
                            // if its the last one, then allow for an add
                            <Button label='+ Add Cohort' raised primary onClick={() => this.duplicateCohort(app)}/>
                            }
                        </CardActions>
                    </Card>


                </div>
            )
        });
    }


    toggleSynchronizeSort() {
        this.setState({
            synchronizeSort: !this.state.synchronizeSort
        })
    }

    toggleSynchronizeSelection() {

        // set sort as well
        let newSort = !this.state.synchronizeSelection ? true : this.state.synchronizeSort;

        this.setState({
            synchronizeSelection: !this.state.synchronizeSelection,
            synchronizeSort: newSort,
        })
    }

    // just duplicate the last state
    duplicateCohort(app) {
        // console.log('duplicating cohort: '+ index)
        let newCohort = JSON.parse(JSON.stringify(app));
        newCohort.key = this.state.apps[this.state.apps.length - 1].key + 1;
        let apps = JSON.parse(JSON.stringify(this.state.apps));

        // calculate the render offset based on the last offset
        let {renderHeight, renderOffset} = apps[apps.length - 1];
        newCohort.renderOffset = renderOffset + renderHeight + 80;
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

    pathwaySelect = (pathwaySelection) => {
        console.log('multixenagoapp selection');
        console.log(pathwaySelection);

        // let myIndex = pathwaySelection.key ;

        // let xenaGoApp = this.refs.abcd
        let xenaGoApp = this.refs['xena-go-app-'+0];
        console.log('xenaGoApp')
        console.log(this.refs)
        console.log(xenaGoApp)

        // let apps = JSON.parse(JSON.stringify(this.state.apps));
        //
        // console.log(myIndex);
        // console.log(apps)

        // TODO: get pathway data for this index
        // TODO: propagate to other instances

        // this.setState({
        //     apps: apps,
        // });

    };

    generateStats = (appData) => {

        // for each column, associate columns with pathways
        let summedPathways = appData.data.map((a, index) => {
                let pathway = appData.pathways[index];
                let score = sum(a);
                let percent = score / a.length;
                return {
                    'name': pathway,
                    'sum': score,
                    'percent': percent,
                }
            }
        );

        let apps = JSON.parse(JSON.stringify(this.state.apps));

        console.log(summedPathways);

        apps[appData.index].summedColumn = summedPathways;

        // generate a global stat box
        let statBox = this.generateGlobalStats(apps);

        this.setState({
            apps: apps,
            statBox: statBox,
        });

    };


    getName(c) {
        return c.name.gene.length === 1 ? c.name.gene[0] : c.name.golabel;
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
        // assume everything is a gene for now
        // dumb way, just add up the columns to get the highest
        let columnList = apps.map(app => app.summedColumn);

        let columnObjectList = columnList.map((cl) => {
            let columnObject = {};
            cl.forEach(c => {
                return columnObject[this.getName(c)] = c.percent;
            });
            return columnObject;
        });
        console.log('col');
        console.log(columnObjectList);

        let finalObjectList = columnObjectList[0];
        // console.log('col rest');
        // console.log(columnObjectList.slice(1));
        columnObjectList.slice(1).forEach((col) => {

            Object.keys(finalObjectList).forEach(k => {
                let otherValue = col[k];
                otherValue = otherValue === undefined ? 0 : otherValue;
                finalObjectList[k] *= otherValue;
            });
        });

        let commonGenes = [];
        Object.keys(finalObjectList).forEach(k => {
                if (finalObjectList[k] > 0) {
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

        if (reducedGenes.length > MAX_GLOBAL_STATS) {
            reducedGenes = reducedGenes.slice(0, MAX_GLOBAL_STATS);
        }


        return {
            commonGenes: reducedGenes
        }
    }
}
