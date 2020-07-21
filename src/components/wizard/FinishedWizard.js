import React from 'react'
import PureComponent from '../PureComponent'
import Wizard from '../../css/wizard.css'
import PropTypes from 'prop-types'
import {Helmet} from 'react-helmet'
import {Button} from 'react-toolbox/lib'


export class FinishedWizard extends PureComponent {



  render () {
    const { cohort,  comparisonDescription, onGoToWizard
    } = this.props
    const title = `Finished Finished for ${cohort}`

    return (
      <div className={Wizard.wizardColumn}>
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
        <div className={Wizard.descriptionText}>
          {comparisonDescription}
        </div>
        <br/>
        <div className={Wizard.wizardCloseThisWindow}>You may close this window</div>
        <br/>
        <br/>
        <Button
          className={Wizard.wizardAnalysisButton}
          onClick={() => onGoToWizard('analysis')}
        >&lArr; Change Analysis</Button>
      </div>
    )
  }
}
FinishedWizard.propTypes = {
  cohort: PropTypes.string.isRequired,
  comparisonDescription: PropTypes.string.isRequired,
  onGoToWizard: PropTypes.func.isRequired,
}
