import PureComponent from './PureComponent'
import React from 'react'
import BaseStyle from '../css/base.css'
import PropTypes from 'prop-types'
import {SORT_VIEW_BY} from '../data/SortEnum'
import FaSearch from 'react-icons/lib/fa/search'
import FaPlus from 'react-icons/lib/fa/plus'
import FaUpload from 'react-icons/lib/fa/upload'
import FaEdit from 'react-icons/lib/fa/edit'


export default class GeneSetEditorComponent extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      geneSetLimit: props.geneSetLimit,
      sortGeneSetBy: props.sortGeneSetBy,
      selectedGeneSets: props.selectedGeneSets,
    }

  }

  render() {

    return (
      <div className={BaseStyle.findNewGeneSets}
      >
        {/*<div className={BaseStyle.editGeneSetSearch}>Find</div>*/}
        <button
          className={BaseStyle.refreshButton}
          onClick={() => this.props.onChangeGeneSetLimit(
            this.state.geneSetLimit,
            this.state.sortGeneSetBy,
            this.props.selectedGeneSets,
            true,
          )
          }>
          Find <FaSearch/>
        </button>
        <div className={BaseStyle.editGeneSetSearch}>the</div>
        <input
          className={BaseStyle.editGeneSetLimits} onChange={(limit) => {
            this.setState({geneSetLimit: limit.target.value})
            this.props.onChangeGeneSetLimit(limit.target.value,this.state.sortGeneSetBy,this.props.selectedGeneSets,false)
          }}
          size={3} type='text'
          value={this.state.geneSetLimit}/>
        <div className={BaseStyle.editGeneSetSearch}>most</div>
        <select
          className={BaseStyle.editGeneSetOrder}
          onChange={(method) => {
            const sortBy = method.target.options[method.target.options.selectedIndex].getAttribute('data-key')
            this.setState({
              sortGeneSetBy: sortBy,
              sortGeneSetByLabel: method.target.value
            })
            this.props.onChangeGeneSetLimit(this.state.geneSetLimit,sortBy,this.props.selectedGeneSets,false)
          }}
          value={`${this.state.sortGeneSetBy} Gene Sets`}
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
          {/*<option>----Custom Gene Sets----</option>*/}
          {
            this.props.customGeneSets.map( gs => {
              return <option key={gs.name} value={gs.name}>({gs.geneCount}) {gs.name}</option>
            })
          }
        </select>
        <button
          className={BaseStyle.editGeneSets}
          onClick={() =>this.props.handleGeneEdit()}
        >
          <FaPlus style={{fontSize: 'small'}}/>
        </button>
        <button
          className={BaseStyle.editGeneSets}
          disabled={!this.props.isCustomGeneSet(this.props.selectedGeneSets)}
          onClick={() =>this.props.handleGeneEdit(this.props.selectedGeneSets.trim())}
        >
          <FaEdit style={{fontSize: 'small'}}/>
        </button>
        <button
          className={BaseStyle.editGeneSets}
          onClick={() =>this.props.handleGeneSetUpload()}
        >
          <FaUpload style={{fontSize: 'small'}}/>
        </button>
      </div>
    )
  }

}

GeneSetEditorComponent.propTypes = {
  customGeneSets: PropTypes.any.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  handleGeneEdit: PropTypes.any.isRequired,
  handleGeneSetUpload: PropTypes.any.isRequired,
  isCustomGeneSet: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  selectedGeneSets: PropTypes.any,
  setGeneSetsOption: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
}
