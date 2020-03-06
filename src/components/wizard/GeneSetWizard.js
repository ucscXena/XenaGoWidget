import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import Wizard from '../../css/wizard.css'
import {SORT_ENUM} from '../../data/SortEnum'
import {Helmet} from 'react-helmet'
import {Button} from 'react-toolbox'

export class GeneSetWizard extends PureComponent {

  render () {
    let { analysisMethod,cohort,comparisonDescription,onFinish, onPrevious,onSelectGeneSetLimit, onSelectGeneSetMethod, onSelectGeneSetSort,geneSetLimit,geneSetFilterMethod,geneSetSortMethod} = this.props
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
        <h4>
          {comparisonDescription}
        </h4>
        <h3>Analysis Method: <u>{analysisMethod}</u></h3>
        <h3>Gene Set Calculation</h3>

        <table>
          <tbody>
            <tr>
              <th align='right'>
                <u>Maximum Gene Sets</u>:
              </th>
              <td>
                <input
                  onChange={(value) => onSelectGeneSetLimit(value)}
                  type='text' value={geneSetLimit}
                />
              </td>
            </tr>
            <tr>
              <th align='right'>
                <u>Gene Set Filtering Method</u>:
              </th>
              <td>
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
              </td>
            </tr>
            <tr>
              <th align='right'>
                <u>Gene Set Sort Method</u>:
              </th>
              <td>
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
              </td>
            </tr>
          </tbody>
        </table>



        <hr/>
        <Button
          className={Wizard.wizardPreviousButton}
          onClick={() => onPrevious('analysis')}
          raised>&lArr; Change Analysis</Button>
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
  comparisonDescription: PropTypes.string.isRequired,
  geneSetFilterMethod: PropTypes.string.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  geneSetSortMethod: PropTypes.string.isRequired,
  onFinish: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSelectGeneSetLimit: PropTypes.func.isRequired,
  onSelectGeneSetMethod: PropTypes.func.isRequired,
  onSelectGeneSetSort: PropTypes.func.isRequired,
}
