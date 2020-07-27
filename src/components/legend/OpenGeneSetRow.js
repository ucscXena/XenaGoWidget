import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import PropTypes from 'prop-types'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'
import {SORT_VIEW_BY} from '../../data/SortEnum'
import FaSearch from 'react-icons/lib/fa/search'
import FaEdit from 'react-icons/lib/fa/edit'
import FaPlus from 'react-icons/lib/fa/plus'


export class OpenGeneSetRow extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      geneSetLimit : props.geneSetLimit,
      sortGeneSetBy : props.sortGeneSetBy,
      selectedGeneSet: 'BPA Gene Set Analysis',
    }
  }

  handleGeneSetOption(value){
    console.log('input value',value)
    this.setState({
      selectedGeneSet: value
    })

    // if(value.indexOf('Create custom gene set')>=0){
    // }
    // else{
    //   console.log('adding input ',value)
    // }
  }

  render() {
    return (
      <tr className={BaseStyle.geneLegend} >
        <td colSpan={3} width={DETAIL_WIDTH+LABEL_WIDTH+DETAIL_WIDTH}>
          <table>
            <tbody>
              <tr>
                <td width={400}>
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
                  <select
                    className={BaseStyle.geneSetSelector}
                    onChange={(event) => this.handleGeneSetOption(event.target.value)}
                    value={this.state.selectedGeneSet}
                  >
                    <option>BPA Gene Set Analysis</option>
                    <option>BP Gene Set</option>
                    <option>MF Gene Set</option>
                    <option>CC Gene Set</option>
                    <option>----Custom Gene Sets----</option>
                    <option>&nbsp;&nbsp;&nbsp;Custom Gene Set 1</option>
                    <option>&nbsp;&nbsp;&nbsp;Custom Gene Set 2</option>
                    <option>&nbsp;&nbsp;&nbsp;Custom Gene Set 3</option>
                  </select>
                </td>
                <td style={{paddingTop: 30}}>
                  <button
                    className={BaseStyle.editGeneSets}
                    onClick={() =>this.props.onGeneEdit()}
                  >
                    <FaPlus style={{fontSize: 'large'}}/>
                  </button>
                  <button
                    className={BaseStyle.editGeneSets}
                    disabled={this.state.selectedGeneSet.indexOf('Custom')<0}
                    onClick={() =>this.props.onGeneEdit(this.state.selectedGeneSet.trim())}
                  >
                    <FaEdit style={{fontSize: 'large'}}/>
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
  onGeneEdit: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
}
