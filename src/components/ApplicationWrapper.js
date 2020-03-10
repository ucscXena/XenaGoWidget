import React from 'react'
import PureComponent from './PureComponent'
import QueryString from 'querystring'
import XenaGeneSetApp from './XenaGeneSetApp'
import {AnalysisWizard} from './wizard/AnalysisWizard'
import {GeneSetWizard} from './wizard/GeneSetWizard'
import {isViewGeneExpression} from '../functions/DataFunctions'
import {SORT_ENUM} from '../data/SortEnum'
import {generateUrl} from '../functions/UrlFunctions'
import {Button} from 'react-toolbox/lib'
import Wizard from '../css/wizard.css'


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
      ,geneSetLimit: urlVariables.geneSetLimit
      ,geneSetFilterMethod: urlVariables.geneSetFilterMethod
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
      return `Comparing subcohorts '${subCohort1Name}' (${subCohort1SampleSize} samples) to '${subCohort2Name}' (${subCohort2SampleSize} samples)`
    }
    return null
  }


  handleGotoWizard = (wizard) => {
    this.setState({
      wizard:wizard
    })
  }

  openUrl = (finalUrl) => {
    // window.open(window.location.origin+'xena/#'+finalUrl, '_blank')
    // console.log('opening the final url',finalUrl)
    console.log('node environment',process.env.NODE_ENV)
    if(process.env.NODE_ENV === 'production'){
      window.open(window.location.origin+'/xena/#'+finalUrl, '_blank')
    }
    else{
      window.open(window.location.origin+'#'+finalUrl, '_blank')
    }
  }


  handleSelectAnalysis = (analysis) => {
    if(isViewGeneExpression(analysis)){
      location.hash = `${location.hash}&view=${analysis}`
      this.setState({
        filter:analysis,
        wizard:'genesets',
        geneSetLimit: 40,
        geneSetFilterMethod:   SORT_ENUM.CONTRAST_DIFF ,
        geneSetSortMethod:  SORT_ENUM.DIFF ,
      })
    }
    else{
      // set the URL here
      let finalUrl = generateUrl(
        analysis,
        undefined,
        this.state.cohort,
        this.state.cohort,
        this.state.selectedSubCohorts1,
        this.state.selectedSubCohorts2,
      )
      finalUrl += `&subCohortSamples=${this.state.subCohortSamples1}`
      finalUrl += `&subCohortSamples=${this.state.subCohortSamples2}`
      finalUrl += `&cohort1Color=${this.state.cohort1Color}`
      finalUrl += `&cohort2Color=${this.state.cohort2Color}`
      finalUrl += `&geneSetLimit=${this.state.geneSetLimit}`
      finalUrl += `&geneSetFilterMethod=${this.state.geneSetFilterMethod}`
      finalUrl += `&geneSetSortMethod=${this.state.geneSetSortMethod}`

      this.openUrl(finalUrl)
      this.setState({
        filter:analysis,
        wizard:'finished',
        geneSetLimit: 40,
        geneSetFilterMethod:   SORT_ENUM.ALPHA,
        geneSetSortMethod:  SORT_ENUM.ALPHA,
      })
    }

  }


  handleFinish = () => {
    // set the URL here
    let finalUrl = generateUrl(
      this.state.filter,
      undefined,
      this.state.cohort,
      this.state.cohort,
      this.state.selectedSubCohorts1,
      this.state.selectedSubCohorts2,
    )
    finalUrl += `&subCohortSamples=${this.state.subCohortSamples1}`
    finalUrl += `&subCohortSamples=${this.state.subCohortSamples2}`
    finalUrl += `&cohort1Color=${this.state.cohort1Color}`
    finalUrl += `&cohort2Color=${this.state.cohort2Color}`
    finalUrl += `&geneSetLimit=${this.state.geneSetLimit}`
    finalUrl += `&geneSetFilterMethod=${this.state.geneSetFilterMethod}`
    finalUrl += `&geneSetSortMethod=${this.state.geneSetSortMethod}`

    this.openUrl(finalUrl)

    this.setState({
      wizard:'finished'
    })
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

  handleGeneSetSort = (sort) => {
    this.setState({
      geneSetSortMethod: sort.target.value
    })
  }

  render() {
    const comparisonDescription = this.generateComparisonDescription()
    if (this.state.wizard === 'analysis') {
      return (<AnalysisWizard
        cohort={this.state.cohort}
        onNext={this.handleGotoWizard}
        onSelectAnalysis={this.handleSelectAnalysis}
      />)
    }
    if (this.state.wizard === 'genesets') {
      return (<GeneSetWizard
        analysisMethod={this.state.filter}
        cohort={this.state.cohort}
        comparisonDescription={comparisonDescription}
        geneSetFilterMethod={this.state.geneSetFilterMethod}
        geneSetLimit={this.state.geneSetLimit}
        geneSetSortMethod={this.state.geneSetSortMethod}
        onFinish={this.handleFinish}
        onPrevious={this.handleGotoWizard}
        onSelectGeneSetLimit={this.handleGeneSetLimit}
        onSelectGeneSetMethod={this.handleGeneSetMethod}
        onSelectGeneSetSort={this.handleGeneSetSort}
      />)
    }
    if (this.state.wizard === 'finished') {
      return (
        <div>
          <h4>Finished generating {this.state.filter} analysis for {this.state.cohort}
            {comparisonDescription}
          </h4>
          <div className={Wizard.wizardCloseThisWindow}>You may close this window</div>
          <hr/>
          <Button
            className={Wizard.wizardPreviousButton}
            onClick={() => this.handleGotoWizard('genesets')}
            raised>&lArr; Change Gene Set Selection</Button>
        </div>
      )
    }
    return <XenaGeneSetApp/>
  }
}

