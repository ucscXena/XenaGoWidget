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
import {convertPathwaysToGeneSetLabel} from '../functions/FetchFunctions';
import { sum } from 'ucsc-xena-client/dist/underscore_ext';
import FaArrowCircleORight from 'react-icons/lib/fa/arrow-circle-o-right';
import FaTrashO from 'react-icons/lib/fa/trash-o';
import update from 'immutability-helper';
import {Chip} from 'react-toolbox';
// import DefaultPathWays from '../data/genesets/tgac';
const Rx = require('ucsc-xena-client/dist/rx');
const xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
const {  datasetProbeValues } = xenaQuery;
import LargePathways from '../data/genesets/geneExpressionGeneDataSet';

const DEFAULT_LIMIT = 45;

export default class GeneSetFilter extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      limit: DEFAULT_LIMIT,
      name: '',
      sortOrder:'asc',
      sortBy: 'Total',
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
    };


    let { selectedCohort, samples } = this.state;

    const geneSetLabels = convertPathwaysToGeneSetLabel(this.props.pathways).slice(0,100);
    // const geneSetLabels = convertPathwaysToGeneSetLabel(this.props.pathways);

    console.log('query with',samples[0].length,samples[1].length,geneSetLabels.length);

    Rx.Observable.zip(
      datasetProbeValues(selectedCohort[0].geneExpressionPathwayActivity.host, selectedCohort[0].geneExpressionPathwayActivity.dataset, samples[0], geneSetLabels),
      datasetProbeValues(selectedCohort[1].geneExpressionPathwayActivity.host, selectedCohort[1].geneExpressionPathwayActivity.dataset, samples[1], geneSetLabels),
      (
        geneExpressionPathwayActivityA, geneExpressionPathwayActivityB
      ) => ({
        geneExpressionPathwayActivityA,
        geneExpressionPathwayActivityB,
      }),
    )
      .subscribe( (output ) => {
        // get the average activity for each
        const scoredPathwaySamples = [
          output.geneExpressionPathwayActivityA[1].map( p => sum(p.map( f => isNaN(f) ? 0 : f ))/p.length),
          output.geneExpressionPathwayActivityB[1].map( p => sum(p.map( f => isNaN(f) ? 0 : f ))/p.length),
        ];
        const loadedPathways = LargePathways.map( (pathway,index) => {
          pathway.firstGeneExpressionPathwayActivity = scoredPathwaySamples[0][index];
          pathway.secondGeneExpressionPathwayActivity = scoredPathwaySamples[1][index];
          return pathway ;
        });
        // console.log('scoreed pathways',scoredPathwaySamples,loadedPathways);
        const pathwayLabels = props.pathways.map( p => p.golabel)
        const cartPathways = loadedPathways.filter( p =>  pathwayLabels.indexOf(p.golabel)>=0 );
        // cart pathways are loaded pathways related to

        this.setState({
          loadedPathways,
          cartPathways,
        });
      });

  }

  componentDidUpdate() {
    this.filterByName();
  }

  scorePathway(p) {
    switch (this.state.sortBy) {
    default:
    case 'Total':
      return (100*(p.firstGeneExpressionPathwayActivity + p.secondGeneExpressionPathwayActivity)).toFixed(0);
    case 'Diff':
      return (100*(p.secondGeneExpressionPathwayActivity - p.firstGeneExpressionPathwayActivity)).toFixed(0);
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


  handleAddSelectedToCart() {
    console.log('adding to cart',this.state.selectedFilteredPathways, this.state.cartPathways);

    // find filteredPathways from each selectedFilter
    const selectedFilteredPathways = this.state.filteredPathways
      .filter( f => this.state.selectedFilteredPathways.indexOf(f.golabel)>=0 )
      .filter( f => this.state.cartPathways.indexOf(f)<0 );
    const cartPathways = update(this.state.cartPathways, {
      $push: selectedFilteredPathways
    });
    this.setState({
      cartPathways
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
    this.props.setPathways(this.state.cartPathways);
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
                          <option value='Total'>Total BPA</option>
                          <option value='Diff'>A - B BPA</option>
                          <option value='Alpha'>A-Z</option>
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
                    Limit (Tot: {this.state.totalPathways})
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
                <select
                  multiple
                  onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      console.log('input change',opt);
                      return opt.value;
                    });
                    this.setState({ selectedFilteredPathways: selectedEvents});
                  }} style={{overflow:'scroll', height:200,width: 300}}
                >
                  {
                    this.state.filteredPathways.map( p => {
                      return <option key={p.golabel} value={p.golabel}>({ (this.scorePathway(p))}) {p.golabel.substr(0,35)}</option>;
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
                <Chip>{this.state.cartPathways.length}</Chip>
                <br/>
                <select
                  multiple onChange={(event) => {
                    const selectedEvents = Array.from(event.target.selectedOptions).map(opt => {
                      console.log('input change',opt);
                      return opt.value;
                    });
                    this.setState({ selectedCartPathways: selectedEvents});
                  }}
                  style={{overflow:'scroll',height: 300}}
                >
                  {
                    this.state.cartPathways.sort( (a,b) =>{
                      const compareString = b.golabel.toLowerCase();
                      return (a.golabel.toLowerCase()).localeCompare(compareString);
                    }).map( p => {
                      return <option key={p.golabel} value={p.golabel}>({ (this.scorePathway(p))}) {p.golabel.substr(0,35)}</option>;
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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

}

GeneSetFilter.propTypes = {
  pathwayData: PropTypes.array.isRequired,
  pathways: PropTypes.any.isRequired,
  setPathways: PropTypes.any.isRequired,
};
