import PureComponent from './PureComponent'
import React from 'react'
import BaseStyle from '../css/base.css'
import FaArrowCircleORight from 'react-icons/lib/fa/arrow-circle-right'
import {Button} from 'react-toolbox/lib/button'
import PropTypes from 'prop-types'
import {
  fetchPathwayActivityMeans, getGeneSetsForView,  lookupGeneByName
} from '../functions/FetchFunctions'
import FaTrashO from 'react-icons/lib/fa/trash-o'
import FaDownload from 'react-icons/lib/fa/download'
import FaCheckSquare from 'react-icons/lib/fa/check-square'
import FaTrash from 'react-icons/lib/fa/trash'
import update from 'immutability-helper'
import {Input} from 'react-toolbox'
import Autocomplete from 'react-toolbox/lib/autocomplete'
import Dialog from 'react-toolbox/lib/dialog'
import {calculateSortingByMethod, scorePathway} from '../functions/SortFunctions'
import {isViewGeneExpression} from '../functions/DataFunctions'
import {SORT_ENUM, SORT_ORDER_ENUM, SORT_VIEW_BY} from '../data/SortEnum'
import {getCustomGeneSet} from '../service/GeneSetAnalysisStorageService'
import Loader from './loading'

const VIEW_LIMIT = 200
const CART_LIMIT = 1000

export default class GeneSetEditorPopup extends PureComponent {

  constructor(props) {
    super(props)

    let loadedPathways = []
    let cartPathways = []
    if (!isViewGeneExpression(props.view)) {
      loadedPathways = getGeneSetsForView(this.props.view)
      const pathwayLabels = this.props.pathways.map(p => p.golabel)
      // included data from original pathways
      cartPathways = loadedPathways.filter(p => pathwayLabels.indexOf(p.golabel) >= 0)
      const cartLabels = cartPathways.map(p => p.golabel)
      cartPathways = [...cartPathways, ...this.props.pathways.filter(p => cartLabels.indexOf(p.golabel) < 0)]
    }

    const sortingOptions = calculateSortingByMethod(SORT_VIEW_BY.DIFFERENT)

    this.state = {
      editGeneSet: undefined,
      name: '',
      geneName: '',
      sortOrder: sortingOptions.sortViewOrder,
      sortBy: sortingOptions.sortViewBy,
      sortCartOrder:sortingOptions.sortViewOrder,
      sortCartOrderLabel:SORT_VIEW_BY.DIFFERENT,
      sortCartBy: sortingOptions.sortViewBy,
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
      showLoading:true,
      customGeneSetName: this.props.customInternalGeneSetName || '',
    }
  }

