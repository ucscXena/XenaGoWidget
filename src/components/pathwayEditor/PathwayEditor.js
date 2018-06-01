import React from 'react'
import PureComponent from "../PureComponent";
import PathwayView from "./PathwayView";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import {Chip} from 'react-toolbox/lib/chip';
import GeneView from "./GeneView";
import PropTypes from 'prop-types';
import FaPlusCircle from 'react-icons/lib/fa/plus-circle';
import FaCloudUpload from 'react-icons/lib/fa/cloud-upload';
import FaCloudDownload from 'react-icons/lib/fa/cloud-download';
import FaTrash from 'react-icons/lib/fa/trash';
import Input from 'react-toolbox/lib/input';
import PathwaySetsView from "./PathwaySetsView";


export default class PathwayEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedPathway: undefined,
            // pathwaySets: this.props.pathwaySets
        }
    }


    render() {
        let selectedPathwayState = this.props.pathwaySets.find(f => f.selected === true);
        return (
            <Grid style={{marginTop: 20}}>
                <Row>
                    <Col md={3}>
                        <Chip>Views</Chip>
                    </Col>
                    <Col md={6}>
                        <Chip>Gene Sets</Chip>
                    </Col>
                    <Col md={3}>
                        <Chip>Genes</Chip>
                    </Col>
                </Row>
                {/*<Row>*/}
                    {/*<Col md={3}>*/}
                        {/*<Button raised primary><FaCloudUpload/></Button>*/}
                        {/*<Button raised primary><FaCloudDownload/></Button>*/}
                    {/*</Col>*/}
                    {/*<Col md={6}>*/}
                        {/*<Button raised primary><FaCloudUpload/></Button>*/}
                        {/*<Button raised primary><FaCloudDownload/></Button>*/}
                    {/*</Col>*/}
                    {/*<Col md={3}>*/}
                        {/*<Button raised primary><FaCloudUpload/></Button>*/}
                        {/*<Button raised primary><FaCloudDownload/></Button>*/}
                    {/*</Col>*/}
                {/*</Row>*/}
                <Row>
                    <Col md={2}>
                        <Input type='text' label='New View' name='newView' value={this.state.name} maxLength={16}/>
                    </Col>
                    <Col md={1}>
                        <Button style={{marginTop:20}} raised primary onClick={() => this.handleAddNewView('newView')}><FaPlusCircle/></Button>
                    </Col>
                    <Col md={5}>
                        <Input type='text' label='New Gene Set' name='newGeneSet' value={this.state.name}
                               maxLength={16}/>
                    </Col>
                    <Col md={1}>
                        {/*<Button onClick={() => this.addPathway()} raised primary><FaPlusCircle/></Button>*/}
                        <Button style={{marginTop:20}} onClick={() => this.handleAddNewGeneSet('newGeneSet')} raised
                                primary><FaPlusCircle/></Button>
                    </Col>
                    <Col md={2}>
                        <Input type='text' label='New Gene' name='newGene' value={this.state.name} maxLength={16}/>
                    </Col>
                    <Col md={1}>
                        <Button style={{marginTop:20}} raised primary onClick={() => this.handleAddNewGene('newGene')}><FaPlusCircle/></Button>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <PathwaySetsView pathwaySets={this.props.pathwaySets}/>
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
                        <GeneView selectedPathway={this.state.selectedPathway} removeGeneHandler={this.removeGene}/>
                    </Col>
                </Row>
            </Grid>
        );
    }

    removeGene = (selectedPathway, selectedGene) => {
        this.props.removeGeneHandler(selectedPathway, selectedGene);
    };

    removePathway = (selectedPathway) => {
        this.props.removePathwayHandler(selectedPathway);

        this.setState({
            selectedPathway: undefined,
        });
    };

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

    handleAddNewView(newView) {
        alert('adding new view: ' + JSON.stringify(newView))
    }

    handleAddNewGeneSet(newGeneSet) {
        alert('adding new gene set: ' + JSON.stringify(newGeneSet))
    }

    handleAddNewGene(newGene) {
        alert('adding new gene : ' + JSON.stringify(newGene))
    }
}

PathwayEditor.propTypes = {
    removePathwayHandler: PropTypes.any,
    removeGeneHandler: PropTypes.any,
};
