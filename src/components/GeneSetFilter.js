import PureComponent from './PureComponent';
import React from 'react';
import BaseStyle from '../css/base.css';
import FaEdit from 'react-icons/lib/fa/edit';
import FaSortAsc from 'react-icons/lib/fa/sort-alpha-asc';
import FaSortDesc from 'react-icons/lib/fa/sort-alpha-desc';
import FaFilter from 'react-icons/lib/fa/filter';
import {Button} from 'react-toolbox/lib/button';
import PropTypes from 'prop-types';
import {
  convertPathwaysToGeneSetLabel,
  fetchPathwayActivityMeans, getPathwaysForGeneSetName, lookupGeneByName
} from '../functions/FetchFunctions';
import FaArrowCircleORight from 'react-icons/lib/fa/arrow-circle-o-right';
import FaTrashO from 'react-icons/lib/fa/trash-o';
import FaCheckSquare from 'react-icons/lib/fa/check-square';
import FaTrash from 'react-icons/lib/fa/trash';
import update from 'immutability-helper';
import {Chip, Input} from 'react-toolbox';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import FaPlusCircle from 'react-icons/lib/fa/plus-circle';
import {ButtonGroup} from 'react-bootstrap';
import FaCloudUpload from 'react-icons/lib/fa/cloud-upload';
import FaCloudDownload from 'react-icons/lib/fa/cloud-download';
import Dialog from 'react-toolbox/lib/dialog';

const VIEW_LIMIT = 200;
const CART_LIMIT = 45;

