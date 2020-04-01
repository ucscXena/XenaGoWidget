import React from 'react'
import PureComponent from '../PureComponent'
import Wizard from '../../css/wizard.css'
import PropTypes from 'prop-types'
import {VIEW_ENUM} from '../../data/ViewEnum'
import {Helmet} from 'react-helmet'
import {AnalysisButton} from './AnalysisButton'
import FaInfo from 'react-icons/lib/fa/info-circle'
import FaDownArrow from 'react-icons/lib/fa/chevron-circle-down'
import FaRightArrow from 'react-icons/lib/fa/chevron-circle-right'
import {SORT_ENUM} from '../../data/SortEnum'
// import Dialog from 'react-toolbox/lib/dialog'

const HELP_LINK = 'https://ucsc-xena.gitbook.io/project/overview-of-features/gene-sets-about#analysis'

export class AnalysisWizard extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      showGeneSetOptions : false,
      showHelp: false,
    }
  }

  handleHelpClick = () => {
    window.open(HELP_LINK,'_blank')
  }

  render () {
    const { cohort, onSelectAnalysis, comparisonDescription,
      geneSetLimit, geneSetFilterMethod, onSelectGeneSetLimit,onSelectGeneSetMethod} = this.props
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
        <p>
          {comparisonDescription}
        </p>
        <h2><u>Visualize differences using ...</u></h2>
        {
          <div>
            <h3>Gene Expression data<FaInfo className={Wizard.wizardInfoButton} onClick={this.handleHelpClick}/></h3>

            <AnalysisButton analysis={VIEW_ENUM.GENE_EXPRESSION} onClick={onSelectAnalysis}/>
            <AnalysisButton analysis={VIEW_ENUM.PARADIGM} onClick={onSelectAnalysis}/>
            {cohort.indexOf('LUAD') >= 0 &&
            <AnalysisButton
              analysis={VIEW_ENUM.REGULON}
              onClick={onSelectAnalysis}/>
            }
            <br/>
            <br/>
            <div className={Wizard.advancedOptions} onClick={() => this.setState( {showGeneSetOptions: !this.state.showGeneSetOptions})}>
            Advanced Options&nbsp;
              {!this.state.showGeneSetOptions &&
            <FaRightArrow/>
              }
              {this.state.showGeneSetOptions &&
            <FaDownArrow/>
              }
            </div>
            {this.state.showGeneSetOptions &&
            <table className={Wizard.advancedTable} style={{marginTop: 10}}>
              <tbody>
                <tr>
                  <th align='right'>
                    <u>Geneset ranking method</u>:
                  </th>
                  <td>
                    <select
                      onChange={(value) => onSelectGeneSetMethod(value)}
                      value={geneSetFilterMethod}
                    >
                      {
                        Object.values(SORT_ENUM).filter(f => f !== 'Alpha').map(v =>
                          (<option key={v}>{v}</option>)
                        )
                      }
                    </select>
                  </td>
                </tr>
                <tr>
                  <th align='right'>
                    <u>Maximum genesets to visualize</u>:
                  </th>
                  <td>
                    <input
                      onChange={(value) => onSelectGeneSetLimit(value)}
                      type='text' value={geneSetLimit}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            }
            <h3>Mutation / CNV data<FaInfo className={Wizard.wizardInfoButton} onClick={this.handleHelpClick}/></h3>
            <AnalysisButton analysis={VIEW_ENUM.CNV_MUTATION} onClick={onSelectAnalysis}/>
            <AnalysisButton analysis={VIEW_ENUM.COPY_NUMBER} onClick={onSelectAnalysis}/>
            <AnalysisButton analysis={VIEW_ENUM.MUTATION} onClick={onSelectAnalysis}/>
          </div>
        }
      </div>
    )
  }
}
AnalysisWizard.propTypes = {
  cohort: PropTypes.string.isRequired,
  comparisonDescription: PropTypes.string.isRequired,
  geneSetFilterMethod: PropTypes.string.isRequired,
  geneSetLimit: PropTypes.any.isRequired,
  onNext: PropTypes.func.isRequired,
  onSelectAnalysis: PropTypes.func.isRequired,
  onSelectGeneSetLimit: PropTypes.func.isRequired,
  onSelectGeneSetMethod: PropTypes.func.isRequired,
}
