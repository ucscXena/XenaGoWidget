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

export default class GeneSetFilter extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      limit: 25,
      sortBy: 'Total',
      geneSet: 'Full 8K',
      filteredPathways : props.pathways
    };
  }

  resetGeneSets(){

  }
  viewGeneSets(){

  }

  filterByName(name){
    console.log('filter by name ',name);
    console.log('filter pathway props',this.props.pathways);
    const filteredPathways = this.props.pathways.filter( p => ( p.golabel.indexOf(name)>=0 ||  p.goid.indexOf(name)>=0));
    this.setState({
      filteredPathways
    });
    console.log('filtered pathwyas',filteredPathways);
  }

  render() {

    console.log('props',this.props.pathways);
    return (
      <div>
        <table className={BaseStyle.verticalLegendBox}>
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
                <input onChange={(event) => this.filterByName(event.target.value)} size={30}/>
              </td>
              <td>
                <FaFilter/>
              </td>
            </tr>
            <tr>
              <td>
                Limit
              </td>
              <td>
                <input  style={{width: 25}}  />
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
        <ul>
          {
            this.state.filteredPathways.map( p => {
              return <li key={p.golabel}>{p.golabel}</li>;
            })
          }
        </ul>
      </div>
    );
  }
}

GeneSetFilter.propTypes = {
  pathways: PropTypes.any.isRequired,
};
