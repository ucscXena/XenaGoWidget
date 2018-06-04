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
            selectedPathway: this.props.selectedPathway,
            newGene: '',
            newGeneSet: '',
            newView: '',
        }
    }


    render() {
        let selectedPathwayState = this.props.pathwaySets.find(f => f.selected === true);
        return (
            <Grid style={{marginTop: 20}}>
                <Row>
                    {/*<Col md={3}>*/}
                        {/*<Chip>Views</Chip>*/}
                    {/*</Col>*/}
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
                    {/*<Col md={2}>*/}
                        {/*<Input type='text' label='New View' name='newView' value={this.state.newView}*/}
                               {/*onChange={(newView) => this.setState({newView: newView})}*/}
                               {/*maxLength={16}/>*/}
                    {/*</Col>*/}
                    {/*<Col md={1}>*/}
                        {/*<Button style={{marginTop: 20}} raised primary*/}
                                {/*onClick={() => this.handleAddNewView(this.state.newView)}><FaPlusCircle/></Button>*/}
                    {/*</Col>*/}
                    <Col md={5}>
                        <Input type='text' label='New Gene Set' name='newGeneSet' value={this.state.newGeneSet}
                               onChange={(newGeneSet) => this.setState({newGeneSet: newGeneSet})}
                               maxLength={16}/>
                    </Col>
                    <Col md={1}>
                        <Button style={{marginTop: 20}} onClick={() => this.handleAddNewGeneSet(this.state.newGeneSet)}
                                raised
                                primary><FaPlusCircle/></Button>
                    </Col>
                    <Col md={2}>
                        <Input type='text' label='New Gene' name='newGene' value={this.state.newGene} maxLength={16}
                               onChange={(newGene) => this.setState({newGene: newGene})}
                        />
                    </Col>
                    <Col md={1}>
                        <Button style={{marginTop: 20}} raised primary
                                onClick={() => this.handleAddNewGene(this.state.selectedPathway,this.state.newGene)}><FaPlusCircle/></Button>
                    </Col>
                </Row>
                <Row>
                    {/*<Col md={3}>*/}
                        {/*<PathwaySetsView pathwaySets={this.props.pathwaySets}/>*/}
                    {/*</Col>*/}
                    <Col md={6}>
                        <PathwayView removePathwayHandler={this.removePathway}
                                     clickPathwayHandler={this.selectedPathway}
                                     selectedPathwaySet={selectedPathwayState}/>
                    </Col>
                    <Col md={3}>
                        {this.state.selectedPathway &&
                        <h3>
                            {this.state.selectedPathway.golabel}

                            {this.state.selectedPathway.goid &&
                            <div>({this.state.selectedPathway.goid})</div>
                            }
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

    selectedPathway = (selectedPathway) => {
        // get genes for selected pathway
        this.setState({
            selectedPathway: selectedPathway
        })
    };

    handleAddNewView(newView) {
        console.log('adding new view: ' + JSON.stringify(newView))
    }

    handleAddNewGeneSet(newGeneSet) {
        this.props.addGeneSetHandler(newGeneSet);
        //
        this.setState({
            newGeneSet:''
        })
    }

    handleAddNewGene(newGeneSet,newGene) {
        console.log('adding new gene : ',newGeneSet,newGene)
        this.props.addGeneHandler(newGeneSet,newGene);

        this.setState({
            newGene:''
        })
    }
}

PathwayEditor.propTypes = {
    addGeneSetHandler: PropTypes.any,
    addGeneHandler: PropTypes.any,
    removePathwayHandler: PropTypes.any,
    removeGeneHandler: PropTypes.any,
};
