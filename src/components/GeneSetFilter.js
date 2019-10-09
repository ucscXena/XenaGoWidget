import PureComponent from './PureComponent';
import React from 'react';
import BaseStyle from '../css/base.css';
import FaEdit from 'react-icons/lib/fa/edit';
import FaSortAsc from 'react-icons/lib/fa/sort-alpha-asc';
import FaSortDesc from 'react-icons/lib/fa/sort-alpha-desc';
import FaFilter from 'react-icons/lib/fa/filter';
import {Button} from 'react-toolbox/lib/button';
// import Dropdown from 'react-toolbox/lib/dropdown';
// import {CohortSelector} from "./CohortSelector";
import PropTypes from 'prop-types';
import {
  convertPathwaysToGeneSetLabel, fetchMeanScores,
  fetchPathwayActivityMeans
} from '../functions/FetchFunctions';
import FaArrowCircleORight from 'react-icons/lib/fa/arrow-circle-o-right';
import FaTrashO from 'react-icons/lib/fa/trash-o';
import update from 'immutability-helper';
import {Chip} from 'react-toolbox';
import LargePathways from '../data/genesets/geneExpressionGeneDataSet';
import {FILTER_ENUM} from "./FilterSelector";
import {
  calculateAllPathways,
  calculateGeneSetExpected,
  calculateObserved,
  calculatePathwayScore
} from "../functions/DataFunctions";

const VIEW_LIMIT = 200;
const CART_LIMIT = 45;

