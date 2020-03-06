import React from 'react'
import PureComponent from '../PureComponent'
import {Button} from 'react-toolbox/lib'
import PropTypes from 'prop-types'
import Wizard from '../../css/wizard.css'
import {isViewGeneExpression} from '../../functions/DataFunctions'

export class AnalysisButton extends PureComponent {
  constructor(props) {
    super(props)
  }

  render(){
    let {onClick,analysis} = this.props
    return (<Button
      className={isViewGeneExpression(analysis) ? Wizard.wizardAnalysisGeneExpressionButton : Wizard.wizardAnalysisButton}
      key={analysis}
      onClick={() => onClick(analysis)}
    >{analysis}</Button>)
  }

}
AnalysisButton.propTypes = {
  analysis:PropTypes.string.isRequired,
  onClick:PropTypes.func.isRequired,
}
