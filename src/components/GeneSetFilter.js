import PureComponent from './PureComponent';
import React from 'react';
import BaseStyle from '../css/base.css';
import FaEdit from 'react-icons/lib/fa/edit';
import FaSort from 'react-icons/lib/fa/sort-alpha-asc';
import FaFilter from 'react-icons/lib/fa/filter';
import {Button} from 'react-toolbox/lib/button';
import Dropdown from 'react-toolbox/lib/dropdown';

export default class GeneSetFilter extends PureComponent {

  resetGeneSets(){

  }
  viewGeneSets(){

  }

  render() {
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
                <input size={30}/>
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
      </div>
    );
  }
}
