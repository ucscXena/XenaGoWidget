import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import {Switch, Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";
import {sum} from 'underscore';
import {AppStorageHandler} from "./AppStorageHandler";


const MAX_GLOBAL_STATS = 30;


/**
 * Deprecated
 */
export default class MultiXenaGoApp extends PureComponent {


    constructor(props) {
        super(props);
        let {pathways,renderHeight} = this.props;
        // initialize an init app
        this.state = {
            renderHeight: renderHeight,
            apps: AppStorageHandler.getAppData(pathways,renderHeight),
        }
    }

    loadSelectedState() {
        let myIndex = 0;
        let refLoaded = this.refs['xena-go-app-' + myIndex];
        if (refLoaded) {
            let selection = AppStorageHandler.getPathwaySelection();
            if(selection.selectedPathways){
                for(let index = 0 ; index < this.state.apps.length ; index++){
                    let ref = this.refs['xena-go-app-' + index];
                    ref.setPathwayState(selection.selectedPathways,selection);
                }
            }
            else{
                refLoaded.clickPathway(selection);
            }
        }
    }

    componentDidMount() {
        this.loadSelectedState();
    }

    render() {
        let {renderHeight} = this.props;
        AppStorageHandler.storeAppData(this.state.apps);
        console.log(this.state.apps);
        return this.state.apps.map((app, index) => {
            let refString = 'xena-go-app-' + index;
            return (
                <div key={app.key}>
                    <XenaGoViewer appData={app}
                                  statGenerator={this.generateStats}
                                  stats={this.state.statBox}
                                  pathwaySelect={this.pathwaySelect}
                                  pathwayHover={this.pathwayHover}
                                  ref={refString}
                                  renderHeight={renderHeight}
                                  renderOffset={(renderHeight + 5) * index}
                                  pathways={this.props.pathways}
                    />
                </div>
            )
        });
    }



    pathwayHover = (pathwayHover) => {
        let myIndex = pathwayHover.key;
        pathwayHover.propagate = false;
        this.state.apps.forEach((app, index) => {
            if (index !== myIndex) {
                this.refs['xena-go-app-' + index].setPathwayHover(pathwayHover.hoveredPathways);
            }
        });
    };

    pathwaySelect = (pathwaySelection, selectedPathways) => {
        console.log('selecting a pathway', pathwaySelection, selectedPathways);
        AppStorageHandler.storePathwaySelection(pathwaySelection,selectedPathways);
        let myIndex = pathwaySelection.key;
        pathwaySelection.propagate = false;
        this.state.apps.forEach((app, index) => {
            console.log('setting pathway sate for ',index,myIndex)
            if (index !== myIndex) {
                if (selectedPathways) {
                    console.log('selected pathways',selectedPathways)
                    this.refs['xena-go-app-' + index].setPathwayState(selectedPathways, pathwaySelection);
                }
                else {
                    console.log('MXGA pathway selection',pathwaySelection)
                    this.refs['xena-go-app-' + index].clickPathway(pathwaySelection);
                }
            }
        });
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

}

MultiXenaGoApp.propTyes = {
    pathways: PropTypes.any.isRequired,
    renderHeight: PropTypes.any,
};
