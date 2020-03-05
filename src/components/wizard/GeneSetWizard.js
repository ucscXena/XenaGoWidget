import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import Wizard from '../../css/wizard.css'
import {SORT_ENUM} from '../../data/SortEnum'

export class GeneSetWizard extends PureComponent {

  render () {
    let { analysisMethod,cohort,onFinish, onPrevious,onSelectGeneSetLimit, onSelectGeneSetMethod, onSelectGeneSetSort,geneSetLimit,geneSetMethod,geneSetSort} = this.props


    return (
      <div className={Wizard.wizardBox}>
        <h3>Analyzing Cohort: <u>{cohort}</u></h3>
        <h3>Analysis Method: <u>{analysisMethod}</u></h3>
        <h3>Gene Set Calculation</h3>

        Limit
        <input
          onChange={(value) => onSelectGeneSetLimit(value)}
          type='text' value={geneSetLimit}
        />

        Selection Method
        <select
          onChange={(value) => onSelectGeneSetMethod(value)}
          value={geneSetMethod}
        >
          {
            Object.values(SORT_ENUM).map( v =>
              (<option key={v} >{v}</option>)
            )
          }
        </select>
        Sort Method
        <select
          onChange={(value) =>
            onSelectGeneSetSort(value)}
          value={geneSetSort}
        >
          {
            Object.values(SORT_ENUM).map( v =>
              (<option key={v}>{v}</option>)
            )
          }
        </select>
        <hr/>
        <button onClick={() => onPrevious('analysis')}>Previous</button>
        <button
          onClick={() => onFinish(undefined)}
        >Finish</button>
      </div>
    )
  }

}
GeneSetWizard.propTypes = {
  analysisMethod: PropTypes.string.isRequired,
  cohort: PropTypes.string.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  geneSetMethod: PropTypes.string.isRequired,
  geneSetSort: PropTypes.string.isRequired,
  onFinish: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSelectGeneSetLimit: PropTypes.func.isRequired,
  onSelectGeneSetMethod: PropTypes.func.isRequired,
  onSelectGeneSetSort: PropTypes.func.isRequired,
}
