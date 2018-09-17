import React from 'react'
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
// import {Switch, Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";
import {sum} from 'underscore';
import BaseStyle from '../../src/base.css';
import {AppStorageHandler} from "./AppStorageHandler";
import {Avatar, Chip, Button, AppBar, Link, Navigation, BrowseButton} from "react-toolbox";
import {Checkbox, Switch, IconMenu, MenuItem, MenuDivider} from "react-toolbox";
import DefaultPathWays from "../../tests/data/tgac";
import MultiXenaGoApp from "./MultiXenaGoApp";
import PathwayEditor from "./pathwayEditor/PathwayEditor";

const GithubIcon = () => (
    <svg viewBox="0 0 284 277" style={{height: 30}}>
        <g stroke='black' strokeWidth='4' fill='white'>
            <path
                d="M141.888675,0.0234927555 C63.5359948,0.0234927555 0,63.5477395 0,141.912168 C0,204.6023 40.6554239,257.788232 97.0321356,276.549924 C104.12328,277.86336 106.726656,273.471926 106.726656,269.724287 C106.726656,266.340838 106.595077,255.16371 106.533987,243.307542 C67.0604204,251.890693 58.7310279,226.56652 58.7310279,226.56652 C52.2766299,210.166193 42.9768456,205.805304 42.9768456,205.805304 C30.1032937,196.998939 43.9472374,197.17986 43.9472374,197.17986 C58.1953153,198.180797 65.6976425,211.801527 65.6976425,211.801527 C78.35268,233.493192 98.8906827,227.222064 106.987463,223.596605 C108.260955,214.426049 111.938106,208.166669 115.995895,204.623447 C84.4804813,201.035582 51.3508808,188.869264 51.3508808,134.501475 C51.3508808,119.01045 56.8936274,106.353063 65.9701981,96.4165325 C64.4969882,92.842765 59.6403297,78.411417 67.3447241,58.8673023 C67.3447241,58.8673023 79.2596322,55.0538738 106.374213,73.4114319 C117.692318,70.2676443 129.83044,68.6910512 141.888675,68.63701 C153.94691,68.6910512 166.09443,70.2676443 177.433682,73.4114319 C204.515368,55.0538738 216.413829,58.8673023 216.413829,58.8673023 C224.13702,78.411417 219.278012,92.842765 217.804802,96.4165325 C226.902519,106.353063 232.407672,119.01045 232.407672,134.501475 C232.407672,188.998493 199.214632,200.997988 167.619331,204.510665 C172.708602,208.913848 177.243363,217.54869 177.243363,230.786433 C177.243363,249.771339 177.078889,265.050898 177.078889,269.724287 C177.078889,273.500121 179.632923,277.92445 186.825101,276.531127 C243.171268,257.748288 283.775,204.581154 283.775,141.912168 C283.775,63.5477395 220.248404,0.0234927555 141.888675,0.0234927555"/>
        </g>
    </svg>
);

