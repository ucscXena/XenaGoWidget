import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import FaEdit from 'react-icons/lib/fa/edit'
import PropTypes from 'prop-types'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'


export class EditGeneSetButton extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      geneSetLimit : props.geneSetLimit,
      sortGeneSetBy : props.sortGeneSetBy
    }
  }

  render() {
    return (
      <tr className={BaseStyle.geneLegend} >
        <td colSpan={3} width={DETAIL_WIDTH+LABEL_WIDTH+DETAIL_WIDTH}>
          <table>
            <tbody>
              <tr>
                <td>
                  <div className={BaseStyle.geneSetLabel}>Max Gene Sets</div>
                  <input className={BaseStyle.editGeneSetLimits} size={3} type='text' value={this.state.geneSetLimit}/>
                </td>
                <td>
                  <div className={BaseStyle.geneSetLabel}>Find Most</div>
                  [ {this.state.sortGeneSetBy} ]
                  <select className={BaseStyle.editGeneSetOrder}>
                    <option>Similar</option>
                    <option>Different</option>
                  </select>
                </td>
                <td>
                  <button
                    className={BaseStyle.editGeneSets}
                    onClick={() =>this.props.onGeneEdit()}
                  >
                    <table>
                      <tbody>
                        <tr>
                          <td>
                  Gene Sets
                          </td>
                          <td>
                            <FaEdit style={{fontSize: 'x-large'}}/>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
        {/*<td colSpan={1} width={DETAIL_WIDTH}/>*/}
      </tr>
    )
  }
}

EditGeneSetButton.propTypes = {
  geneSetLimit: PropTypes.any.require,
  onGeneEdit: PropTypes.any.require,
  sortGeneSetBy: PropTypes.any.require,
}
