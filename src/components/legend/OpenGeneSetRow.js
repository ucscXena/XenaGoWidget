import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import PropTypes from 'prop-types'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'
import {SORT_VIEW_BY} from '../../data/SortEnum'
import FaEdit from 'react-icons/lib/fa/edit'
import FaSearch from 'react-icons/lib/fa/search'


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
                <td colSpan={2}>
                  <div className={BaseStyle.findNewGeneSets}
                  >

                    <div className={BaseStyle.editGeneSetSearch}>Find</div>
                    <input
                      className={BaseStyle.editGeneSetLimits} onChange={(limit) => this.setState({geneSetLimit: limit.target.value})}
                      size={3} type='text'
                      value={this.state.geneSetLimit}/>
                    <div className={BaseStyle.editGeneSetSearch}>Most</div>
                    <select
                      className={BaseStyle.editGeneSetOrder}
                      onChange={(method) => this.setState({sortGeneSetBy: method.target.value})}
                      value={this.state.sortGeneSetBy}
                    >
                      {
                        Object.values(SORT_VIEW_BY).map( v =>
                          (<option key={v}>{v}</option>)
                        )
                      }
                    </select>
                    <div className={BaseStyle.editGeneSetSearch}>Gene Sets</div>
                    <button
                      className={BaseStyle.refreshButton}
                      onClick={() => this.props.onChangeGeneSetLimit(this.state.geneSetLimit,this.state.sortGeneSetBy)}>
                      Find <FaSearch/>
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    className={BaseStyle.editGeneSets}
                    onClick={() =>this.props.onGeneEdit()}
                  >
                    <FaEdit style={{fontSize: 'large'}}/>
                  </button>
                </td>
                <td>
                  <select onChange={ (event) => alert('changed'+event.target.value)}>
                    <option>BP Gene Set</option>
                    <option>MF Gene Set</option>
                    <option>CC Gene Set</option>
                    <option>+ Create custom gene set</option>
                    <option>----Custom Gene Sets----</option>
                    <option>&nbsp;&nbsp;&nbsp;Gene Set 1</option>
                    <option>&nbsp;&nbsp;&nbsp;Gene Set 2</option>
                    <option>&nbsp;&nbsp;&nbsp;Gene Set 3</option>
                  </select>
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
  onGeneEdit: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
}
