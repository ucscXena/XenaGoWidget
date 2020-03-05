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
      cohort: urlVariables.cohort
      ,wizard: urlVariables.wizard
      ,geneSetLimit: urlVariables.geneSetLimit ? urlVariables.geneSetLimit : 45
      ,geneSetMethod: urlVariables.geneSetMethod ? urlVariables.geneSetMethod : 'default'
    }
  }


  handleGotoWizard = (wizard) => {
    this.setState({
      wizard:wizard
    })
  }

  handleSelectAnalysis = (analysis) => {
    this.setState({
      wizardAnalysis:analysis
    })
  }

  handleFinish = () => {
    console.log('finsihign ')
    this.setState({
      wizard:undefined
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
        geneSetLimit={this.state.geneSetLimit}
        geneSetMethod={this.state.geneSetMethod}
        onFinish={this.handleFinish}
        onPrevious={this.handleGotoWizard}
        onSelectGeneSetLimit={(limit) => this.setState( {wizardGeneSetLimit: limit})}
        onSelectGeneSetMethod={(method) => this.setState( {wizardGeneSetMethod: method})}
      />)
    }
    return <XenaGeneSetApp/>
  }
}

