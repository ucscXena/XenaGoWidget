import React from 'react'
import PureComponent from "../PureComponent";
import PathwayView from "./PathwayView";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import GeneView from "./GeneView";
import PropTypes from 'prop-types';


export default class PathwayEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            pathwaySets: this.props.pathwaySets
        }
    }


    getLabels() {
        return this.state.pathwaySets.map((pathway, index) => {
            return (
                <Row key={pathway.name}>
                    <Button>{pathway.name}</Button>
                    <Button>(X) Remove</Button>
                </Row>
            )
        });
    }

    render() {
        let selectedPathwayState = this.state.pathwaySets.find(f => f.selected === true);
        console.log('selected pathway state')
        console.log(selectedPathwayState)
        return (
            <Grid style={{marginTop: 20}}>
                <Row>
                    <Col md={3}>
                        <Button raised primary>(+) New Pathway Set</Button>
                        {this.getLabels()}
                    </Col>
                    <Col md={6}>
                        <Button onClick={() => this.addPathway()} raised primary>(+) Add Pathway</Button>
                        <PathwayView removePathwayHandler={this.removePathway}
                                     clickPathwayHandler={this.selectedPathway}
                                     selectedPathwaySet={selectedPathwayState}/>
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

    removePathway = (selectedPathway) => {
        let allSets = JSON.parse(JSON.stringify(this.state.pathwaySets));
        let selectedPathwaySet = allSets.find( f => f.selected === true );
        allSets = allSets.filter( f => (!f || f.selected === false ));
        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter( p => selectedPathway.golabel !== p.golabel )
        allSets.push(selectedPathwaySet);


        this.setState({
            selectedPathway:undefined,
            pathwaySets:allSets,
        });
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

}

PathwayEditor.propTypes = {
    removePathwayHandler: PropTypes.any,
};
