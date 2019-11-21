import PureComponent from './PureComponent';
import React from 'react';
import BaseStyle from '../css/base.css';
import FaEdit from 'react-icons/lib/fa/edit';
import FaSortAsc from 'react-icons/lib/fa/sort-alpha-asc';
import FaSortDesc from 'react-icons/lib/fa/sort-alpha-desc';
import FaArrowCircleORight from 'react-icons/lib/fa/arrow-circle-o-right';
import {Button} from 'react-toolbox/lib/button';
import PropTypes from 'prop-types';
import {
  fetchPathwayActivityMeans, getGeneSetsForView,  lookupGeneByName
} from '../functions/FetchFunctions';
import FaTrashO from 'react-icons/lib/fa/trash-o';
import FaCheckSquare from 'react-icons/lib/fa/check-square';
import FaTrash from 'react-icons/lib/fa/trash';
import update from 'immutability-helper';
import {Chip, Input} from 'react-toolbox';
import Autocomplete from 'react-toolbox/lib/autocomplete';
import FaPlusCircle from 'react-icons/lib/fa/plus-circle';
import {ButtonGroup} from 'react-bootstrap';
import Dialog from 'react-toolbox/lib/dialog';
import {scorePathway} from '../functions/SortFunctions';
import {VIEW_ENUM} from '../data/ViewEnum';
import {isViewGeneExpression} from '../functions/DataFunctions';

const VIEW_LIMIT = 200;
const CART_LIMIT = 45;

export default class GeneSetEditor extends PureComponent {

  constructor(props) {
    super(props);

    let loadedPathways = [];
    let cartPathways = [];
    if (!isViewGeneExpression(props.view)) {
      loadedPathways = getGeneSetsForView(this.props.view);
      const pathwayLabels = this.props.pathways.map(p => p.golabel);
      // included data from original pathways
      cartPathways = loadedPathways.filter(p => pathwayLabels.indexOf(p.golabel) >= 0);
      const cartLabels = cartPathways.map(p => p.golabel);
      cartPathways = [...cartPathways, ...this.props.pathways.filter(p => cartLabels.indexOf(p.golabel) < 0)];
    }

    this.state = {
      editGeneSet: undefined,
      name: '',
      sortOrder:'asc',
      sortBy: props.view===VIEW_ENUM.GENE_EXPRESSION || props.view===VIEW_ENUM.PARADIGM  ? 'AbsDiff' : 'Alpha',
      sortCartOrder:'asc',
      sortCartBy: props.view===VIEW_ENUM.GENE_EXPRESSION || props.view===VIEW_ENUM.PARADIGM ? 'Diff' : 'Alpha',
      geneSet: '8K',
      newGene: [],
      geneOptions: [],
      loadedPathways,
      selectedCohort: [props.pathwayData[0].cohort,props.pathwayData[1].cohort],
      samples: [props.pathwayData[0].samples,props.pathwayData[1].samples],
      filteredPathways : [],
      cartPathways,
      selectedGenesForGeneSet: [],
      selectedFilteredPathways : [],
      selectedCartPathways : [],
      totalPathways: 0,
      cartPathwayLimit: CART_LIMIT,
      limit: VIEW_LIMIT,
      newGeneStateName:'',
    };




  }

  componentDidMount() {
    let { selectedCohort, samples } = this.state;
    if(isViewGeneExpression(this.props.view)){
      fetchPathwayActivityMeans(selectedCohort,samples,this.props.view,this.handleMeanActivityData);
    }
    else{
      this.filterByName();
    }
  }


  componentDidUpdate() {
    this.filterByName();
  }

  showScore(){
    return this.props.view === VIEW_ENUM.GENE_EXPRESSION || this.props.view === VIEW_ENUM.PARADIGM;
  }

  handleMeanActivityData = (output) => {
    const pathways = getGeneSetsForView(this.props.view);
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
    // included data from original pathways
    let cartPathways = loadedPathways.filter( p =>  pathwayLabels.indexOf(p.golabel)>=0 );
    const cartLabels = cartPathways.map( p => p.golabel);
    cartPathways = [...cartPathways,...this.props.pathways.filter( p => cartLabels.indexOf(p.golabel)<0 )];


    this.setState({
      loadedPathways,
      cartPathways,
    });
  };

