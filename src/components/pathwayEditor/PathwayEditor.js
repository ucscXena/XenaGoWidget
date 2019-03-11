import React from 'react'
import PureComponent from "../PureComponent";
import PathwayView from "./PathwayView";
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import {BrowseButton} from "react-toolbox/lib/button";
import {Chip} from 'react-toolbox/lib/chip';
import GeneView from "./GeneView";
import PropTypes from 'prop-types';
import FaPlusCircle from 'react-icons/lib/fa/plus-circle';
import FaCloudUpload from 'react-icons/lib/fa/cloud-upload';
import FaCloudDownload from 'react-icons/lib/fa/cloud-download';
import FaRefresh from 'react-icons/lib/fa/refresh';
import FaClose from 'react-icons/lib/fa/close';
import Input from 'react-toolbox/lib/input';
import Autocomplete from 'react-toolbox/lib/autocomplete';

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {sparseDataMatchPartialField, refGene} = xenaQuery;

export default class PathwayEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedPathway: this.props.selectedPathway,
            newGene: [],
            newGeneSet: '',
            newView: '',
            geneOptions: [],
            geneQuery: '',
            reference: refGene['hg38'],
            limit: 25,
            selectedPathwayState: null,
        }
    }

    handleChange = e => {
        let file = e.target.files[0];
        let {uploadHandler} = this.props;

        let result = {};
        let fr = new FileReader();
        fr.onload = function (e) {
            result = JSON.parse(e.target.result);
            uploadHandler(result);
        };

        fr.readAsText(file);
    };

    highlightGenes = (genes) => {
        // we can reset the state then
        // TODO: provide a "higlight view as state to pathway view"
        if (genes && this.state.selectedPathwayState) {
            let newSelectedPathwayState = JSON.parse(JSON.stringify(this.state.selectedPathwayState))
            newSelectedPathwayState.pathway = newSelectedPathwayState.pathway.map(p => {
                p.highlight = p.gene.indexOf(genes) >= 0;
                return p;
            });
            this.setState({
                selectedPathwayState: newSelectedPathwayState
            });
        }
    };

    findPathwayStateIfEmpty() {
        if (this.state.selectedPathwayState) return;
        let pathwaySet = this.props.pathwaySets.find(f => f.selected === true);
        this.setState({
            selectedPathwayState: pathwaySet,
        });
    }

    componentDidMount() {
        this.findPathwayStateIfEmpty();
    }

    componentDidUpdate() {
        this.findPathwayStateIfEmpty();
    }

    render() {
        let selectedPathwayState = this.props.pathwaySets.find(f => f.selected === true);
        return (
            <Grid style={{marginTop: 20}}>
                <Row>
                    <Col md={6}>
                        <Button onClick={() => this.downloadView()}>
                            Current GeneSet <FaCloudDownload/>
                        </Button>
                        <BrowseButton label="Load GeneSet (json)&nbsp;"
                                      onChange={this.handleChange}
                        >
                            <FaCloudUpload/>
                        </BrowseButton>
                        <Button  onClick={() => this.props.resetHandler()}>
                            Reset <FaRefresh/>
                        </Button>
                        <Button onClick={() => this.props.closeHandler()} raised primary>
                            Done <FaClose/>
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col md={7}>
                        <Chip>Gene Sets</Chip>
                    </Col>
                    <Col md={3}>
                        <Chip>Genes</Chip>
                    </Col>
                </Row>
                <Row>
                    <Col md={5}>
                        <Input type='text' label='New Gene Set' name='newGeneSet' value={this.state.newGeneSet}
                               onChange={(newGeneSet) => this.setState({newGeneSet: newGeneSet})}
                               maxLength={16}/>
                    </Col>
                    <Col md={2}>
                        {this.state.newGeneSet &&
                        <Button style={{marginTop: 20}} onClick={() => this.handleAddNewGeneSet(this.state.newGeneSet)}
                                raised
                                primary><FaPlusCircle/></Button>
                        }
                    </Col>
                    {this.state.selectedPathway &&
                    <Col md={2}>
                        <Autocomplete label='New Gene' source={this.state.geneOptions} value={this.state.newGene}
                                      onQueryChange={(geneQuery) => this.queryNewGenes(geneQuery)}
                                      onChange={(newGene) => {
                                          this.setState({newGene: newGene})
                                      }}
                                      disabled={this.state.newGene.length > 0}
                        />
                    </Col>
                    }
                    {this.state.selectedPathway &&
                    <Col md={1}>
                        {this.state.newGene && this.state.newGene.length === 1 &&
                        <Button style={{marginTop: 20}} raised primary
                                onClick={() => this.handleAddNewGene(this.state.selectedPathway, this.state.newGene)}><FaPlusCircle/></Button>
                        }
                    </Col>
                    }
                </Row>
                <Row>
                    <Col md={7}>
                        <PathwayView removePathwayHandler={this.removePathway}
                                     clickPathwayHandler={this.selectedPathway}
                                     selectedPathwaySet={selectedPathwayState}
                        />
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

    handleAddNewGeneSet(newGeneSet) {
        this.props.addGeneSetHandler(newGeneSet);
        //
        this.setState({
            newGeneSet: ''
        })
    }

    handleAddNewGene(newGeneSet, newGene) {
        newGene.map(g => {
            this.props.addGeneHandler(newGeneSet, g);
        });

        this.setState({
            newGene: []
        })
    }

    queryNewGenes(geneQuery) {
        let {reference: {host, name}, limit} = this.state;
        if (geneQuery.trim().length === 0) {
            this.setState({
                geneOptions: []
            });
            return;
        }
        let subscriber = sparseDataMatchPartialField(host, 'name2', name, geneQuery, limit);
        subscriber.subscribe(matches => {
                this.setState({
                    geneOptions: matches
                })
            }
        )
    }

    downloadView() {
        let selectedPathwayState = this.props.pathwaySets.find(f => f.selected === true);
        let exportObj = selectedPathwayState.pathway;
        let now = new Date();
        let dateString = now.toLocaleDateString() + '-' + now.toLocaleTimeString();
        let exportName = 'xenaGoView-' + dateString;
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

}

PathwayEditor.propTypes = {
    addGeneSetHandler: PropTypes.any,
    addGeneHandler: PropTypes.any,
    removePathwayHandler: PropTypes.any,
    removeGeneHandler: PropTypes.any,
    uploadHandler: PropTypes.any,
    resetHandler: PropTypes.any,
    closeHandler: PropTypes.any,
};
