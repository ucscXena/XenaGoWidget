import React from 'react'
import PureComponent from '../PureComponent'
import Wizard from '../../css/wizard.css'
import PropTypes from 'prop-types'



export class AnalysisWizard extends PureComponent {

  render () {
    const { onNext, onSelectAnalysis} = this.props

    return (
      <div className={Wizard.wizardBox}>
        Analysis Wizard
        <button className={Wizard.wizardNextButton} onClick={() => onNext('genesets')}>Next</button>

        <button
          className={Wizard.wizardAnalysisButton}
          onClick={() => onSelectAnalysis('BPA')}
        />
      </div>
    )
  }

}
AnalysisWizard.propTypes = {
  onNext: PropTypes.func.isRequired,
  onSelectAnalysis: PropTypes.func.isRequired,
}