export default class GeneSetFilter extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      editGeneSet: undefined,
      name: '',
      sortOrder:'asc',
      sortBy: 'Diff',
      sortCartOrder:'asc',
      sortCartBy: 'Diff',
      geneSet: '8K',
      newGene: [],
      geneOptions: [],
      loadedPathways: [],
      selectedCohort: [props.pathwayData[0].cohort,props.pathwayData[1].cohort],
      samples: [props.pathwayData[0].samples,props.pathwayData[1].samples],
      // filteredPathways : state.pathways.slice(0,DEFAULT_LIMIT),
      filteredPathways : [],
      cartPathways : [],
      selectedGenesForGeneSet: [],
      selectedFilteredPathways : [],
      selectedCartPathways : [],
      totalPathways: 0,
      cartPathwayLimit: CART_LIMIT,
      limit: VIEW_LIMIT,
      newGeneStateName:'',
    };


    let { selectedCohort, samples } = this.state;

    const geneSetLabels = convertPathwaysToGeneSetLabel(getPathwaysForGeneSetName(this.state.geneSet));
    fetchPathwayActivityMeans(selectedCohort,samples,geneSetLabels,this.handleMeanActivityData);

  }


  componentDidUpdate() {
    this.filterByName();
  }

  handleMeanActivityData = (output) => {
    const pathways = getPathwaysForGeneSetName(this.state.geneSet);
    // let loadedPathways = JSON.parse(JSON.stringify(pathways));
    let loadedPathways = pathways.map( p => {
      p.firstGeneExpressionPathwayActivity = undefined ;
      p.secondGeneExpressionPathwayActivity = undefined ;
      return p ;
    });

    let indexMap = {};
    pathways.forEach( (p,index) => {
      indexMap[p.golabel] = index ;
    });


    for(let index in output.geneExpressionPathwayActivityA.field){
      const field = output.geneExpressionPathwayActivityA.field[index];
      const cleanField = field.indexOf(' (GO:') < 0 ? field :  field.substr(0,field.indexOf('GO:')-1).trim();
      const sourceIndex = indexMap[cleanField];
      loadedPathways[sourceIndex].firstGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityA.mean[index];
      loadedPathways[sourceIndex].secondGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityB.mean[index];
    }

    const pathwayLabels = this.props.pathways.map( p => p.golabel);
    const cartPathways = loadedPathways.filter( p =>  pathwayLabels.indexOf(p.golabel)>=0 );


    this.setState({
      loadedPathways,
      cartPathways,
    });
  };


  scoreCartPathway(p) {
    switch (this.state.sortCartBy) {
    case 'Total':
      return (p.firstGeneExpressionPathwayActivity + p.secondGeneExpressionPathwayActivity).toFixed(2);
    default:
    case 'Diff':
      return (p.firstGeneExpressionPathwayActivity - p.secondGeneExpressionPathwayActivity).toFixed(2);
    }
  }

  scorePathway(p) {
    switch (this.state.sortBy) {
    case 'Total':
      return (p.firstGeneExpressionPathwayActivity + p.secondGeneExpressionPathwayActivity).toFixed(2);
    default:
    case 'Diff':
      return (p.firstGeneExpressionPathwayActivity - p.secondGeneExpressionPathwayActivity).toFixed(2);
    }
  }

  filterByName(){
    const filteredPathways = this.state.loadedPathways
      .filter( p => ( p.golabel.toLowerCase().indexOf(this.state.name)>=0 ||  (p.goid && p.goid.toLowerCase().indexOf(this.state.name)>=0)))
      .sort( (a,b) => {
        switch(this.state.sortBy) {
        default:
          return (this.state.sortOrder === 'asc' ? 1 : -1 ) * (this.scorePathway(b)-this.scorePathway(a)) ;
        case 'Alpha':
          return (this.state.sortOrder === 'asc' ? 1 : -1 ) * a.golabel.toLowerCase().localeCompare(b.golabel.toLowerCase());
        }
      }) ;

    this.setState({
      filteredPathways: filteredPathways,
      totalPathways: filteredPathways.length
    });
  }

  getSelectedCartData(){
    // find filteredPathways from each selectedFilter
    const selectedFilteredPathways = this.state.filteredPathways
      .filter( f => this.state.selectedFilteredPathways.indexOf(f.golabel)>=0 )
      .filter( f => this.state.cartPathways.indexOf(f)<0 );
    const selectedCartData = update(this.state.cartPathways, {
      $push: selectedFilteredPathways
    });
    return selectedCartData.slice(0,this.state.cartPathwayLimit);
  }

  handleAddSelectedToCart() {
    this.setState({
      cartPathways: this.getSelectedCartData()
    });
  }


  handleNewGeneSet() {
    const newGeneSet = {
      golabel:'New Gene Set',
      gene: []
    };
    this.setState({newGeneStateName:newGeneSet.golabel,selectedEditGeneSet: newGeneSet,});
  }

  handleEditGeneSet(geneSet,geneSetList) {
    const selectedEditGeneSet = geneSetList.filter( gs => gs.golabel === geneSet);
    this.setState({editGeneSet:geneSet,selectedEditGeneSet: selectedEditGeneSet.length > 0 ? selectedEditGeneSet[0] : undefined});
  }

  handleDoneEditGeneSet() {
    const selectedGoLabel = this.state.selectedEditGeneSet.golabel;
    // find the new one we want
    const selectedEditedGeneSet = update(this.state.selectedEditGeneSet,{
      firstGeneExpressionPathwayActivity : { $set: undefined },
      secondGeneExpressionPathwayActivity : { $set: undefined },
      modified: { $set: true},
      golabel: { $set: selectedGoLabel + '_modified'},
    });

    // slice out found via golabel
    const pathwayIndex = this.state.loadedPathways.findIndex( p => {
      return p.golabel === selectedGoLabel+'_modified' ;
    });

    const newPathways= pathwayIndex >=0 ?
      update(this.state.loadedPathways,{[pathwayIndex]: {$set:selectedEditedGeneSet}}) :
      update(this.state.loadedPathways,{$push:[selectedEditedGeneSet]});

    const cartIndex = this.state.cartPathways.findIndex( p => {
      return p.golabel === selectedGoLabel ;
    });

    const newCart = cartIndex < 0 ?
      update(this.state.cartPathways,{$push:[selectedEditedGeneSet]}):
      update(this.state.cartPathways,{[cartIndex]: {$set:selectedEditedGeneSet}});

    this.setState(
      {
        editGeneSet:undefined,
        selectedEditGeneSet:undefined,
        cartPathways:newCart,
        loadedPathways:newPathways,
      }
    );
  }

  handleCancelEditGeneSet() {
    this.setState({editGeneSet:undefined,selectedEditGeneSet:undefined});
  }

  handleClearCart() {
    this.setState({cartPathways:[]});
  }


  handleAddGeneToGeneSet(newGene) {
    const foundGene = this.state.selectedEditGeneSet.gene.findIndex( g => g===newGene[0]);
    if(foundGene>=0){
      alert('Gene already added: '+newGene[0]) ;
      return ;
    }
    this.setState({
      selectedEditGeneSet: update( this.state.selectedEditGeneSet,{
        gene: { $push: newGene }
      })
    });
  }

  handleRemoveGeneFromGeneSet(){
    const newGenes = this.state.selectedEditGeneSet.gene.filter( g =>  this.state.selectedGenesForGeneSet.indexOf(g)<0 );
    this.setState({
      selectedEditGeneSet: update( this.state.selectedEditGeneSet,{
        gene: { $set: newGenes }
      })
    });
  }

  handleRemoveSelectedFromCart() {
    // find filteredPathways from each selectedFilter
    const selectedCartPathways = this.state.cartPathways
      .filter( f => this.state.selectedCartPathways.indexOf(f.golabel)<0 );
    this.setState({
      cartPathways: selectedCartPathways
    });
  }

  // TODO: push back to production pathways
  handleViewGeneSets() {
    this.props.setPathways(this.getSelectedCartData());
  }
  // TODO: push back to production pathways
  handleCancel() {
    this.props.cancelPathwayEdit();
  }

  handleResetGeneSets() {
    this.setState({cartPathways:this.props.pathways.slice(0,this.state.limit)});
  }

  queryNewGenes(geneQuery) {
    if (geneQuery.trim().length === 0) {
      this.setState({
        geneOptions: []
      });
      return;
    }

    lookupGeneByName(geneQuery,(matches) => { this.setState( {geneOptions:matches});});
  }

  handleNewGeneSetNameInput = (name, value) => {
    this.setState({newGeneStateName:value});
  };


  handleNewGeneSetSaveAndStart = () => {
    const nameToEdit = this.state.newGeneStateName;
    const selectedEditGeneSet = {
      firstGeneExpressionPathwayActivity : undefined,
      secondGeneExpressionPathwayActivity : undefined,
      modified: true,
      golabel: nameToEdit,
      gene: [],
    };

    this.setState({editGeneSet:nameToEdit,newGeneStateName:'',selectedEditGeneSet});
  };


  cancelUpdate(){
    this.setState({
      newGeneStateName: '',
    });
  }

  render() {
    return (
      <div className={BaseStyle.geneSetBox}>
        <Dialog
          active={this.state.newGeneStateName!==''}
          onEscKeyDown={() => this.cancelUpdate()}
          onOverlayClick={() => this.cancelUpdate()}
          title='Edit Gene Set Name'
        >
          <Input
            name='newGeneSetName'
            onChange={this.handleNewGeneSetNameInput.bind(this,'newGeneSetName')}
            // onChange={(newName) => this.setState({newGeneStateName:newName})}
            value={this.state.newGeneStateName}
          />
          {/*<Button label='Save' onClick={() => this.setState({editGeneSet:this.state.newGeneStateName,newGeneStateName:undefined})} primary raised/>*/}
          <Button label='Save' onClick={this.handleNewGeneSetSaveAndStart.bind(this,'newGeneSetName')} primary raised/>
          <Button label='Cancel' onClick={() => this.setState({newGeneStateName:''})} />
        </Dialog>
        <table>
          <tbody>
            <tr>
              <td width={200}>
                <table className={BaseStyle.geneSetFilterBox}>
                  <tbody>
                    <tr>
                      <td>
                    Sort By
                        <select onChange={(event) => this.setState({sortBy: event.target.value})}>
                          <option value='Diff'>Cohort Diff BPA</option>
                          <option value='Total'>Total BPA</option>
                          <option value='Alpha'>Alphabetically</option>
                        </select>
                      </td>
                      <td>
                        { this.state.sortOrder === 'asc' &&
                    <FaSortAsc onClick={() => this.setState({sortOrder:'desc'})}/>
                        }
                        { this.state.sortOrder === 'desc' &&
                    <FaSortDesc onClick={() => this.setState({sortOrder:'asc'})}/>
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <input onChange={(event) => this.setState({name: event.target.value.toLowerCase()})} size={30}/>
                      </td>
                      <td>
                        <FaFilter/>
                      </td>
                    </tr>
                    <tr>
                      <td>
                    View Limit (Tot: {this.state.totalPathways})
                      </td>
                      <td>
                        <input
                          onChange={(event) => this.setState({limit: event.target.value})}
                          style={{width: 25}}
                          value={this.state.limit}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                {this.state.editGeneSet === undefined &&
                <ButtonGroup>
                  <Button
                    disabled={this.state.selectedFilteredPathways.length !== 1}
                    onClick={() => this.handleEditGeneSet(this.state.selectedFilteredPathways[0],this.state.filteredPathways)}
                  >
                    <FaEdit/> Edit GeneSet
                  </Button>
                  <Button
                    onClick={() => this.handleNewGeneSet()}
                  >
                    <FaPlusCircle/> New GeneSet
                  </Button>
                </ButtonGroup>
                }
                {this.state.editGeneSet&&
                <ButtonGroup>
                  <Button
                    onClick={() => this.handleDoneEditGeneSet(this.state.selectedFilteredPathways[0])}
                    primary raised
                  >
                    <FaCheckSquare/> Done
                  </Button>
                  <Button
                    onClick={() => this.handleCancelEditGeneSet(this.state.selectedFilteredPathways[0])}
                    raised
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
                }
                {this.state.selectedFilteredPathways.length} Selected
                <select
                  disabled={this.state.editGeneSet}
                  multiple
                  onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      return opt.value;
                    });
                    this.setState({ selectedFilteredPathways: selectedEvents});
                  }}
                  style={{overflow:'scroll', height:200,width: 300}}
                >
                  {
                    this.state.filteredPathways.slice(0,this.state.limit).map( p => {
                      return <option key={p.golabel} value={p.golabel}>({ (this.scorePathway(p))}, N: {p.gene.length}) {p.golabel.substr(0,35)}</option>;
                    })
                  }
                </select>
              </td>
              <td width={100}>
                <Button
                  disabled={this.state.selectedFilteredPathways.length===0 || this.state.editGeneSet!==undefined}
                  onClick={() => this.handleAddSelectedToCart()}
                >
                  <FaArrowCircleORight/> Add to View
                </Button>
                <hr/>
                <Button disabled={this.state.selectedCartPathways.length===0 || this.state.editGeneSet!==undefined} onClick={() => this.handleRemoveSelectedFromCart()} >
                  {/*<FaArrowCircleOLeft/>*/}
                  <FaTrashO  color='orange'/> Remove from View
                </Button>
                <Button
                  disabled={this.state.editGeneSet!==undefined}
                  onClick={() => this.handleClearCart()}
                >
                  <FaTrashO color='red'/> Clear View
                </Button>
              </td>
              {!this.state.editGeneSet &&
              <td width={200}>
                <table className={BaseStyle.geneSetFilterBox}>
                  <tbody>
                    <tr>
                      <td>
                        <Chip>{this.state.cartPathways.length} / {this.state.cartPathwayLimit} </Chip>
                      </td>
                      <td>
                      Sort By
                        <select onChange={(event) => this.setState({sortCartBy: event.target.value})}>
                          <option value='Diff'>Cohort Diff BPA</option>
                          <option value='Total'>Total BPA</option>
                          <option value='Alpha'>Alphabetically</option>
                        </select>
                      </td>
                      <td>
                        <Button mini raised>
                          {this.state.sortCartOrder === 'asc' &&
                        <FaSortAsc onClick={() => this.setState({sortCartOrder: 'desc'})}/>
                          }
                          {this.state.sortCartOrder === 'desc' &&
                        <FaSortDesc onClick={() => this.setState({sortCartOrder: 'asc'})}/>
                          }
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                      View Limit
                      </td>
                      <td>
                        <input
                          onChange={(event) => this.setState({cartPathwayLimit: event.target.value})}
                          style={{width: 25}}
                          value={this.state.cartPathwayLimit}
                        />
                      </td>
                      <td>
                        <Button
                          disabled={this.state.selectedCartPathways.length !== 1}
                          onClick={() => this.handleEditGeneSet(this.state.selectedCartPathways[0],this.state.cartPathways)}
                        >
                          <FaEdit/> Edit GeneSet
                        </Button>

                      </td>
                    </tr>
                  </tbody>
                </table>
                <br/>
                <select
                  multiple onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      return opt.value;
                    });
                    this.setState({selectedCartPathways: selectedEvents});
                  }}
                  style={{overflow: 'scroll', height: 300}}
                >
                  {
                    this.state.cartPathways.sort((a, b) => {
                      switch (this.state.sortCartBy) {
                      case 'Total':
                      case 'Diff':
                        return (this.state.sortCartOrder === 'asc' ? 1 : -1) * (this.scoreCartPathway(b) - this.scoreCartPathway(a));
                      case 'Alpha':
                        return (this.state.sortCartOrder === 'asc' ? 1 : -1) * (a.golabel.toLowerCase()).localeCompare(b.golabel.toLowerCase());
                      }
                    }).map(p => {
                      return (<option key={p.golabel} value={p.golabel}>({(this.scoreCartPathway(p))},
                        N: {p.gene.length}) {p.golabel.substr(0, 35)}</option>);
                    })
                  }
                </select>
              </td>
              }
              {this.state.editGeneSet &&
                <td>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <select
                            multiple
                            onChange={(event) => {
                              const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                                return opt.value;
                              });
                              this.setState({ selectedGenesForGeneSet: selectedEvents});
                            }}
                            style={{height:350,width: 80}}
                          >
                            {
                              this.state.selectedEditGeneSet.gene.map ( gs =>
                                (<option key={gs}>
                                  {gs}
                                </option>)
                              )
                            }
                          </select>
                        </td>
                        <td>
                          <table className={BaseStyle.geneSetFilterBox}>
                            <tbody>
                              <tr>
                                <td>
                                  <h4>Editing <br/>{this.state.editGeneSet}</h4>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <Button  mini raised>
                                    <FaCloudDownload/>
                                  </Button>
                                  <Button mini raised>
                                    <FaCloudUpload/>
                                  </Button>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <Autocomplete
                                    disabled={this.state.newGene.length > 0}
                                    label='&nbsp;&nbsp;Add Gene'
                                    onChange={(newGene) => {
                                      this.handleAddGeneToGeneSet(newGene);
                                    // this.setState({newGene: newGene});
                                    }}
                                    onQueryChange={(geneQuery) => this.queryNewGenes(geneQuery)}
                                    source={this.state.geneOptions}
                                    style={{marginLeft:10,fontWeight:'bolder'}}
                                    value={this.state.newGene}
                                  />

                                  <Button
                                    disabled={this.state.selectedGenesForGeneSet.length===0}
                                    onClick={() => this.handleRemoveGeneFromGeneSet()}
                                  >
                                  Remove Gene(s) <FaTrash/>
                                  </Button>
                                </td>
                              </tr>
                            </tbody>
                          </table>

                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              }
            </tr>
            <tr>
              <td>
                <Button
                  disabled={this.state.editGeneSet!==undefined}
                  label='View' mini
                  onClick={() => this.handleViewGeneSets()}
                  primary raised
                />
                <Button
                  label='Reset' mini
                  onClick={() => this.handleResetGeneSets()}
                  raised
                />
                <Button
                  label='Cancel' mini
                  onClick={() => this.handleCancel()}
                  raised
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

GeneSetFilter.propTypes = {
  cancelPathwayEdit: PropTypes.any.isRequired,
  pathwayData: PropTypes.array.isRequired,
  pathways: PropTypes.any.isRequired,
  setPathways: PropTypes.any.isRequired,
};
