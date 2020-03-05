import React from 'react'
import PureComponent from './PureComponent'
import QueryString from 'querystring'
import XenaGeneSetApp from './XenaGeneSetApp'
import {AnalysisWizard} from './wizard/AnalysisWizard'
import {GeneSetWizard} from './wizard/GeneSetWizard'

export class ApplicationWrapper extends PureComponent {

  constructor(props) {
    super(props)

    const urlVariables = QueryString.parse(location.hash.substr(1))
    console.log('url variables', urlVariables)
    this.state = {
      cohort1: urlVariables.cohort
      ,cohort2: urlVariables.cohort
      ,filter: undefined
      ,wizard: urlVariables.wizard
      ,geneSetLimit: urlVariables.geneSetLimit ? urlVariables.geneSetLimit : 45
      ,geneSetMethod: urlVariables.geneSetMethod ? urlVariables.geneSetMethod : 'default'
      ,geneSortMethod: urlVariables.geneSortMethod ? urlVariables.geneSortMethod : 'default'
    }
  }


  handleGotoWizard = (wizard) => {
    this.setState({
      wizard:wizard
    })
  }

  handleSelectAnalysis = (analysis) => {
    this.setState({
      filter:analysis,
      wizard:'genesets'
    })
  }

  handleFinish = () => {
    console.log('finsihign ')
    this.setState({
      wizard:undefined
    })
  }

  handleGeneSetLimit = (limit) => {
    this.setState({
      geneSetLimit: limit.target.value
    })
  }

  handleGeneSetMethod = (method) => {
    this.setState({
      geneSetMethod: method
    })
  }

  handleGeneSetSort = (sort) => {
    this.setState({
      geneSetSort: sort
    })
  }

  render() {
    if (this.state.wizard === 'analysis') {
      return (<AnalysisWizard
        cohort={this.state.cohort1}
        onNext={this.handleGotoWizard}
        onSelectAnalysis={this.handleSelectAnalysis}
      />)
    }
    if (this.state.wizard === 'genesets') {
      return (<GeneSetWizard
        analysisMethod={this.state.filter}
        cohort={this.state.cohort1}
        geneSetLimit={this.state.geneSetLimit}
        geneSetMethod={this.state.geneSetMethod}
        onFinish={this.handleFinish}
        onPrevious={this.handleGotoWizard}
        onSelectGeneSetLimit={this.handleGeneSetLimit}
        onSelectGeneSetMethod={this.handleGeneSetMethod}
        onSelectGeneSetSort={this.handleGeneSetSort}
      />)
    }
    return <XenaGeneSetApp/>
  }
}

