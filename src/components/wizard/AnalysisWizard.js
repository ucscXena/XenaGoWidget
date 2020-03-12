import React from 'react'
import PureComponent from '../PureComponent'
import Wizard from '../../css/wizard.css'
import PropTypes from 'prop-types'
import {VIEW_ENUM} from '../../data/ViewEnum'
import {Helmet} from 'react-helmet'
import {AnalysisButton} from './AnalysisButton'
import {Button} from 'react-toolbox'
import FaInfo from 'react-icons/lib/fa/info-circle'


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
        {/*<h3>Analyzing Cohort: <u>{cohort}</u></h3>*/}
        <h2>Select Analysis Method </h2>
        {
          <div>
            <h3>Gene Expression <Button><FaInfo/></Button></h3>

            <AnalysisButton analysis={VIEW_ENUM.GENE_EXPRESSION} onClick={onSelectAnalysis}/>
            <AnalysisButton analysis={VIEW_ENUM.PARADIGM} onClick={onSelectAnalysis}/>
            {cohort.indexOf('LUAD') >= 0 &&
            <AnalysisButton
              analysis={VIEW_ENUM.REGULON}
              onClick={onSelectAnalysis}/>
            }
            <br/>
            <button>+ Advanced Options</button>
            <h3>Mutation / CNV <Button><FaInfo/></Button></h3>
            <AnalysisButton analysis={VIEW_ENUM.CNV_MUTATION} onClick={onSelectAnalysis}/>
            <AnalysisButton analysis={VIEW_ENUM.COPY_NUMBER} onClick={onSelectAnalysis}/>
            <AnalysisButton analysis={VIEW_ENUM.MUTATION} onClick={onSelectAnalysis}/>
          </div>
          // Object.values(VIEW_ENUM).map( v =>
          //   (<Button
          //     className={Wizard.wizardAnalysisButton}
          //     key={v}
          //     onClick={() => onSelectAnalysis(v)}
          //   >{v}</Button>)
          // )
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