const LOCAL_STORAGE_STRING = "default-xena-go-key";
const EXPAND_HEIGHT = 800 ;
const COMPACT_HEIGHT = 500 ;
const COMPACT_VIEW_DEFAULT = false ;

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            view: 'xena',
            // view: 'pathways',
            pathwaySets: [
                {
                    name: 'Default Pathway',
                    pathway: XenaGeneSetApp.getPathway(),
                    selected: true
                }
            ],
            cohortCount: 1,
            compactView: COMPACT_VIEW_DEFAULT,
            renderHeight: COMPACT_VIEW_DEFAULT ? COMPACT_HEIGHT : EXPAND_HEIGHT,
        }
    }

    static storePathway(pathway) {
        if (pathway) {
            localStorage.setItem(LOCAL_STORAGE_STRING, JSON.stringify(pathway));
        }
    }

    static getPathway() {
        let storedPathway = JSON.parse(localStorage.getItem(LOCAL_STORAGE_STRING));
        return storedPathway ? storedPathway : DefaultPathWays;
    }


    handleUpload = (file) => {
        Demo.storePathway(file);
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
        Demo.storePathway(DefaultPathWays);
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
        // allSets = allSets.filter(f => (!f || f.selected === false));

        let newGeneSetObject = {
            goid: '',
            golabel: selectedPathway,
            gene: []
        };
        selectedPathwaySet.pathway.unshift(newGeneSetObject);
        // allSets.push(selectedPathwaySet);

        Demo.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
            selectedPathway: selectedPathwaySet,
        });
    };

    // TODO
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

        Demo.storePathway(selectedPathwaySet.pathway);
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

        Demo.storePathway(selectedPathwaySet.pathway);
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

        Demo.storePathway(selectedPathwaySet.pathway);
        this.setState({
            pathwaySets: allSets,
            selectedPathway: undefined,
        });
    };

    componentDidMount(){
        let numCohorts = this.refs['multiXenaGoApp'].cohortCount();
        if(numCohorts===2){
            this.makeCompact(true);
            this.setState({
                cohortCount:numCohorts
            })
        }
        else{
            this.makeCompact(false);
            this.setState({
                cohortCount:numCohorts
            })
        }
    }

    getActiveApp() {
        return this.state.pathwaySets.find(ps => ps.selected);
    }

    showPathways() {
        this.setState({
            view: 'pathways'
        })
    }

    showXena() {
        this.setState({
            view: 'xena'
        })
    }

    // just duplicate the last state
    duplicateCohort() {
        this.makeCompact(true);
        this.refs['multiXenaGoApp'].duplicateCohort();
        this.setState({
            cohortCount: 2
        });
    };

    removeCohort() {
        this.makeCompact(false);
        this.refs['multiXenaGoApp'].removeCohort();
        this.setState({
            cohortCount:1
        })
        ;
    }

    makeCompact(value) {
        this.setState({
            compactView: value,
            renderHeight: value ? COMPACT_HEIGHT : EXPAND_HEIGHT,
        })
    }

    render(){

        return (
            <div>

            <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
                  rel="stylesheet"/>
            <AppBar title='Xena Geneset Widget Demo' >
                <IconMenu icon='menu' position='topLeft' iconRipple className={BaseStyle.menu}>
                    <MenuItem value='settings' icon='vertical_align_center' caption='Compact'
                              onClick={() => this.makeCompact(true)}
                              disabled={this.state.compactView}/>
                    <MenuItem value='settings' icon='import_export' caption='Expand'
                              onClick={() => this.makeCompact(false)}
                              disabled={!this.state.compactView}/>
                    <MenuDivider/>
                    <MenuItem value='settings' icon='add' caption='Add Cohort'
                              onClick={() => this.duplicateCohort()}
                              disabled={this.state.cohortCount === 2}/>
                    <MenuItem value='settings' icon='remove' caption='Remove Cohort'
                              onClick={() => this.removeCohort()}
                              disabled={this.state.cohortCount === 1}/>
                </IconMenu>
                <Navigation type='vertical'>
                    {this.state.view === 'xena' &&
                    <div style={{display: 'inline'}}>
                        <Button raised primary>Xena</Button>
                        <Button raised onClick={() => this.showPathways()}>Pathways</Button>
                    </div>}
                    {this.state.view === 'pathways' &&
                    <div style={{display: 'inline'}}>
                        <Button raised onClick={() => this.showXena()}>Xena</Button>
                        <Button raised primary>Pathways</Button>
                    </div>}

                    <a href='https://github.com/ucscXena/XenaGoWidget' style={{marginLeft: 20}}>
                        <GithubIcon/>
                    </a>
                </Navigation>
            </AppBar>
            {this.state.view === 'xena' &&
            <MultiXenaGoApp pathways={this.getActiveApp().pathway} ref='multiXenaGoApp'
                            renderHeight={this.state.renderHeight}
            />
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
