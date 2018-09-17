import React from 'react'
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import {sum} from 'underscore';
import BaseStyle from '../../src/base.css';
import {Avatar, Chip, Button, AppBar, Link, Navigation, BrowseButton} from "react-toolbox";
import {Checkbox, Switch, IconMenu, MenuItem, MenuDivider} from "react-toolbox";
import DefaultPathWays from "../data/tgac";
import MultiXenaGoApp from "./MultiXenaGoApp";
import PathwayEditor from "./pathwayEditor/PathwayEditor";
import {AppStorageHandler} from "./AppStorageHandler";
import NavigationBar from "./NavigationBar";


const EXPAND_HEIGHT = 800;
const COMPACT_HEIGHT = 500;
const COMPACT_VIEW_DEFAULT = false;

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {


    constructor(props) {
        super(props);
        console.log(this.state)
        let renderHeight = COMPACT_VIEW_DEFAULT ? COMPACT_HEIGHT : EXPAND_HEIGHT;
        this.state = {
            view: 'xena',
            // view: 'pathways',
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: AppStorageHandler.getPathway(),
                    selected: true
                }
            ],
            cohortCount: 2,
            compactView: COMPACT_VIEW_DEFAULT,
            renderHeight: renderHeight,
        };
        console.log(this.state)
    }

    loadSelectedState() {
        console.log('loading state', this.state)
        let pathways = this.getActiveApp().pathway;
        let apps = AppStorageHandler.getAppData(pathways, this.state.renderHeight);
        this.setState({
            apps: apps
        })
        console.log('LOADED state', this.state, apps)
        // let myIndex = 0;
        // let refLoaded = this.refs['xena-go-app-' + myIndex];
        // if (refLoaded) {
        //     let selection = AppStorageHandler.getPathwaySelection();
        //     if(selection.selectedPathways){
        //         for(let index = 0 ; index < this.state.apps.length ; index++){
        //             let ref = this.refs['xena-go-app-' + index];
        //             ref.setPathwayState(selection.selectedPathways,selection);
        //         }
        //     }
        //     else{
        //         refLoaded.clickPathway(selection);
        //     }
        // }
    }

    handleUpload = (file) => {
        AppStorageHandler.storePathway(file);
        this.setState({
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: file,
                    selected: true
                }
            ],
        })
    };

    handleReset = () => {
        AppStorageHandler.storePathway(DefaultPathWays);
        this.setState({
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: DefaultPathWays,
                    selected: true
                }
            ],
        })
    };

    addGeneSet = (selectedPathway) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));
        let selectedPathwaySet = allSets.find(f => f.selected === true);

        let newGeneSetObject = {
            goid: '',
            golabel: selectedPathway,
            gene: []
        };
        selectedPathwaySet.pathway.unshift(newGeneSetObject);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
            selectedPathway: selectedPathwaySet,
        });
    };

    addGene = (selectedPathway, selectedGene) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));

        // get geneset to alter
        let selectedPathwaySet = allSets.find(f => f.selected === true);

        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathway.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathway.find(p => selectedPathway.golabel === p.golabel);

        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene.unshift(selectedGene);

        // add to the existing index
        selectedPathwaySet.pathway.splice(pathwayIndex, 0, newSelectedPathway);
        allSets = allSets.filter(f => (!f || f.selected === false));
        allSets.push(selectedPathwaySet);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
        });

        this.refs['pathway-editor'].selectedPathway(newSelectedPathway);
    };

    removeGene = (selectedPathway, selectedGene) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));

        // get geneset to alter
        let selectedPathwaySet = allSets.find(f => f.selected === true);

        // get pathway to filter
        let pathwayIndex = selectedPathwaySet.pathway.findIndex(p => selectedPathway.golabel === p.golabel);
        let newSelectedPathway = selectedPathwaySet.pathway.find(p => selectedPathway.golabel === p.golabel);
        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel);

        // remove gene
        newSelectedPathway.gene = newSelectedPathway.gene.filter(g => g !== selectedGene);

        // add to the existing index

        selectedPathwaySet.pathway.splice(pathwayIndex, 0, newSelectedPathway);
        allSets = allSets.filter(f => (!f || f.selected === false));
        allSets.push(selectedPathwaySet);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
        });

        this.refs['pathway-editor'].selectedPathway(newSelectedPathway);
    };

    removePathway = (selectedPathway) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));
        let selectedPathwaySet = allSets.find(f => f.selected === true);
        allSets = allSets.filter(f => (!f || f.selected === false));
        // removes selected pathway
        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel)
        allSets.push(selectedPathwaySet);

        AppStorageHandler.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
            selectedPathway: undefined,
        });
    };

    componentDidMount() {
        this.loadSelectedState();
        this.makeCompact(true);
    }

    getActiveApp() {
        return this.state.pathwaySets.find(ps => ps.selected);
    }

    showPathways = () => {
        this.setState({
            view: 'pathways'
        })
    };

    showXena = () => {
        this.setState({
            view: 'xena'
        })
    };


    makeCompact = (value) => {
        this.setState({
            compactView: value,
            renderHeight: value ? COMPACT_HEIGHT : EXPAND_HEIGHT,
        })
    };

    pathwayHover = (pathwayHover) => {
        let myIndex = pathwayHover.key;
        console.log('hovering a pathway', pathwayHover,myIndex);
        pathwayHover.propagate = false;
        this.state.apps.forEach((app, index) => {
            console.log('setting pathway HOVER for ',index,myIndex)
            if (index !== myIndex) {
                console.log('DOING HOVER from ',myIndex,' to ',index,pathwayHover.hoveredPathways)
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

    render() {
        let pathways = this.getActiveApp().pathway;
        let localPathways = AppStorageHandler.getPathway();

        console.log(pathways, ' vs ', localPathways);
        console.log('this.stateapps', this.state.apps)

        return (
            <div>

                <NavigationBar pathways={localPathways}
                               makeCompact={this.makeCompact}
                               showPathways={this.showPathways}
                               showXena={this.showXena}
                               compactView={this.state.compactView}
                               view={this.state.view}
                />

                {this.state.view === 'xena' && this.state.apps &&
                <div>
                    {/*<MultiXenaGoApp pathways={this.getActiveApp().pathway} ref='multiXenaGoApp'*/}
                    {/*renderHeight={this.state.renderHeight}*/}
                    {/*/>*/}
                    <XenaGoViewer appData={this.state.apps[0]}
                                  pathwaySelect={this.pathwaySelect}
                                  pathwayHover={this.pathwayHover}
                                  ref={'xena-go-app-0'}
                                  renderHeight={this.state.renderHeight}
                                  renderOffset={0}
                                  pathways={pathways}
                    />
                    <XenaGoViewer appData={this.state.apps[1]}
                                  pathwaySelect={this.pathwaySelect}
                                  pathwayHover={this.pathwayHover}
                                  ref={'xena-go-app-1'}
                                  renderHeight={this.state.renderHeight}
                                  renderOffset={(this.state.renderHeight + 5)}
                                  pathways={pathways}
                    />
                </div>
                }
                {this.state.view === 'pathways' &&
                <PathwayEditor ref='pathway-editor' pathwaySets={this.state.pathwaySets}
                               selectedPathway={this.state.selectedPathway}
                               removeGeneHandler={this.removeGene}
                               removePathwayHandler={this.removePathway}
                               addGeneHandler={this.addGene}
                               addGeneSetHandler={this.addGeneSet}
                               uploadHandler={this.handleUpload}
                               resetHandler={this.handleReset}
                />
                }
            </div>);
    }

}
