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
import update from 'immutability-helper';
import DefaultPathWays from '../../data/genesets/tgac';

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {sparseDataMatchPartialField, refGene} = xenaQuery;
const REFERENCE = refGene['hg38'];

export default class PathwayEditor extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      newGene: [],
      newGeneSet: '',
      newView: '',
      geneOptions: [],
      geneQuery: '',
      limit: 25,
      selectedPathwayState: null,
      pathwaySet: props.pathwaySet,
    };
  }

  //// TODO: this is not good
  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(props) {
    this.setState({ selectedPathway: props.selectedPathway } );
  }

  handleChange = e => {
    let file = e.target.files[0];
    let result = {};
    let fr = new FileReader();
    let that = this ; // scope hack
    fr.onload = function (e) {
      result = JSON.parse(e.target.result);
      const newState = {
        name: 'Default Pathway',
        pathways: result,
        selected: true
      };
      that.setState({
        pathwaySet: newState
      });
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
      const pathwayIndex = this.state.pathwaySet.pathways.findIndex(p => selectedPathway.golabel === p.golabel);
      const geneIndex = this.state.pathwaySet.pathways[pathwayIndex].gene.findIndex(g => g !== selectedGene);
      let newSelectedPathway = update(this.state.pathwaySet.pathways[pathwayIndex],{
        gene: { $splice: [[geneIndex,1]]}
      });
      let selectedPathwaySet = update(this.state.pathwaySet, {
        pathways:  { [pathwayIndex]: {$set:newSelectedPathway }}
      });
      this.setState({
        pathwaySet: selectedPathwaySet,
      });
    };

    removeGeneSet = (selectedPathway) => {
      const pathwayIndex  = this.state.pathwaySet.pathways.findIndex(p => selectedPathway.golabel === p.golabel);
      const selectedPathwaySet = update(this.state.pathwaySet, {
        pathways: { $splice: [[pathwayIndex,1]] }
      });
      this.setState({
        pathwaySet: selectedPathwaySet,
      });
    };

    selectedPathway = (selectedPathway) => {
      // get genes for selected pathway
      this.setState({
        selectedPathway: selectedPathway
      });
    };

    handleAddNewGeneSet(selectedPathway) {
      const selectedPathwaySet = update(this.state.pathwaySet, {
        pathways: { $unshift: [{
          goid: '',
          golabel: selectedPathway,
          gene: [],
        }] }
      });
      this.setState({
        pathwaySet: selectedPathwaySet,
        newGeneSet: ''
      });
    }

    handleAddNewGene(selectedGeneSet, newGene) {
      newGene.map(g => {
        // get pathway to filter
        let pathwayIndex = this.state.pathwaySet.pathways.findIndex(p => selectedGeneSet.golabel === p.golabel);
        let newSelectedPathway = update(this.state.pathwaySet.pathways[pathwayIndex],{
          gene: { $unshift: [g]}
        });
        const selectedPathwaySet = update(this.state.pathwaySet, {
          pathways:  { [pathwayIndex]: {$set:newSelectedPathway }}
        });
        this.setState({
          newGene: [],
          pathwaySet: selectedPathwaySet,
        });
      });

    }

    queryNewGenes(geneQuery) {
      if (geneQuery.trim().length === 0) {
        this.setState({
          geneOptions: []
        });
        return;
      }
      let subscriber = sparseDataMatchPartialField(REFERENCE.host, 'name2', REFERENCE.name, geneQuery, REFERENCE.limit);
      subscriber.subscribe(matches => {
        this.setState({
          geneOptions: matches
        });
      }
      );
    }

    // set the current model to existing one
    onReset(){
      const defaultPathwaySet =  {
        name: 'Default Pathway',
        pathways: DefaultPathWays,
        selected: true
      };
      this.setState({
        pathwaySet: defaultPathwaySet
      });
    }

    // push the current model up
    // then call close
    onClose(){
      this.props.onClose(this.state.pathwaySet);
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
              <Button  onClick={() => this.onReset()}>
              Reset <FaRefresh/>
              </Button>
              <Button onClick={() => this.onClose()} primary raised>
              Save and Close <FaClose/>
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
                removePathwayHandler={this.removeGeneSet}
                selectedPathwaySet={this.state.pathwaySet}
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
  onClose: PropTypes.any,
  pathwaySet: PropTypes.any,
  selectedPathway: PropTypes.any,
};
