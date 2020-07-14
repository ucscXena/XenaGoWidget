import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
// import FaEdit from 'react-icons/lib/fa/edit'
import PropTypes from 'prop-types'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'
import FaRefresh from 'react-icons/lib/fa/refresh'
import {SORT_VIEW_BY} from '../../data/SortEnum'
import FaEdit from 'react-icons/lib/fa/edit'


export class OpenGeneSetRow extends PureComponent {

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
                  <div className={BaseStyle.geneSetLabel}>Gene Sets</div>
                  <input
                    className={BaseStyle.editGeneSetLimits} onChange={(limit) => this.setState({geneSetLimit: limit.target.value})}
                    size={3} type='text'
                    value={this.state.geneSetLimit}/>
                  <button
                    className={BaseStyle.refreshButton}
                    onClick={() => this.props.onChangeGeneSetLimit(this.state.geneSetLimit)}>
                    <FaRefresh/>
                  </button>
                </td>
                <td>
                  <div className={BaseStyle.geneSetLabel}>Find Most</div>
                  <select
                    className={BaseStyle.editGeneSetOrder}
                    onChange={(method) => this.props.onChangeGeneSetSort(method.target.value)}
                    value={this.props.sortGeneSetBy}
                  >
                    {
                      Object.values(SORT_VIEW_BY).map( v =>
                        (<option key={v}>{v}</option>)
                      )
                    }
                  </select>
                </td>
                <td>
                  {/*<div style={{marginTop: 80}}/>*/}
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
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    )
  }
}

OpenGeneSetRow.propTypes = {
  geneSetLimit: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  onChangeGeneSetSort: PropTypes.any.isRequired,
  onGeneEdit: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
}
