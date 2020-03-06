import React from 'react'
import PureComponent from '../PureComponent'
import Wizard from '../../css/wizard.css'
import PropTypes from 'prop-types'
import {VIEW_ENUM} from '../../data/ViewEnum'
import {Helmet} from 'react-helmet'
import {Button} from 'react-toolbox'


export class AnalysisWizard extends PureComponent {

  render () {
    const { cohort, onSelectAnalysis,} = this.props
    const title = `Select Analysis for ${cohort}`

    return (
      <div className={Wizard.wizardBox}>
        <Helmet
          link={[
            {
              'rel': 'icon',
              'type': 'image/png',
              'href': 'https://raw.githubusercontent.com/ucscXena/XenaGoWidget/develop/src/images/xenalogo_hfz_icon.ico'
            }
          ]}
          meta={[
            {name: 'description', content: 'Xena Gene Set Viewer'}
          ]}
          title={title}
        />
        <h3>Analyzing Cohort: <u>{cohort}</u></h3>
        {
          Object.values(VIEW_ENUM).map( v =>
            (<Button
              className={Wizard.wizardAnalysisButton}
              key={v}
              onClick={() => onSelectAnalysis(v)}
            >{v}</Button>)
          )
        }
      </div>
    )
  }
}
AnalysisWizard.propTypes = {
  cohort: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onSelectAnalysis: PropTypes.func.isRequired,
}
