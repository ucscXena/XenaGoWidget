import React from 'react'
import PureComponent from "../PureComponent";
import PathwayView from "./PathwayView";
import DefaultPathWays from "../../../tests/data/tgac";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';


export default class PathwayEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            pathways: [{name: "Default", pathways: DefaultPathWays, selected: true}]
        }
    }


    getLabels() {
        return this.state.pathways.map((pathway, index) => {
            return (
                <li key={pathway.name}>{pathway.name}
                <Button assert raised>(X) Remove</Button>
                </li>
            )
        });
    }

    render() {
        return (
            <Grid>
                <Row>
                    <Col md={2}>
                        <ul>
                            {this.getLabels()}
                        </ul>
                        <Button raised primary>(+) New Pathway Set</Button>
                    </Col>
                    <Col md={4}>
                        <Button accent primay>(+) Add Pathway</Button>
                        <PathwayView selectedPathway={this.getSelectedPathway()}/>
                    </Col>
                </Row>
            </Grid>
        );
    }


    getSelectedPathway() {
        return this.state.pathways.find(f => f.selected === true)
    }
}
