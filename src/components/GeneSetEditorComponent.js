import PureComponent from './PureComponent'
import React from 'react'
import BaseStyle from '../css/base.css'
import PropTypes from 'prop-types'
import {SORT_VIEW_BY} from '../data/SortEnum'
import FaSearch from 'react-icons/lib/fa/arrow-circle-right'
import FaPlus from 'react-icons/lib/fa/plus'
import FaUpload from 'react-icons/lib/fa/upload'
import FaMinus from 'react-icons/lib/fa/minus'
import FaEdit from 'react-icons/lib/fa/edit'

export const DEFAULT_GENE_SETS = 'Default Gene Sets'

export default class GeneSetEditorComponent extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      geneSetLimit: props.geneSetLimit,
      sortGeneSetBy: props.sortGeneSetBy,
      selectedGeneSets: props.selectedGeneSets,
    }
  }


  isNotCustomInternalGeneSet(selectedGeneSets) {
    return this.props.customInternalGeneSets[this.props.view][selectedGeneSets]!==undefined
  }

  render() {

    return (
      <div className={BaseStyle.findNewGeneSets}
      >
        <button
          className={BaseStyle.editGeneSets}
          onClick={() =>this.props.handleGeneSetEdit()}
        >
          <FaPlus style={{fontSize: 'small'}}/>
        </button>
        <button
          className={BaseStyle.editGeneSets}
          disabled={!this.isNotCustomInternalGeneSet(this.props.selectedGeneSets)}
          onClick={() =>this.props.handleGeneSetEdit(this.props.selectedGeneSets.trim())}
        >
          <FaEdit style={{fontSize: 'small'}}/>
        </button>
        <button
          className={BaseStyle.editGeneSets}
          disabled={!this.props.isNotCustomDefaultGeneSet(this.props.selectedGeneSets)}
          onClick={() =>this.props.handleGeneSetDelete(this.props.selectedGeneSets.trim())}
        >
          <FaMinus style={{fontSize: 'small'}}/>
        </button>
        <button
          className={BaseStyle.editGeneSets}
          onClick={() =>this.props.handleGeneSetUpload()}
        >
          <FaUpload style={{fontSize: 'small'}}/>
        </button>
        <div className={BaseStyle.editGeneSetSearch}><u>Gene Set</u>:</div>
        <select
          className={BaseStyle.geneSetSelector}
          onChange={(event) => this.props.setGeneSetsOption(event.target.value)}
          value={this.props.selectedGeneSets}
        >
          <option>(8281) {DEFAULT_GENE_SETS}</option>
          {/*<option>----Custom Internal Gene Sets----</option>*/}
          {
            this.props.customInternalGeneSets[this.props.view] &&
            Object.entries(this.props.customInternalGeneSets[this.props.view]).map ( gs => {
              return <option key={gs[1].geneset} value={gs[1].geneset}>local ({gs[1].result.length}) {gs[1].geneset}</option>
            })
          }
          {/*<option>----Custom Server Gene Sets----</option>*/}
          {
            this.props.customServerGeneSets.map(gs => {
              if(gs.ready){
                return <option key={gs.name} value={gs.name}>server ({gs.geneCount}) {gs.name}</option>
              }
              else{
                // note: geneCount is the GeneSetCount
                return (<option disabled key={gs.name} value={gs.name}>
                  Analyzing ( {gs.readyCount} of {gs.availableCount } ready ) –
                  ({gs.geneCount}) {gs.name}
                </option>)
              }
            })
          }
        </select>
        <div className={BaseStyle.editGeneSetSearch}>Limit:</div>
        <input
          className={BaseStyle.editGeneSetLimits} onChange={(limit) => {
            this.setState({geneSetLimit: limit.target.value})
            this.props.onChangeGeneSetLimit(limit.target.value,this.state.sortGeneSetBy,this.props.selectedGeneSets,false)
          }}
          size={3} type='text'
          value={this.state.geneSetLimit}/>
        <div className={BaseStyle.editGeneSetSearch}>Filter:</div>
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
        <button
          className={BaseStyle.refreshButton}
          onClick={() => this.props.onChangeGeneSetLimit(
            this.state.geneSetLimit,
            this.state.sortGeneSetBy,
            this.props.selectedGeneSets,
            true,
          )
          }>
                Fetch Results <FaSearch/>
        </button>
      </div>
    )
  }

}

GeneSetEditorComponent.propTypes = {
  customInternalGeneSets: PropTypes.any.isRequired,
  customServerGeneSets: PropTypes.any.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  handleGeneSetDelete: PropTypes.any.isRequired,
  handleGeneSetEdit: PropTypes.any.isRequired,
  handleGeneSetUpload: PropTypes.any.isRequired,
  isCustomServerGeneSet: PropTypes.any.isRequired,
  isNotCustomDefaultGeneSet: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  selectedGeneSets: PropTypes.any,
  setGeneSetsOption: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
