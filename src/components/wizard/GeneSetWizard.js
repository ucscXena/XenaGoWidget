import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import Wizard from '../../css/wizard.css'

export class GeneSetWizard extends PureComponent {

  render () {
    let { analysisMethod,cohort,onFinish, onPrevious,onSelectGeneSetLimit, onSelectGeneSetMethod, geneSetLimit,geneSetMethod} = this.props
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
        <select onChange={(value) => onSelectGeneSetMethod(value)}>
          <option value={geneSetMethod}>{geneSetMethod}</option>
          <option value='bbb'/>
          <option value='aaa'/>
        </select>
        Sort Method
        <select onChange={(value) => onSelectGeneSetMethod(value)}>
          <option value={geneSetMethod}>{geneSetMethod}</option>
          <option value='bbb'/>
          <option value='aaa'/>
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
  geneSetLimit: PropTypes.any.isRequired,
  geneSetMethod: PropTypes.string.isRequired,
  onFinish: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSelectGeneSetLimit: PropTypes.func.isRequired,
  onSelectGeneSetMethod: PropTypes.func.isRequired,
}
