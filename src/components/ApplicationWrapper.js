import React from 'react'
import PureComponent from './PureComponent'
import QueryString from 'querystring'
import XenaGeneSetApp from './XenaGeneSetApp'
import {AnalysisWizard} from './wizard/AnalysisWizard'
import {SORT_ENUM} from '../data/SortEnum'
import {generateUrl} from '../functions/UrlFunctions'
import {FinishedWizard} from './wizard/FinishedWizard'


export class ApplicationWrapper extends PureComponent {

  constructor(props) {
    super(props)

    const urlVariables = QueryString.parse(location.hash.substr(1))
    this.state = {
      cohort: urlVariables.cohort
      ,filter: undefined
      ,subCohortSamples1:urlVariables.subCohortSamples1
      ,subCohortSamples2:urlVariables.subCohortSamples2
      ,selectedSubCohorts1:urlVariables.selectedSubCohorts1
      ,selectedSubCohorts2:urlVariables.selectedSubCohorts2
      ,cohort1Color:urlVariables.cohort1Color
      ,cohort2Color:urlVariables.cohort2Color

      ,wizard: urlVariables.wizard
      ,geneSetLimit: urlVariables.geneSetLimit ? urlVariables.geneSetLimit : 40
      ,geneSetFilterMethod: urlVariables.geneSetFilterMethod ? urlVariables.geneSetFilterMethod :  SORT_ENUM.CONTRAST_DIFF
      ,geneSetSortMethod: urlVariables.geneSetSortMethod
    }
  }

  generateComparisonDescription(){
    const { subCohortSamples1 ,subCohortSamples2} = this.state
    if(subCohortSamples1 && subCohortSamples2){
      const subCohort1Name = subCohortSamples1.split(':')[1]
      const subCohort1SampleSize = subCohortSamples1.split(':')[2].split(',').length
      const subCohort2Name = subCohortSamples2.split(':')[1]
      const subCohort2SampleSize = subCohortSamples2.split(':')[2].split(',').length
      return `Comparing subgroups '${subCohort1Name}' (${subCohort1SampleSize} samples) to '${subCohort2Name}' (${subCohort2SampleSize} samples)`
    }
    return null
  }


  handleGotoWizard = (wizard) => {
    this.setState({
      wizard:wizard
    })
  }

  openUrl = (finalUrl) => {
    if(process.env.NODE_ENV === 'production'){
      window.open(window.location.origin+'/xena/#'+finalUrl, '_blank')
    }
    else{
      window.open(window.location.origin+'#'+finalUrl, '_blank')
    }
  }


  handleSelectAnalysis = (analysis) => {
    // set the URL here
    let finalUrl = generateUrl(
      analysis,
      undefined,
      false,
      this.state.cohort,
      this.state.cohort,
      this.state.selectedSubCohorts1,
      this.state.selectedSubCohorts2,
      this.state.geneSetLimit,
      this.state.sortViewByLabel,
    )
    finalUrl += '&showDescription=true'
    finalUrl += `&subCohortSamples=${this.state.subCohortSamples1}`
    finalUrl += `&subCohortSamples=${this.state.subCohortSamples2}`
    finalUrl += `&cohort1Color=${this.state.cohort1Color}`
    finalUrl += `&cohort2Color=${this.state.cohort2Color}`
    finalUrl += `&geneSetFilterMethod=${this.state.geneSetFilterMethod}`
    finalUrl += `&geneSetSortMethod=${this.state.geneSetSortMethod}`
    finalUrl += `&sortViewBy=${SORT_ENUM.DIFF}`

    this.openUrl(finalUrl)
    this.setState({
      filter:analysis,
      wizard:'finished',
      // geneSetLimit: 40,
      // geneSetFilterMethod:   SORT_ENUM.ALPHA,
      // geneSetSortMethod:  SORT_ENUM.ALPHA,
    })
    // }

  }


  handleGeneSetLimit = (limit) => {
    this.setState({
      geneSetLimit: limit.target.value
    })
  }

  handleGeneSetMethod = (method) => {
    this.setState({
      geneSetFilterMethod: method.target.value
    })
  }

  render() {
    const comparisonDescription = this.generateComparisonDescription()
    if (this.state.wizard === 'analysis') {
      return (
        <AnalysisWizard
          cohort={this.state.cohort}
          comparisonDescription={comparisonDescription}
          geneSetFilterMethod={this.state.geneSetFilterMethod}
          geneSetLimit={this.state.geneSetLimit}
          onNext={this.handleGotoWizard}
          onSelectAnalysis={this.handleSelectAnalysis}
          onSelectGeneSetLimit={this.handleGeneSetLimit}
          onSelectGeneSetMethod={this.handleGeneSetMethod}
        />
      )
    }
    if (this.state.wizard === 'finished') {
      return (
        <FinishedWizard
          cohort={this.state.cohort}
          comparisonDescription={comparisonDescription}
          onGoToWizard={this.handleGotoWizard}
        />
      )
    }
    return <XenaGeneSetApp/>
  }
}

