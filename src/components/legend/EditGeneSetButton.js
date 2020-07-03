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
        <td colSpan={1} width={DETAIL_WIDTH}/>
        <td colSpan={1} width={LABEL_WIDTH}>
          <button
            className={BaseStyle.editGeneSets}
            onClick={() =>this.props.onGeneEdit()}
          >
            <table>
              <tr>
                <td>
                  Gene Sets
                </td>
                <td>
                  <FaEdit style={{fontSize: 'x-large'}}/>
                </td>
              </tr>
            </table>
          </button>
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}/>
      </tr>
    )
  }
}

EditGeneSetButton.propTypes = {
  onGeneEdit: PropTypes.any.require,
}
