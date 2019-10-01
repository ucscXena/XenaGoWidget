import PureComponent from './PureComponent';
import React from 'react';
import BaseStyle from '../css/base.css';
import FaEdit from 'react-icons/lib/fa/edit';
import FaSort from 'react-icons/lib/fa/sort-alpha-asc';
import FaFilter from 'react-icons/lib/fa/filter';
import {Button} from 'react-toolbox/lib/button';
// import Dropdown from 'react-toolbox/lib/dropdown';
// import {CohortSelector} from "./CohortSelector";
import PropTypes from 'prop-types';
import {convertPathwaysToGeneSetLabel} from '../functions/FetchFunctions';
import { sum } from 'ucsc-xena-client/dist/underscore_ext';
// import DefaultPathWays from '../data/genesets/tgac';
const Rx = require('ucsc-xena-client/dist/rx');
const xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
const {  datasetProbeValues } = xenaQuery;

const DEFAULT_LIMIT = 25 ;

function scorePathway(p) {
  return (100*(p.firstGeneExpressionPathwayActivity + p.secondGeneExpressionPathwayActivity)).toFixed(0);
}

export default class GeneSetFilter extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      limit: DEFAULT_LIMIT,
      name: '',
      sortBy: 'Total',
      geneSet: 'Full 8K',
      loadedPathways: [],
      selectedCohort: [props.pathwayData[0].cohort,props.pathwayData[1].cohort],
      samples: [props.pathwayData[0].samples,props.pathwayData[1].samples],
      // filteredPathways : state.pathways.slice(0,DEFAULT_LIMIT),
      filteredPathways : props.pathways.slice(0,DEFAULT_LIMIT),
      totalPathways: 0,
    };

    let { selectedCohort, samples } = this.state;

    const geneSetLabels = convertPathwaysToGeneSetLabel(this.props.pathways).slice(0,1000);
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
        const loadedPathways = this.props.pathways.map( (pathway,index) => {
          pathway.firstGeneExpressionPathwayActivity = scoredPathwaySamples[0][index];
          pathway.secondGeneExpressionPathwayActivity = scoredPathwaySamples[1][index];
          return pathway ;
        });
        // console.log('scoreed pathways',scoredPathwaySamples,loadedPathways);
        this.setState({
          loadedPathways
        });
      });

  }

  resetGeneSets(){

  }
  viewGeneSets(){

  }

  filterByName(){
    const filteredPathways = this.state.loadedPathways
      .filter( p => ( p.golabel.toLowerCase().indexOf(this.state.name)>=0 ||  (p.goid && p.goid.toLowerCase().indexOf(this.state.name)>=0)))
      .sort( (a,b) => scorePathway(b)-scorePathway(a)) ;

    this.setState({
      filteredPathways: filteredPathways,
      totalPathways: filteredPathways.length
    });
  }

  componentDidUpdate() {
    this.filterByName();
  }

  render() {
    // this.filterByName(this.state.name,this.state.limit);
    return (
      <div className={BaseStyle.geneSetBox}>
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
                <select>
                  <option>Total BPA</option>
                  <option>A - B BPA</option>
                  <option>A-Z</option>
                </select>
              </td>
              <td>
                <FaSort/>
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
            <tr>
              <td>
                <Button
                  label='View' mini
                  onClick={() => this.viewGeneSets}
                  primary raised
                />
                <Button
                  label='Reset' mini
                  onClick={() => this.resetGeneSets}
                  raised
                />
              </td>
            </tr>
          </tbody>
        </table>
        <select disabled multiple style={{overflow:'scroll', height:200,width: 300}}>
          {
            this.state.filteredPathways.map( p => {
              return <option key={p.golabel}>({ (scorePathway(p))}) {p.golabel.substr(0,35)}</option>;
            })
          }
        </select>
      </div>
    );
  }
}

GeneSetFilter.propTypes = {
  pathwayData: PropTypes.array.isRequired,
  pathways: PropTypes.any.isRequired,
};
