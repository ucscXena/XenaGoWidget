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
import {isViewGeneExpression, showXenaViewLink} from '../functions/DataFunctions'
import Tooltip from 'react-toolbox/lib/tooltip'
import Button from 'react-bootstrap/lib/Button'


export const DEFAULT_GENE_SETS = 'Default Gene Sets'

export default class GeneSetEditorComponent extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      geneSetLimit: props.geneSetLimit,
      sortGeneSetBy: props.sortGeneSetBy,
      selectedGeneSets: props.selectedGeneSets,
      view: props.view,
    }
  }


  isNotCustomInternalGeneSet(selectedGeneSets) {
    return this.props.customInternalGeneSets[this.state.view][selectedGeneSets]!==undefined
  }

  isNotEditable(){

    if(this.props.isCustomServerGeneSet(this.props.selectedGeneSets)){
      return this.props.profile === undefined
    }
    return !this.isNotCustomInternalGeneSet(this.props.selectedGeneSets)
  }

  changeView = (view,profile) => {
    this.setState( { view})
    this.props.getAvailableCustomGeneSets(view,profile)
  }

  render() {

    const ToolTipButton = Tooltip(Button)

    return (
      <div className={BaseStyle.findNewGeneSets}
      >
        <button
          className={BaseStyle.refreshButton}
          onClick={() => this.props.onChangeGeneSetLimit(
            this.state.geneSetLimit,
            this.state.sortGeneSetBy,
            this.props.selectedGeneSets,
            true,
            this.state.view,
          )
          }>
          Fetch Results <FaSearch/>
        </button>
        <u style={{margin: 5}}>Analysis:</u>
        <select
          onChange={(event) => this.changeView( event.target.value,this.props.profile)}
          value={this.state.view}
        >
          {
            Object.entries(this.props.allowableViews).map(f => {
              return (
                <option key={f[1]} value={f[1]}>{f[1]}</option>
              )
            })
          }
        </select>
        { isViewGeneExpression(this.state.view) && <div className={BaseStyle.editGeneSetSearch}><u>Gene Set</u>:</div> }
        {isViewGeneExpression(this.state.view) &&
        <select
          className={BaseStyle.geneSetSelector}
          onChange={(event) => this.props.setGeneSetsOption(event.target.value)}
          value={this.props.selectedGeneSets}
        >
          <option>public (8281) {DEFAULT_GENE_SETS}</option>
          {/*<option>----Custom Internal Gene Sets----</option>*/}
          {
            this.props.customInternalGeneSets[this.props.view] &&
            Object.entries(this.props.customInternalGeneSets[this.props.view]).map(gs => {
              return (<option key={gs[1].geneset} value={gs[1].geneset}>local
                ({gs[1].result.length}) {gs[1].geneset}</option>)
            })
          }
          {/*<option>----Custom Server Gene Sets----</option>*/}
          {
            this.props.customServerGeneSets.map(gs => {
              if (gs.ready) {
                return (<option
                  key={gs.name}
                  value={gs.name}>{gs.public ? 'public' : gs.user} ({gs.geneCount}) {gs.name}</option>)
              } else {
                // note: geneCount is the GeneSetCount
                return (<option disabled key={gs.name} value={gs.name}>
                  Analyzing ( {gs.readyCount} of {gs.availableCount} ready ) –
                  ({gs.geneCount}) {gs.name}
                </option>)
              }
            })
          }
        </select>
        }
        {isViewGeneExpression(this.state.view) &&
        <ToolTipButton
          className={BaseStyle.editGeneSets}
          onClick={() =>this.props.handleGeneSetEdit()}
          tooltip={'Add local gene set'}
        >
          <FaPlus style={{fontSize: 'small'}}/>
        </ToolTipButton>
        }
        { isViewGeneExpression(this.state.view) && this.isNotCustomInternalGeneSet(this.props.selectedGeneSets) &&
        <ToolTipButton
          className={BaseStyle.editGeneSets}
          onClick={() =>this.props.handleGeneSetEdit(this.props.selectedGeneSets.trim())}
          tooltip={'Edit local gene set'}
        >
          <FaEdit style={{fontSize: 'small'}}/>
        </ToolTipButton>
        }
        {isViewGeneExpression(this.state.view) && !this.isNotEditable() &&
        <ToolTipButton
          className={BaseStyle.editGeneSets}
          onClick={() => this.props.handleGeneSetDelete(this.props.selectedGeneSets.trim())}
          tooltip={'Remove gene set'}
        >
          <FaMinus style={{fontSize: 'small'}}/>
        </ToolTipButton>
        }
        { isViewGeneExpression(this.state.view) && showXenaViewLink(this.props.view) && this.props.profile &&
          <ToolTipButton
            className={BaseStyle.editGeneSets}
            onClick={() => this.props.handleGeneSetUpload()}
            tooltip={'Upload gene set'}
          >
            <FaUpload style={{fontSize: 'small'}}/>
          </ToolTipButton>
        }
        { isViewGeneExpression(this.state.view) && <div className={BaseStyle.editGeneSetSearch}>Limit:</div>}
        { isViewGeneExpression(this.state.view) &&
        <input
          className={BaseStyle.editGeneSetLimits} onChange={(limit) => {
            this.setState({geneSetLimit: limit.target.value})
            this.props.onChangeGeneSetLimit(limit.target.value,this.state.sortGeneSetBy,this.props.selectedGeneSets,false,this.state.view)
          }}
          size={3} type='text'
          value={this.state.geneSetLimit}/>
        }
        { isViewGeneExpression(this.state.view) && <div className={BaseStyle.editGeneSetSearch}>Filter:</div> }
        {isViewGeneExpression(this.state.view) &&
        <select
          className={BaseStyle.editGeneSetOrder}
          onChange={(method) => {
            const sortBy = method.target.options[method.target.options.selectedIndex].getAttribute('data-key')
            this.setState({
              sortGeneSetBy: sortBy,
              sortGeneSetByLabel: method.target.value
            })
            this.props.onChangeGeneSetLimit(this.state.geneSetLimit, sortBy, this.props.selectedGeneSets, false, this.state.view)
          }}
          value={`${this.state.sortGeneSetBy} Gene Sets`}
        >
          {
            Object.values(SORT_VIEW_BY).map(v =>
              (<option data-key={v} key={v}>{v} Gene Sets</option>)
            )
          }
        </select>
        }
      </div>
    )
  }

}

GeneSetEditorComponent.propTypes = {
  allowableViews: PropTypes.any.isRequired,
  customInternalGeneSets: PropTypes.any.isRequired,
  customServerGeneSets: PropTypes.any.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  getAvailableCustomGeneSets: PropTypes.any,
  handleGeneSetDelete: PropTypes.any.isRequired,
  handleGeneSetEdit: PropTypes.any.isRequired,
  handleGeneSetUpload: PropTypes.any.isRequired,
  isCustomServerGeneSet: PropTypes.any.isRequired,
  isNotCustomDefaultGeneSet: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  profile: PropTypes.any,
  selectedGeneSets: PropTypes.any,
  setGeneSetsOption: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
}
