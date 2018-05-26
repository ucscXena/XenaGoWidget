import React from 'react'
import PureComponent from "../PureComponent";
import PathwayView from "./PathwayView";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import {Chip} from 'react-toolbox/lib/chip';
import GeneView from "./GeneView";
import PropTypes from 'prop-types';
import FaTrash from 'react-icons/lib/fa/trash';
import FaPlusCircle from 'react-icons/lib/fa/plus-circle';
import FaCloudUpload from 'react-icons/lib/fa/cloud-upload';
import FaCloudDownload from 'react-icons/lib/fa/cloud-download';


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
                    <Button><FaTrash/></Button>
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
                        <Chip>Pathway Set</Chip>
                    </Col>
                    <Col md={6}>
                        <Chip>Pathways</Chip>
                    </Col>
                    <Col md={3}>
                        <Chip>Genes</Chip>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <Button raised primary><FaPlusCircle/></Button>
                        <Button raised primary><FaCloudUpload/></Button>
                        <Button raised primary><FaCloudDownload/></Button>
                    </Col>
                    <Col md={6}>
                        <Button onClick={() => this.addPathway()} raised primary><FaPlusCircle/></Button>
                        <Button raised primary><FaCloudUpload/></Button>
                        <Button raised primary><FaCloudDownload/></Button>
                    </Col>
                    <Col md={3}>
                        <Button raised primary><FaPlusCircle/></Button>
                        <Button raised primary><FaCloudUpload/></Button>
                        <Button raised primary><FaCloudDownload/></Button>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        {this.getLabels()}
                    </Col>
                    <Col md={6}>
                        <PathwayView removePathwayHandler={this.removePathway}
                                     clickPathwayHandler={this.selectedPathway}
                                     selectedPathwaySet={selectedPathwayState}/>
                    </Col>
                    <Col md={3}>
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
        let selectedPathwaySet = allSets.find(f => f.selected === true);
        allSets = allSets.filter(f => (!f || f.selected === false));
        selectedPathwaySet.pathway = selectedPathwaySet.pathway.filter(p => selectedPathway.golabel !== p.golabel)
        allSets.push(selectedPathwaySet);


        this.setState({
            selectedPathway: undefined,
            pathwaySets: allSets,
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
