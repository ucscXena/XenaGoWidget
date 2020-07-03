import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import FaEdit from 'react-icons/lib/fa/edit'
import PropTypes from 'prop-types'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'


export class EditGeneSetButton extends PureComponent {

  render() {
    return (
      <tr className={BaseStyle.geneLegend} >
        <td colSpan={3} width={DETAIL_WIDTH+LABEL_WIDTH+DETAIL_WIDTH}>
          {/*<td colSpan={1} width={DETAIL_WIDTH}/>*/}
          {/*<td colSpan={1} width={LABEL_WIDTH}>*/}
          <table>
            <tbody>
              <tr>
                <td>
                  <div className={BaseStyle.geneSetLabel}>Max Gene Sets</div>
                  <input className={BaseStyle.editGeneSetLimits} size={3} type='text' value={12}/>
                </td>
                <td>
                  <div className={BaseStyle.geneSetLabel}>Sort By </div>
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
  onGeneEdit: PropTypes.any.require,
}
