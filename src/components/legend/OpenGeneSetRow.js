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
      sortGeneSetByLabel: props.sortGeneSetBy+ ' Gene Sets',
    }
  }

  render() {

    console.log('OGSR props',this.props.selectedGeneSets)

    return (
      <tr className={BaseStyle.openGeneSetRow} >
        <td colSpan={3} width={DETAIL_WIDTH+LABEL_WIDTH+DETAIL_WIDTH}>
          <table>
            <tbody>
              <tr style={{height: 30}}>
                <td style={{height: 30}}>
                  <div className={BaseStyle.findNewGeneSets}
                  >
                    {/*<div className={BaseStyle.editGeneSetSearch}>Find</div>*/}
                    <button
                      className={BaseStyle.refreshButton}
                      onClick={() => this.props.onChangeGeneSetLimit(
                        this.state.geneSetLimit,
                        this.state.sortGeneSetBy,
                        this.state.selectedGeneSets
                      )
                      }>
                      Find <FaSearch/>
                    </button>
                    <div className={BaseStyle.editGeneSetSearch}>the</div>
                    <input
                      className={BaseStyle.editGeneSetLimits} onChange={(limit) => this.setState({geneSetLimit: limit.target.value})}
                      size={3} type='text'
                      value={this.state.geneSetLimit}/>
                    <div className={BaseStyle.editGeneSetSearch}>most</div>
                    <select
                      className={BaseStyle.editGeneSetOrder}
                      onChange={(method) => {
                        this.setState({
                          sortGeneSetBy: method.target.options[method.target.options.selectedIndex].getAttribute('data-key'),
                          sortGeneSetByLabel: method.target.value
                        })
                      }}
                      value={this.state.sortGeneSetByLabel}
                    >
                      {
                        Object.values(SORT_VIEW_BY).map( v =>
                          (<option data-key={v} key={v}>{v} Gene Sets</option>)
                        )
                      }
                    </select>
                    <div className={BaseStyle.editGeneSetSearch}>in </div>
                    <select
                      className={BaseStyle.geneSetSelector}
                      onChange={(event) => this.props.setGeneSetsOption(event.target.value)}
                      value={this.props.selectedGeneSets}
                    >
                      <option>Default Gene Sets</option>
                      <option>----Custom Gene Sets----</option>
                      {
                        Object.keys(this.props.customGeneSets).map( gs => {
                          return <option key={gs}>{gs}</option>
                        })
                      }
                    </select>
                    <button
                      className={BaseStyle.editGeneSets}
                      onClick={() =>this.props.onGeneEdit()}
                    >
                      <FaPlus style={{fontSize: 'small'}}/>
                    </button>
                    <button
                      className={BaseStyle.editGeneSets}
                      disabled={!this.props.isCustomGeneSet(this.props.selectedGeneSets)}
                      onClick={() =>this.props.onGeneEdit(this.props.selectedGeneSets.trim())}
                    >
                      <FaEdit style={{fontSize: 'small'}}/>
                    </button>
                  </div>
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
  customGeneSets: PropTypes.any,
  geneSetLimit: PropTypes.any.isRequired,
  isCustomGeneSet: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  onGeneEdit: PropTypes.any.isRequired,
  selectedGeneSets: PropTypes.any,
  setActiveGeneSets: PropTypes.any.isRequired,
  setGeneSetsOption: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
}
