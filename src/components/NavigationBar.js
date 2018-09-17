
import React from 'react'
import {render} from 'react-dom'
import {Avatar, Chip, Button, AppBar, Link, Navigation, BrowseButton} from "react-toolbox";
import {Checkbox, Switch, IconMenu, MenuItem, MenuDivider} from "react-toolbox";

import PureComponent from "../../src/components/PureComponent";
import * as BaseStyle from "react-toolbox";

export default class NavigationBar extends PureComponent {

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

    render() {
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

        </div>)
    }

}
