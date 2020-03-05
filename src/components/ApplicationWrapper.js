import React from 'react'
import PureComponent from './PureComponent'
import QueryString from 'querystring'
import XenaGeneSetApp from './XenaGeneSetApp'
import {AnalysisWizard} from './wizard/AnalysisWizard'
import {GeneSetWizard} from './wizard/GeneSetWizard'
import {isViewGeneExpression} from '../functions/DataFunctions'
import {SORT_ENUM} from '../data/SortEnum'
import {generatedUrlFunction} from '../functions/UrlFunctions'

export class ApplicationWrapper extends PureComponent {

  constructor(props) {
    super(props)

    const urlVariables = QueryString.parse(location.hash.substr(1))
    console.log('url variables', urlVariables)
    this.state = {
      cohort: urlVariables.cohort
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
    location.hash = `${location.hash}&view=${analysis}`

    this.setState({
      filter:analysis,
      wizard:'genesets',
      geneSetMethod: isViewGeneExpression(analysis) ? SORT_ENUM.CONTRAST_DIFF : SORT_ENUM.ALPHA,
      geneSetSort: isViewGeneExpression(analysis) ? SORT_ENUM.DIFF : SORT_ENUM.ALPHA,
    })
  }

  handleFinish = () => {
    // set the URL here
    location.hash = generatedUrlFunction(
      this.state.filter,
      undefined,
      this.state.cohort,
      this.state.cohort,
      [],
      [],
    )

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
      geneSetMethod: method.target.value
    })
  }

  handleGeneSetSort = (sort) => {
    this.setState({
      geneSetSort: sort.target.value
    })
  }

  render() {
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
        geneSetLimit={this.state.geneSetLimit}
        geneSetMethod={this.state.geneSetMethod}
        geneSetSort={this.state.geneSetSort}
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

