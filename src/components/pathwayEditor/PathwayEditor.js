import React from 'react'
import PureComponent from "../PureComponent";
import PathwayView from "./PathwayView";
import DefaultPathWays from "../../../tests/data/tgac";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import GeneView from "./GeneView";


export default class PathwayEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            pathwaySets: [{name: "Default", pathwaySets: DefaultPathWays, selected: true}]
        }
    }


    getLabels() {
        return this.state.pathwaySets.map((pathway, index) => {
            return (
                <Row key={pathway.name}>
                    <Button>{pathway.name}</Button>
                    <Button accent raised>(X) Remove</Button>
                </Row>
            )
        });
    }

    render() {
        return (
            <Grid>
                <Row>
                    <Col md={3}>
                        <Button raised primary>(+) New Pathway Set</Button>
                        {this.getLabels()}
                    </Col>
                    <Col md={6}>
                        <Button onClick={() => this.addPathway()} raised primary>(+) Add Pathway</Button>
                        <PathwayView removePathwayHandler={this.removePathway}
                                     clickPathwayHandler={this.selectedPathway}
                                     selectedPathwaySet={this.getSelectedPathwaySet()}/>
                    </Col>
                    <Col md={3}>
                        <Button raised primary>(+) Add Gene </Button>
                        {this.state.selectedPathway &&
                        <h3>
                            {this.state.selectedPathway.golabel}
                            ({this.state.selectedPathway.goid})
                        </h3>
                        }
                        <GeneView selectedPathway={this.state.selectedPathway}/>
                    </Col>
                </Row>
            </Grid>
        );
    }


    getSelectedPathwaySet() {
        return this.state.pathwaySets.find(f => f.selected === true)
    }


    addPathway() {
        alert('adding patway')
    }

    selectedPathway = (selectedPathway) => {
        // get genes for selected pathway
        console.log('ROOT selecting pathway');
        console.log(selectedPathway)

        this.setState({
            selectedPathway: selectedPathway
        })
    };

    removePathway = (selectedPathway) => {
        console.log('ROOT removed pathway ');
        console.log(selectedPathway)
    }
}
