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

const DEFAULT_LIMIT = 25 ;

function scorePathway(p) {
  return (p.firstGeneExpressionPathwayActivity + p.secondGeneExpressionPathwayActivity).toFixed(2);
}

export default class GeneSetFilter extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      limit: DEFAULT_LIMIT,
      name: '',
      sortBy: 'Total',
      geneSet: 'Full 8K',
      filteredPathways : props.pathways.slice(0,DEFAULT_LIMIT),
      totalPathways: 0,
    };
  }

  resetGeneSets(){

  }
  viewGeneSets(){

  }

  filterByName(){
    const filteredPathways = this.props.pathways
      .filter( p => ( p.golabel.toLowerCase().indexOf(this.state.name)>=0 ||  p.goid.toLowerCase().indexOf(this.state.name)>=0))
      .sort( (a,b) => scorePathway(b)-scorePathway(a)) ;

    this.setState({
      filteredPathways: filteredPathways.slice(0,this.state.limit),
      totalPathways: filteredPathways.length
    });
  }

  render() {
    this.filterByName(this.state.name,this.state.limit);
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
                  <option>Diff BPA</option>
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
        <select disabled multiple style={{overflow:'scroll', height:200}}>
          {
            this.state.filteredPathways.map( p => {
              return <option key={p.golabel}>( { (scorePathway(p))}) {p.golabel}</option>;
            })
          }
        </select>
      </div>
    );
  }
}

GeneSetFilter.propTypes = {
  pathways: PropTypes.any.isRequired,
};
