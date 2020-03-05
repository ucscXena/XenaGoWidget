import React from 'react'
import PureComponent from '../PureComponent'
import Wizard from '../../css/wizard.css'
import PropTypes from 'prop-types'
import {VIEW_ENUM} from '../../data/ViewEnum'


export class AnalysisWizard extends PureComponent {

  render () {
    const { cohort,onNext, onSelectAnalysis} = this.props

    return (
      <div className={Wizard.wizardBox}>
        <h3>Analyzing Cohort: <u>{cohort}</u></h3>
        {
          Object.values(VIEW_ENUM).map( v =>
            (<button
              className={Wizard.wizardAnalysisButton}
              onClick={() => onSelectAnalysis(v)}
            >{v}</button>)
          )
        }
        <hr/>
        <button className={Wizard.wizardNextButton} onClick={() => onNext('genesets')}>Next</button>
      </div>
    )
  }
}
AnalysisWizard.propTypes = {
  cohort: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onSelectAnalysis: PropTypes.func.isRequired,
}
