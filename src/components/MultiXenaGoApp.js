import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
import ExampleExpression from "../../tests/data/bulkExpression";
import ExampleCopyNumber from "../../tests/data/bulkCopyNumber";
import ExampleSamples from "../../tests/data/samples";
import {Switch, Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";
import {sum} from 'underscore';


const MAX_GLOBAL_STATS = 30;

// synchronizing gene sorts between pathways
const LOCAL_STORAGE_STRING = "default-app-storage";

export default class MultiXenaGoApp extends PureComponent {


    constructor(props) {
        super(props);
        let {synchronizeSort, synchronizeSelection, renderHeight} = this.props;
        // initilialize an init app
        this.state = {
            synchronizeSort: synchronizeSort,
            synchronizeSelection: synchronizeSelection,
            renderHeight: renderHeight,
            apps:MultiXenaGoApp.getApp(this.props),
        }
    }

    loadDefault() {
        let pathwaySelection = (
            {
                pathway: this.props.pathways[21],
                tissue: 'Header'
            }
        );
        let myIndex = 0;
        this.refs['xena-go-app-' + myIndex].clickPathway(pathwaySelection);

    }

    componentDidMount() {
        this.loadDefault();
    }

    render() {
        let {synchronizeSort, renderHeight} = this.props;
        MultiXenaGoApp.storeApp(this.state.apps);
        return this.state.apps.map((app, index) => {
            let refString = 'xena-go-app-' + index;
            return (
                <div key={app.key}>
                    <XenaGoApp appData={app}
                               statGenerator={this.generateStats}
                               stats={this.state.statBox}
                               pathwaySelect={this.pathwaySelect}
                               ref={refString}
                               renderHeight={renderHeight}
                               renderOffset={(renderHeight + 5) * index}
                               synchronizeSort={synchronizeSort}
                               pathways={this.props.pathways}
                    />
                </div>
            )
        });
    }

    reloadCohorts (){
        alert('reloading the cohort')
    };

    // // just duplicate the last state
    duplicateCohort() {
        let app = this.state.apps[0];
        let newCohort = JSON.parse(JSON.stringify(app));
        newCohort.key = this.state.apps[this.state.apps.length - 1].key + 1;
        let apps = JSON.parse(JSON.stringify(this.state.apps));

        // calculate the render offset based on the last offset
        let {renderHeight, renderOffset} = apps[apps.length - 1];
        newCohort.renderOffset = renderOffset + renderHeight + 5;
        apps.push(newCohort);

        if (this.props.synchronizeSelection) {
            let myIndex = app.key;
            app.propagate = false;

            let rootAppSelection = JSON.parse(JSON.stringify(this.refs['xena-go-app-' + myIndex].state));
            this.setState({
                    apps: apps
                },
                () => this.pathwaySelect(rootAppSelection.pathwayClickData, rootAppSelection.selectedPathways)
            );
        }
        else {
            this.setState({
                apps: apps
            });
        }
        return this.cohortCount();


    };

    cohortCount(){
        if(this.state.apps){
            return this.state.apps.length;
        }
        return 0 ;
    }

    removeCohort() {
        let app = this.state.apps[1];
        let apps = JSON.parse(JSON.stringify(this.state.apps)).filter((f) => f.key !== app.key);
        this.setState({
            apps: apps
        });
        return this.cohortCount();
    }

    pathwaySelect = (pathwaySelection, selectedPathways) => {
        if (this.props.synchronizeSelection) {
            let myIndex = pathwaySelection.key;
            pathwaySelection.propagate = false;
            this.state.apps.forEach((app, index) => {
                if (index !== myIndex) {
                    if (selectedPathways) {
                        this.refs['xena-go-app-' + index].setPathwayState(selectedPathways, pathwaySelection);
                    }
                    else {
                        this.refs['xena-go-app-' + index].clickPathway(pathwaySelection);
                    }
                }
            });
        }
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
        let finalObjectList = columnObjectList[0];
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
            commonGenes: reducedGenes,
            cohortCount: apps.length,
        }
    }

    static storeApp(pathway) {
        if (pathway) {
            localStorage.setItem(LOCAL_STORAGE_STRING, JSON.stringify(pathway));
        }
    }

    static getApp(props) {
        let storedPathway = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STRING));
        if (storedPathway) {
            return storedPathway
        }
        else {
            return [
                {
                    key: 0,
                    renderHeight: props.renderHeight,
                    renderOffset: 5,
                    selectedTissueSort: 'Cluster',
                    selectedGeneSort: 'Cluster',
                    selectedPathways: [],
                    sortTypes: ['Cluster', 'Hierarchical'],
                    pathwayData: {
                        cohort: 'TCGA Ovarian Cancer (OV)',
                        copyNumber: ExampleCopyNumber,
                        expression: ExampleExpression,
                        pathways: props.pathways,
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
            ];
        }
    }

}

MultiXenaGoApp.propTyes = {
    pathways: PropTypes.any.isRequired,
    renderHeight: PropTypes.any,
    synchronizeSort: PropTypes.any,
    synchronizeSelection: PropTypes.any,
};