  componentDidMount() {
    let { selectedCohort, samples } = this.state
    if(isViewGeneExpression(this.props.view)){
      fetchPathwayActivityMeans(selectedCohort,samples,this.props.view,this.handleMeanActivityData)
    }
    else{
      this.filterAvailable()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(
      prevState.name !== this.state.name
      || prevState.geneName !== this.state.geneName
      || prevState.sortOrder !== this.state.sortOrder
      || this.state.filteredPathways.length === 0
    ){
      this.filterAvailable(prevState.sortOrder !== this.state.sortOrder)
    }

    if(prevState.sortCartOrderLabel !== this.state.sortCartOrderLabel
    ){
      this.sortVisibleCartByLabel(this.state.sortCartOrderLabel)
    }
  }

  showScore(){
    return isViewGeneExpression(this.props.view)
  }

  handleMeanActivityData = async (output) => {
    const pathways = getGeneSetsForView(this.props.view)
    let loadedPathways = pathways.map( p => {
      p.firstGeneExpressionPathwayActivity = undefined
      p.secondGeneExpressionPathwayActivity = undefined
      return p
    })

    let indexMap = {}
    pathways.forEach( (p,index) => {
      indexMap[p.golabel] = index
    })

    for(let index in output.geneExpressionPathwayActivityA.field){
      const field = output.geneExpressionPathwayActivityA.field[index]
      const cleanField = field.indexOf(' (') < 0 ? field :  field.substr(0,field.indexOf(' (')+1).trim()
      const sourceIndex = indexMap[cleanField]
      if(loadedPathways[sourceIndex]){
        loadedPathways[sourceIndex].firstGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityA.mean[index]
        loadedPathways[sourceIndex].secondGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityB.mean[index]
      }
    }

    const pathwayLabels = this.props.pathways.map( p => p.golabel)
    // included data from original pathways
    let cartPathways
    if(this.props.customInternalGeneSetName && this.props.isNotDefaultGeneSet(this.state.customGeneSetName)){
      // TODO, may need to interset
      cartPathways = await getCustomGeneSet(this.props.view,this.state.customGeneSetName)
    }
    else{
      cartPathways = loadedPathways.filter( p =>  pathwayLabels.indexOf(p.golabel)>=0 )
      const cartLabels = cartPathways.map( p => p.golabel)
      cartPathways = [...cartPathways,...this.props.pathways.filter( p => cartLabels.indexOf(p.golabel)<0 )]
    }



    this.setState({
      loadedPathways,
      cartPathways,
      showLoading:false,
    })
  };

  sortVisibleCartByLabel(sortCartByLabel) {
    const sortingOptions = calculateSortingByMethod(sortCartByLabel)
    const filteredCart = this.getFilteredCart(this.state.cartPathways,sortingOptions.sortViewBy,sortingOptions.sortViewOrder)
    this.setState({
      sortCartBy: sortingOptions.sortViewBy,
      sortCartOrder: sortingOptions.sortViewOrder,
      cartPathways: filteredCart.slice(0,this.state.cartPathwayLimit) ,
      filteredCartPathways: filteredCart.slice(0,this.state.cartPathwayLimit),
    })

  }

  sortVisibleCart(sortBy, sortOrder, cartLimit) {
    const filteredCart = this.getFilteredCart(this.state.cartPathways,sortBy,sortOrder)
    this.setState({
      sortCartBy: sortBy,
      sortCartOrder: sortOrder,
      cartPathwaysLimit: cartLimit,
      cartPathways: filteredCart.slice(0,cartLimit) ,
      filteredCartPathways: filteredCart.slice(0,cartLimit),
    })
  }

  filterAvailable(){
    const filteredPathways = this.state.loadedPathways
      .filter( p => ( p.golabel.toLowerCase().indexOf(this.state.name)>=0 ||
        (p.goid && p.goid.toLowerCase().indexOf(this.state.name)>=0)))
      .filter( p => this.state.geneName ==='' || ( p.gene.indexOf(this.state.geneName.toUpperCase())>=0))
      .sort( (a,b) => {
        if(SORT_ENUM[this.state.sortBy]===SORT_ENUM.ALPHA) {
          return (this.state.sortOrder === SORT_ORDER_ENUM.ASC ? 1 : -1) * a.golabel.toUpperCase().localeCompare(b.golabel.toUpperCase())
        }
        else{
          const scoreA = scorePathway(a,this.state.sortBy)
          const scoreB = scorePathway(b,this.state.sortBy)
          if(scoreA==='NaN' && scoreB !=='NaN') return 1
          if(scoreA!=='NaN' && scoreB ==='NaN') return -1
          if(scoreA==='NaN' && scoreB ==='NaN') return -1
          return (this.state.sortOrder === SORT_ORDER_ENUM.ASC ? 1 : -1 ) * (scoreB-scoreA)
        }
      })
    this.setState({
      filteredPathways: filteredPathways,
      totalPathways: filteredPathways.length
    })
  }

  getSelectedCartData(){
    // find filteredPathways from each selectedFilter
    const selectedFilteredPathways = this.state.filteredPathways
      .filter( f => this.state.selectedFilteredPathways.indexOf(f.golabel)>=0 )
      .filter( f => this.state.cartPathways.indexOf(f)<0 )

    const alreadyExists = this.state.cartPathways.filter( f => this.state.selectedFilteredPathways.indexOf(f.golabel)>=0)
    if(alreadyExists.length>0){
      // eslint-disable-next-line no-console
      console.warn(alreadyExists.map( f => f.golabel).join(' ')+ ' already in cart' )
    }

    return update(this.state.cartPathways, {
      $push: selectedFilteredPathways
    })
  }

  handleAddSelectedToCart() {
    this.setState({
      cartPathways: this.getSelectedCartData()
    })
  }

  getFilteredCart(pathways,sortBy,sortOrder){
    return pathways.sort((a, b) => {
      if(SORT_ENUM[sortBy]===SORT_ENUM.ALPHA){
        return (sortOrder === SORT_ORDER_ENUM.ASC ? 1 : -1) * (a.golabel.toUpperCase()).localeCompare(b.golabel.toUpperCase())
      }
      else{
        const scoreA = scorePathway(a,sortBy)
        const scoreB = scorePathway(b,sortBy)
        if(scoreA==='NaN' && scoreB !=='NaN') return 1
        if(scoreA!=='NaN' && scoreB ==='NaN') return -1
        if(scoreA==='NaN' && scoreB ==='NaN') return -1
        return (sortOrder === SORT_ORDER_ENUM.ASC ? 1 : -1) * (scoreB-scoreA)
      }
    })
  }

  // handleRefreshView() {
  //   const newCart = this.state.filteredPathways.slice(0,this.state.cartPathwayLimit)
  //   this.setState({
  //     cartPathways: newCart,
  //     filteredCartPathways: this.getFilteredCart(newCart,this.state.sortCartBy,this.state.sortCartOrder)
  //   })
  // }

  handleNewGeneSet() {
    const newGeneSet = {
      golabel:'New GeneSet',
      gene: []
    }
    this.setState({newGeneStateName:newGeneSet.golabel,selectedEditGeneSet: newGeneSet,})
  }

  handleEditGeneSet(geneSet,geneSetList) {
    const selectedEditGeneSet = geneSetList.filter( gs => gs.golabel === geneSet)
    this.setState({editGeneSet:geneSet,selectedEditGeneSet: selectedEditGeneSet.length > 0 ? selectedEditGeneSet[0] : undefined})
  }

  handleDoneEditGeneSet() {
    const selectedGoLabel = this.state.selectedEditGeneSet.golabel
    // find the new one we want
    const selectedEditedGeneSet = update(this.state.selectedEditGeneSet,{
      firstGeneExpressionPathwayActivity : { $set: undefined },
      secondGeneExpressionPathwayActivity : { $set: undefined },
      modified: { $set: true},
      golabel: { $set: selectedGoLabel + '_modified'},
    })

    // slice out found via golabel
    const pathwayIndex = this.state.loadedPathways.findIndex( p => {
      return p.golabel === selectedGoLabel+'_modified'
    })

    const newPathways= pathwayIndex >=0 ?
      update(this.state.loadedPathways,{[pathwayIndex]: {$set:selectedEditedGeneSet}}) :
      update(this.state.loadedPathways,{$push:[selectedEditedGeneSet]})

    const cartIndex = this.state.cartPathways.findIndex( p => {
      return p.golabel === selectedGoLabel
    })

    const newCart = cartIndex < 0 ?
      update(this.state.cartPathways,{$push:[selectedEditedGeneSet]}):
      update(this.state.cartPathways,{[cartIndex]: {$set:selectedEditedGeneSet}})

    this.setState(
      {
        editGeneSet:undefined,
        selectedEditGeneSet:undefined,
        cartPathways:newCart,
        loadedPathways:newPathways,
      }
    )
  }

  handleCancelEditGeneSet() {
    this.setState({editGeneSet:undefined,selectedEditGeneSet:undefined})
  }

  handleClearCart() {
    this.setState({cartPathways:[],filteredCartPathways:[]})
  }


  handleAddGeneToGeneSet(newGene) {
    const foundGene = this.state.selectedEditGeneSet.gene.findIndex( g => g===newGene[0])
    if(foundGene>=0){
      alert('Gene already added: '+newGene[0])
      return
    }
    this.setState({
      selectedEditGeneSet: update( this.state.selectedEditGeneSet,{
        gene: { $push: newGene }
      })
    })
  }

  handleRemoveGeneFromGeneSet(){
    const newGenes = this.state.selectedEditGeneSet.gene.filter( g =>  this.state.selectedGenesForGeneSet.indexOf(g)<0 )
    this.setState({
      selectedEditGeneSet: update( this.state.selectedEditGeneSet,{
        gene: { $set: newGenes }
      })
    })
  }

  handleRemoveSelectedFromCart() {
    const selectedCartPathways = this.state.cartPathways
      .filter( f => this.state.selectedCartPathways.indexOf(f.golabel)<0 )
    this.setState({
      cartPathways: selectedCartPathways
    })
  }

  handleViewGeneSets() {
    if(this.state.customGeneSetName){
      const selectedCartData = this.getSelectedCartData()
      console.log('trying to save',this.state.customGeneSetName,selectedCartData)
      this.props.storeCustomInternalGeneSets(this.state.customGeneSetName,selectedCartData)
      this.props.setPathways(selectedCartData,this.state.customGeneSetName)
    }
    else{
      alert('You need to provide a name for the custom gene set view.')
    }
  }
  // TODO: push back to production pathways
  handleCancel() {
    this.props.cancelPathwayEdit()
  }

  handleResetGeneSets() {
    this.setState({cartPathways:this.props.pathways.slice(0,this.state.limit)})
  }

  queryNewGenes(geneQuery) {
    if (geneQuery.trim().length === 0) {
      this.setState({
        geneOptions: []
      })
      return
    }

    lookupGeneByName(geneQuery,(matches) => { this.setState( {geneOptions:matches})})
  }

  handleNewGeneSetNameInput = (name, value) => {
    this.setState({newGeneStateName:value})
  };


  handleNewGeneSetSaveAndStart = () => {
    const nameToEdit = this.state.newGeneStateName
    const selectedEditGeneSet = {
      firstGeneExpressionPathwayActivity : undefined,
      secondGeneExpressionPathwayActivity : undefined,
      modified: true,
      golabel: nameToEdit,
      gene: [],
    }

    this.setState({editGeneSet:nameToEdit,newGeneStateName:'',selectedEditGeneSet})
  };


  cancelUpdate(){
    this.setState({
      newGeneStateName: '',
    })
  }


  getCartColor() {
    // full
    if(this.state.cartPathways.length === this.state.cartPathwayLimit){
      return 'lightgreen'
    }
    else
    if(this.state.cartPathways.length < this.state.cartPathwayLimit){
      return 'green'
    }
    else
    if(this.state.cartPathways.length > this.state.cartPathwayLimit){
      return 'orange'
    }
  }

  isCartFull() {
    return this.state.cartPathways.length === this.state.cartPathwayLimit
  }

  render() {
    return (
      <div className={BaseStyle.geneSetBox}>
        <Dialog
          active={this.state.showLoading}
          style={{width: 400}}
          title={`Loading GeneSets for '${this.props.view}'...`}
        >
          { this.state.showLoading ? <Loader /> : null }
        </Dialog>
        <Dialog
          active={this.state.newGeneStateName!==''}
          onEscKeyDown={() => this.cancelUpdate()}
          onOverlayClick={() => this.cancelUpdate()}
          title='Edit GeneSet Name'
        >
          <Input
            name='newGeneSetName'
            onChange={this.handleNewGeneSetNameInput.bind(this,'newGeneSetName')}
            value={this.state.newGeneStateName}
          />
          <Button label='Save' onClick={this.handleNewGeneSetSaveAndStart.bind(this,'newGeneSetName')} primary raised/>
          <Button label='Cancel' onClick={() => this.setState({newGeneStateName:''})} />
        </Dialog>
        <table>
          <tbody>
            <tr>
              <td colSpan={3}>
                Custom Gene Set Name:
                <input
                  onChange={(input) =>
                    this.setState({customGeneSetName:input.target.value})
                  }
                  placeholder={'Custom Gene Set Name'}
                  size={40}
                  style={{marginBottom: 10}}
                  type='text'
                  value={this.state.customGeneSetName}
                />
                <Button
                  floating
                  mini
                  onClick={() => {
                    const gmtFile = this.state.cartPathways.map( c => {
                      return `${c.golabel}\t${c.goid ? c.goid : ' '}\t${c.gene.join(' ')}`
                    }).join('\n')
                    let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(gmtFile)
                    const link = document.createElement('a')
                    link.href = dataStr
                    link.download = this.state.customGeneSetName+'.gmt'
                    link.click()
                  }}
                  raised
                  style={{marginLeft: 20}}
                >
                  <FaDownload /> Download Gene Set
                </Button>
              </td>
            </tr>
            <tr>
              {!this.state.editGeneSet &&
              <td className={BaseStyle.geneSetFilterBox}  width={250}>
                <div style={{fontSize:'larger',fontWeight:'bolder',color: 'black'}}>Available Gene Sets from <br/>'{this.props.view}'</div>
                <table className={BaseStyle.geneSetFilterBox}>
                  <tbody>
                    <tr>
                      <td>
                        <input
                          onChange={(event) => this.setState({name: event.target.value.toLowerCase()})}
                          placeholder='Filter by gene set name' size={30}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <input
                          onChange={(event) => this.setState({geneName: event.target.value.toLowerCase()})}
                          placeholder='Filter by exact gene name' size={30}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        &nbsp;Results: {this.state.totalPathways}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {this.state.selectedFilteredPathways.length} Selected
                <br/>
                <select
                  disabled={this.state.editGeneSet}
                  multiple
                  onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      return opt.value
                    })
                    this.setState({selectedFilteredPathways: selectedEvents})
                  }}
                  style={{overflow: 'scroll', height: 200, width: 300}}
                >
                  {
                    this.state.filteredPathways.slice(0, this.state.limit).map(p => {
                      return (<option key={p.golabel} value={p.golabel}>
                        {p.golabel} ({p.gene.length} genes
                        {this.showScore() &&
                        `, score: ${scorePathway(p, SORT_ENUM.ABS_DIFF)}`
                        }
                        )</option>)
                    })
                  }
                </select>
              </td>
              }
              <td style={{verticalAlign: 'middle',textAlign:'center'}} valign='top' width={85}>
                <Button
                  disabled={this.isCartFull() || this.state.selectedFilteredPathways.length === 0 || this.state.editGeneSet !== undefined}
                  onClick={() => this.handleAddSelectedToCart()}
                >
                  <FaArrowCircleORight style={{verticalAlign:'middle',align:'center',fontSize:'x-large',width: 50}}/>
                  <br/>
                  Add To <br/>
                  Current <br/>
                  View
                </Button>
              </td>
              {!this.state.editGeneSet &&
              <td className={BaseStyle.geneSetFilterBox} valign='top' width={300}>
                <div style={{fontSize:'larger',fontWeight:'bolder',color: 'black'}}>Current Gene Sets</div>
                <select
                  multiple onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      return opt.value
                    })
                    this.setState({selectedCartPathways: selectedEvents})
                  }}
                  style={{overflow: 'scroll', height: 320, width: 300}}
                >
                  {
                    this.state.cartPathways.map(p => {
                      return (<option key={p.golabel} value={p.golabel}>
                        {p.golabel} ({p.gene.length} genes
                        {this.showScore() &&
                        `, score: ${scorePathway(p, SORT_ENUM.ABS_DIFF)}`
                        }
                        )</option>)
                    })
                  }
                </select>
                <br/>
                <Button disabled={this.state.selectedCartPathways.length===0 || this.state.editGeneSet!==undefined} onClick={() => this.handleRemoveSelectedFromCart()} >
                  <FaTrashO  color='orange'/> Remove
                </Button>
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
                                return opt.value
                              })
                              this.setState({ selectedGenesForGeneSet: selectedEvents})
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
                                      this.handleAddGeneToGeneSet(newGene)
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
              {/*<td colSpan={1}/>*/}
              <td colSpan={2}>
                <div style={{marginTop: 10}}>
                  <Button
                    disabled={this.state.editGeneSet !== undefined || !this.state.customGeneSetName}
                    label='Save' mini
                    onClick={() => this.handleViewGeneSets()}
                    primary raised
                  />
                  <Button
                    label='Cancel' mini
                    onClick={() => this.handleCancel()}
                    raised
                  />
                </div>
              </td>
              <td>
                <div style={{marginTop: 10}}>
                  <Button
                    disabled={false}
                    floating
                    mini
                    onClick={() => {
                      if(confirm(`Remove gene sets ${this.state.customGeneSetName}`)){
                        this.props.removeCustomGeneSet(this.state.customGeneSetName)
                      }
                    }}
                    raised
                    style={{marginLeft: 50}}
                  >
                    <FaTrashO  color='orange'/> Delete Gene Set
                  </Button>
                </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    )
  }

}

GeneSetEditorPopup.propTypes = {
  cancelPathwayEdit: PropTypes.any.isRequired,
  customInternalGeneSetName: PropTypes.any,
  getAvailableCustomGeneSets: PropTypes.any.isRequired,
  isNotDefaultGeneSet: PropTypes.any.isRequired,
  pathwayData: PropTypes.array.isRequired,
  pathways: PropTypes.any.isRequired,
  removeCustomGeneSet: PropTypes.any.isRequired,
  setPathways: PropTypes.any.isRequired,
  storeCustomInternalGeneSets: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
