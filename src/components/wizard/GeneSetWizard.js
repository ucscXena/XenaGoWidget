import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import Wizard from '../../css/wizard.css'
import {SORT_ENUM} from '../../data/SortEnum'
import {Helmet} from 'react-helmet'
import {Button} from 'react-toolbox'

export class GeneSetWizard extends PureComponent {

  render () {
    let { analysisMethod,cohort,onFinish, onPrevious,onSelectGeneSetLimit, onSelectGeneSetMethod, onSelectGeneSetSort,geneSetLimit,geneSetFilterMethod,geneSetSortMethod} = this.props
    const title = `Select GeneSet method for ${cohort} and ${analysisMethod} analysis`


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
          value={geneSetFilterMethod}
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
          value={geneSetSortMethod}
        >
          {
            Object.values(SORT_ENUM).map( v =>
              (<option key={v}>{v}</option>)
            )
          }
        </select>
        <hr/>
        <Button
          className={Wizard.wizardPreviousButton}
          onClick={() => onPrevious('analysis')}
          raised>&lArr; Previous</Button>
        <Button
          className={Wizard.wizardFinishButton}
          onClick={() => onFinish(undefined)}
        >Finish: Compare in New Window</Button>
      </div>
    )
  }

}
GeneSetWizard.propTypes = {
  analysisMethod: PropTypes.string.isRequired,
  cohort: PropTypes.string.isRequired,
  geneSetFilterMethod: PropTypes.string.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  geneSetSortMethod: PropTypes.string.isRequired,
  onFinish: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSelectGeneSetLimit: PropTypes.func.isRequired,
  onSelectGeneSetMethod: PropTypes.func.isRequired,
  onSelectGeneSetSort: PropTypes.func.isRequired,
}