  filterByName(){
    const filteredPathways = this.state.loadedPathways
      .filter( p => ( p.golabel.toLowerCase().indexOf(this.state.name)>=0 ||  (p.goid && p.goid.toLowerCase().indexOf(this.state.name)>=0)))
      .sort( (a,b) => {
        const scoreA = scorePathway(a,this.state.sortBy);
        const scoreB = scorePathway(b,this.state.sortBy);
        switch(this.state.sortBy) {
        default:
          if(scoreA==='NaN' && scoreB !=='NaN') return 1 ;
          if(scoreA!=='NaN' && scoreB ==='NaN') return -1;
          if(scoreA==='NaN' && scoreB ==='NaN') return -1 ;
          return (this.state.sortOrder === 'asc' ? 1 : -1 ) * (scoreB-scoreA) ;
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

    const alreadyExists = this.state.cartPathways.filter( f => this.state.selectedFilteredPathways.indexOf(f.golabel)>=0);
    if(alreadyExists.length>0){
      alert(alreadyExists.map( f => f.golabel).join(' ')+ ' already in cart' );
    }

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

  isCartFull() {
    return this.state.cartPathways.length === this.state.cartPathwayLimit;
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
              {!this.state.editGeneSet &&
              <td className={BaseStyle.geneSetFilterBox}  width={250}>
                <div style={{fontSize:'larger',fontWeight:'bolder',textDecoration:'underline'}}>Source</div>
                <table className={BaseStyle.geneSetFilterBox}>
                  <tbody>
                    <tr>
                      {this.showScore() &&
                    <td>
                      Sort By
                      <select
                        onChange={(event) => this.setState({sortBy: event.target.value})}
                        value={this.state.sortBy}
                      >
                        <option  value='AbsDiff'>Abs Diff</option>
                        <option  value='Diff'>Cohort Diff</option>
                        <option  value='Total'>Total</option>
                        <option  value='Alpha'>Alphabetically</option>
                      </select>
                    </td>
                      }

                      <td>
                        {this.state.sortOrder === 'asc' &&
                      <FaSortAsc onClick={() => this.setState({sortOrder: 'desc'})}/>
                        }
                        {this.state.sortOrder === 'desc' &&
                      <FaSortDesc onClick={() => this.setState({sortOrder: 'asc'})}/>
                        }
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <input
                          onChange={(event) => this.setState({name: event.target.value.toLowerCase()})}
                          placeholder='Filter by name' size={30}
                        />
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
                    onClick={() => this.handleNewGeneSet()}
                  >
                    <FaPlusCircle/> New GeneSet
                  </Button>
                  <Button
                    disabled={this.state.selectedFilteredPathways.length !== 1}
                    onClick={() => this.handleEditGeneSet(this.state.selectedFilteredPathways[0], this.state.filteredPathways)}
                  >
                    <FaEdit/> Edit GeneSet
                  </Button>
                  <Button
                    disabled={this.isCartFull() || this.state.selectedFilteredPathways.length === 0 || this.state.editGeneSet !== undefined}
                    onClick={() => this.handleAddSelectedToCart()}
                  >
                    <FaArrowCircleORight/> Add To View
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
                    this.setState({selectedFilteredPathways: selectedEvents});
                  }}
                  style={{overflow: 'scroll', height: 200, width: 220}}
                >
                  {
                    this.state.filteredPathways.slice(0, this.state.limit).map(p => {
                      return (<option key={p.golabel} value={p.golabel}>(
                        {this.showScore() &&
                        `${scorePathway(p, 'Diff')}, `
                        }
                        N: {p.gene.length}) {p.golabel}</option>);
                    })
                  }
                </select>
              </td>
              }
              <td style={{verticalAlign: 'middle'}} valign='top' width={80}>
                {/*<FaArrowCircleORight style={{verticalAlign:'middle',align:'center'}}/>*/}
              </td>
              {!this.state.editGeneSet &&
              <td className={BaseStyle.geneSetFilterBox} width={300} >
                <div style={{fontSize:'larger',fontWeight:'bolder',textDecoration:'underline'}}>View</div>
                <table className={BaseStyle.geneSetFilterBox}>
                  <tbody>
                    <tr>
                      <td>
                        <Chip
                          style={{ backgroundColor: this.isCartFull() ? 'orange':'lightgray'}}
                        >{this.state.cartPathways.length} / {this.state.cartPathwayLimit} </Chip>
                      </td>
                      {this.showScore() &&
                      <td>
                      Sort By
                        <br/>
                        <select
                          onChange={(event) => this.setState({sortCartBy: event.target.value})}
                          value={this.state.sortCartBy}
                        >
                          <option  value='AbsDiff'>Abs Diff</option>
                          <option  value='Diff'>Cohort Diff</option>
                          <option  value='Total'>Total</option>
                          <option  value='Alpha'>Alphabetically</option>
                        </select>
                      </td>
                      }
                      <td>
                        {this.state.sortCartOrder === 'asc' &&
                        <FaSortAsc onClick={() => this.setState({sortCartOrder: 'desc'})}/>
                        }
                        {this.state.sortCartOrder === 'desc' &&
                        <FaSortDesc onClick={() => this.setState({sortCartOrder: 'asc'})}/>
                        }
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
                    </tr>
                  </tbody>
                </table>
                <ButtonGroup>
                  <Button
                    disabled={this.state.selectedCartPathways.length !== 1}
                    onClick={() => this.handleEditGeneSet(this.state.selectedCartPathways[0],this.state.cartPathways)}
                  >
                    <FaEdit/> Edit
                  </Button>
                  <Button disabled={this.state.selectedCartPathways.length===0 || this.state.editGeneSet!==undefined} onClick={() => this.handleRemoveSelectedFromCart()} >
                    <FaTrashO  color='orange'/> Remove
                  </Button>
                </ButtonGroup>
                <select
                  multiple onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      return opt.value;
                    });
                    this.setState({selectedCartPathways: selectedEvents});
                  }}
                  style={{overflow: 'scroll', height: 250, width: 250}}
                >
                  {
                    this.state.cartPathways.sort((a, b) => {
                      const scoreA = scorePathway(a,this.state.sortCartBy);
                      const scoreB = scorePathway(b,this.state.sortCartBy);
                      switch (this.state.sortCartBy) {
                      case 'Alpha':
                        return (this.state.sortCartOrder === 'asc' ? 1 : -1) * (a.golabel.toLowerCase()).localeCompare(b.golabel.toLowerCase());
                      default:
                        if(scoreA==='NaN' && scoreB !=='NaN') return 1 ;
                        if(scoreA!=='NaN' && scoreB ==='NaN') return -1;
                        if(scoreA==='NaN' && scoreB ==='NaN') return -1 ;
                        return (this.state.sortCartOrder === 'asc' ? 1 : -1) * (scoreB-scoreA);
                      }
                    }).map(p => {
                      return (<option key={p.golabel} value={p.golabel}>(
                        {this.showScore() &&
                        `${scorePathway(p,'Diff')}, `
                        }
                        N: {p.gene.length}) {p.golabel}</option>);
                    })
                  }
                </select>
                <br/>
                <Button
                  disabled={this.state.editGeneSet!==undefined}
                  onClick={() => this.handleClearCart()}
                >
                  <FaTrashO color='red'/> Clear All
                </Button>
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
            {this.state.editGeneSet &&
            <tr>
              <td colSpan={3}>
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
              </td>
            </tr>
            }
            {!this.state.editGeneSet &&
            <tr>
              <td colSpan={3}>
                <Button
                  disabled={this.state.editGeneSet !== undefined}
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
            }
          </tbody>
        </table>
      </div>
    );
  }
}

GeneSetEditor.propTypes = {
  cancelPathwayEdit: PropTypes.any.isRequired,
  pathwayData: PropTypes.array.isRequired,
  pathways: PropTypes.any.isRequired,
  setPathways: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
};
