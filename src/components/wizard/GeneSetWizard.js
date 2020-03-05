import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import Wizard from '../../css/wizard.css'

export class GeneSetWizard extends PureComponent {

  render () {
    let { analysisMethod,onFinish, onPrevious,onSelectGeneSetLimit, onSelectGeneSetMethod, geneSetLimit,geneSetMethod} = this.props
    return (
      <div className={Wizard.wizardBox}>
        <h3>Analysis {analysisMethod}</h3>
        <h3>GeneSet</h3>
        <button onClick={() => onPrevious('analysis')}>Previous</button>
        <button
          onClick={() => onFinish(undefined)}
        >Finish</button>;

        GeneSet Limit
        <input
          onChange={(value) => onSelectGeneSetLimit(value)}
          type='text' value={geneSetLimit}
        />

        GeneSet Method
        <select onChange={(value) => onSelectGeneSetMethod(value)}>
          <option value={geneSetMethod}>{geneSetMethod}</option>
          <option value='bbb'/>
          <option value='aaa'/>
        </select>
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