export default class GeneSetFilter extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      name: '',
      sortOrder:'asc',
      sortBy: 'Diff',
      sortCartOrder:'asc',
      sortCartBy: 'Diff',
      geneSet: 'Full 8K',
      loadedPathways: [],
      selectedCohort: [props.pathwayData[0].cohort,props.pathwayData[1].cohort],
      samples: [props.pathwayData[0].samples,props.pathwayData[1].samples],
      // filteredPathways : state.pathways.slice(0,DEFAULT_LIMIT),
      filteredPathways : [],
      cartPathways : [],
      selectedFilteredPathways : [],
      selectedCartPathways : [],
      totalPathways: 0,
      cartPathwayLimit: CART_LIMIT,
      limit: VIEW_LIMIT,
    };


    let { selectedCohort, samples } = this.state;

    // const geneSetLabels = convertPathwaysToGeneSetLabel(LargePathways).slice(0,100);
    const geneSetLabels = convertPathwaysToGeneSetLabel(LargePathways);

    if(this.props.filter[0]===FILTER_ENUM.GENE_EXPRESSION){
      fetchPathwayActivityMeans(selectedCohort,samples,geneSetLabels,this.props.filter,this.handleMeanActivityData);
    }
    // TODO: make a more generic version to share with all
    if(this.props.filter[0]===FILTER_ENUM.COPY_NUMBER && this.props.filter[1]===FILTER_ENUM.COPY_NUMBER){
      // fetchPathwayActivityMeans(selectedCohort,samples,geneSetLabels,this.props.filter,this.handleMeanActivityData);
      fetchMeanScores(selectedCohort,samples,geneSetLabels,this.props.filter,this.handleMeanScores);
    }
    else{
      fetchMeanScores(selectedCohort,samples,geneSetLabels,this.props.filter,this.handleMeanScores);
    }

  }


  componentDidUpdate() {
    this.filterByName();
  }

  handleMeanScores = (pathwayData) => {
    console.log('handling mean scores',pathwayData)
    let loadedPathways = JSON.parse(JSON.stringify(LargePathways));
    pathwayData[0].pathways = loadedPathways;
    pathwayData[1].pathways = loadedPathways;

    let indexMap = {};
    loadedPathways.forEach( (p,index) => {
      indexMap[p.golabel] = index ;
    });
    console.log('starting calcs')

    const observationsA = calculateObserved(pathwayData[0], pathwayData[0].filter);
    const totalsA = calculatePathwayScore(pathwayData[0], pathwayData[0].filter);
    const expectedA = calculateGeneSetExpected(pathwayData[0], pathwayData[0].filter);
    const maxSamplesAffectedA = pathwayData[0].samples.length;

    console.log(observationsA,totalsA,expectedA,maxSamplesAffectedA)

    const observationsB = calculateObserved(pathwayData[1], pathwayData[1].filter);
    const totalsB = calculatePathwayScore(pathwayData[1], pathwayData[1].filter);
    const expectedB = calculateGeneSetExpected(pathwayData[1], pathwayData[1].filter);
    const maxSamplesAffectedB = pathwayData[1].samples.length;

    console.log(observationsB,totalsB,expectedB,maxSamplesAffectedB)

    // console.log('calculating ALL pathways')
    // let pathways = calculateAllPathways(output)
    // console.log('output pathwyas',pathways)


    for(let index in pathwayData.scoresA.field){
      const field = pathwayData.scoresA.field[index];
      const cleanField = field.indexOf(' (GO:') < 0 ? field :  field.substr(0,field.indexOf('GO:')-1).trim();
      const sourceIndex = indexMap[cleanField];
      loadedPathways[sourceIndex].firstScore = pathwayData.scoresA.mean[index];
      loadedPathways[sourceIndex].secondScore = pathwayData.scoresB.mean[index];
    }

    const pathwayLabels = this.props.pathways.map( p => p.golabel);
    const cartPathways = loadedPathways.filter( p =>  pathwayLabels.indexOf(p.golabel)>=0 );

    this.setState({
      loadedPathways,
      cartPathways,
    });
  };

  handleMeanActivityData = (output) => {
    let loadedPathways = JSON.parse(JSON.stringify(LargePathways));

    let indexMap = {};
    LargePathways.forEach( (p,index) => {
      indexMap[p.golabel] = index ;
    });

    for(let index in output.scoresA.field){
      const field = output.scoresA.field[index];
      const cleanField = field.indexOf(' (GO:') < 0 ? field :  field.substr(0,field.indexOf('GO:')-1).trim();
      const sourceIndex = indexMap[cleanField];
      loadedPathways[sourceIndex].firstScore = output.scoresA.mean[index];
      loadedPathways[sourceIndex].secondScore = output.scoresB.mean[index];
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
      return (p.firstScore + p.secondScore).toFixed(2);
    default:
    case 'Diff':
      return (p.firstScore - p.secondScore).toFixed(2);
    }
  }

  scorePathway(p) {
    switch (this.state.sortBy) {
    case 'Total':
      return (p.firstScore + p.secondScore).toFixed(2);
    default:
    case 'Diff':
      return (p.firstScore - p.secondScore).toFixed(2);
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


  handleClearCart() {
    this.setState({cartPathways:[]});
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

  render() {
    // this.filterByName(this.state.name,this.state.limit);
    return (
      <div className={BaseStyle.geneSetBox}>
        <table>
          <tbody>
            <tr>
              <td width={200}>
                <table className={BaseStyle.geneSetFilterBox}>
                  <tbody>
                    <tr>
                      <td>
                        <select>
                          <option>Full 8K</option>
                          <option>Default Gene Set (42)</option>
                          <option>Flybase</option>
                        </select>
                      </td>
                      <td>
                        <FaEdit/>
                      </td>
                    </tr>
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
                {this.state.selectedFilteredPathways.length} Selected
                <select
                  multiple
                  onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      return opt.value;
                    });
                    this.setState({ selectedFilteredPathways: selectedEvents});
                  }} style={{overflow:'scroll', height:200,width: 300}}
                >
                  {
                    this.state.filteredPathways.slice(0,this.state.limit).map( p => {
                      return <option key={p.golabel} value={p.golabel}>({ (this.scorePathway(p))}, N: {p.gene.length}) {p.golabel.substr(0,35)}</option>;
                    })
                  }
                </select>
              </td>
              <td width={100}>
                <Button onClick={() => this.handleAddSelectedToCart()}>
                  <FaArrowCircleORight/> Select
                </Button>
                <hr/>
                <Button onClick={() => this.handleRemoveSelectedFromCart()}>
                  {/*<FaArrowCircleOLeft/>*/}
                  <FaTrashO  color='orange'/> Deselect
                </Button>
                <Button onClick={() => this.handleClearCart()}>
                  <FaTrashO color='red'/> Clear All
                </Button>
              </td>
              <td width={200}>
                <table>
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
                          { this.state.sortCartOrder === 'asc' &&
                    <FaSortAsc onClick={() => this.setState({sortCartOrder:'desc'})}/>
                          }
                          { this.state.sortCartOrder === 'desc' &&
                    <FaSortDesc onClick={() => this.setState({sortCartOrder:'asc'})}/>
                          }
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Cart Limit
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
                <br/>
                <select
                  multiple onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      return opt.value;
                    });
                    this.setState({ selectedCartPathways: selectedEvents});
                  }}
                  style={{overflow:'scroll',height: 300}}
                >
                  {
                    this.state.cartPathways.sort( (a,b) =>{
                      switch (this.state.sortCartBy) {
                      case 'Total':
                      case 'Diff':
                        return (this.state.sortCartOrder === 'asc' ? 1 : -1) * (this.scoreCartPathway(b) - this.scoreCartPathway(a));
                      case 'Alpha':
                        return (this.state.sortCartOrder === 'asc' ? 1 : -1) * (a.golabel.toLowerCase()).localeCompare(b.golabel.toLowerCase());
                      }
                    }).map( p => {
                      return <option key={p.golabel} value={p.golabel}>({ (this.scoreCartPathway(p))}, N: {p.gene.length}) {p.golabel.substr(0,35)}</option>;
                    })
                  }
                </select>
              </td>
            </tr>
            <tr>
              <td>
                <Button
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
  filter: PropTypes.array.isRequired,
  pathwayData: PropTypes.array.isRequired,
  pathways: PropTypes.any.isRequired,
  setPathways: PropTypes.any.isRequired,
};
