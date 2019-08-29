import React from 'react';
import PureComponent from '../PureComponent';
import PathwayView from './PathwayView';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import {BrowseButton} from 'react-toolbox/lib/button';
import {Chip} from 'react-toolbox/lib/chip';
import GeneView from './GeneView';
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
      newGene: [],
      newGeneSet: '',
      newView: '',
      geneOptions: [],
      geneQuery: '',
      reference: refGene['hg38'],
      limit: 25,
      selectedPathwayState: null,
    };
  }

  //// TODO: this is not good
  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(props) {
    this.setState({ selectedPathway: props.selectedPathway } );
  }

  handleChange = e => {
    let file = e.target.files[0];
    let {onUpload} = this.props;

    let result = {};
    let fr = new FileReader();
    fr.onload = function (e) {
      result = JSON.parse(e.target.result);
      onUpload(result);
    };

    fr.readAsText(file);
  };

  downloadView() {
    let exportObj = this.props.pathwaySet.pathways;
    let now = new Date();
    let dateString = now.toLocaleDateString() + '-' + now.toLocaleTimeString();
    let exportName = 'xenaGoView-' + dateString;
    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', exportName + '.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }


    removeGene = (selectedPathway, selectedGene) => {
      this.props.removeGeneHandler(selectedPathway, selectedGene);
    };

    removePathway = (selectedPathway) => {
      this.props.removeGeneSetHandler(selectedPathway);
    };

    selectedPathway = (selectedPathway) => {
      // get genes for selected pathway
      this.setState({
        selectedPathway: selectedPathway
      });
    };

    handleAddNewGeneSet(newGeneSet) {
      this.props.addGeneSetHandler(newGeneSet);
      //
      this.setState({
        newGeneSet: ''
      });
    }

    handleAddNewGene(selectedGeneSet, newGene) {
      newGene.map(g => {
        this.props.addGeneHandler(selectedGeneSet, g);
      });

      this.setState({
        newGene: []
      });
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
        });
      }
      );
    }


    render() {
      return (
        <Grid style={{marginTop: 20,width:900}}>
          <Row style={{marginBottom:20}}>
            <Col md={12}>
              <Button onClick={() => this.downloadView()}>
              Get GeneSet <FaCloudDownload/>
              </Button>
              <BrowseButton
                label="Load GeneSet (json)&nbsp;"
                onChange={this.handleChange}
              >
                <FaCloudUpload/>
              </BrowseButton>
              <Button  onClick={() => this.props.onReset()}>
              Reset <FaRefresh/>
              </Button>
              <Button onClick={() => this.props.onClose()} primary raised>
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
            <Col md={6}>
              <Input
                label='New Gene Set' maxLength={16} name='newGeneSet' onChange={(newGeneSet) => this.setState({newGeneSet: newGeneSet})}
                type='text'
                value={this.state.newGeneSet}
              />
              {this.state.newGeneSet &&
            <Button
              onClick={() => this.handleAddNewGeneSet(this.state.newGeneSet)} primary
              raised
              style={{marginTop: 20}}
            ><FaPlusCircle/></Button>
              }
            </Col>
            <Col md={1} />
            {this.state.selectedPathway &&
          <Col md={3}>
            <Autocomplete
              disabled={this.state.newGene.length > 0} label='New Gene' onChange={(newGene) => {
                this.setState({newGene: newGene});
              }}
              onQueryChange={(geneQuery) => this.queryNewGenes(geneQuery)}
              source={this.state.geneOptions}
              value={this.state.newGene}
            />
            {this.state.newGene && this.state.newGene.length === 1 &&
            <Button
              onClick={() => this.handleAddNewGene(this.state.selectedPathway, this.state.newGene)} primary raised
              style={{marginTop: 20}}
            >
              <FaPlusCircle/>
            </Button>
            }
          </Col>
            }
          </Row>
          <Row>
            <Col md={7}>
              <PathwayView
                clickPathwayHandler={this.selectedPathway}
                removePathwayHandler={this.removePathway}
                selectedPathwaySet={this.props.pathwaySet}
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
              <GeneView
                removeGeneHandler={this.removeGene}
                selectedPathway={this.state.selectedPathway}
              />
            </Col>
          </Row>
        </Grid>
      );
    }

}

PathwayEditor.propTypes = {
  addGeneHandler: PropTypes.any,
  addGeneSetHandler: PropTypes.any,
  onClose: PropTypes.any,
  onReset: PropTypes.any,
  onUpload: PropTypes.any,
  pathwaySet: PropTypes.any,
  removeGeneHandler: PropTypes.any,
  removeGeneSetHandler: PropTypes.any,
  selectedPathway: PropTypes.any,
};
