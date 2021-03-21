import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../css/base.css'
import {standardizeColor} from '../functions/ColorFunctions'


export class GeneSetBackground extends PureComponent {

  constructor(props) {
    super(props)
  }

  render() {

    const cohortColor = this.props.cohortColor[this.props.cohortIndex]
    const standardizedColor = standardizeColor(cohortColor,1)
    const standardizedBackgroundColor = standardizeColor(cohortColor,0.3)

    if (this.props.geneDataStats && this.props.geneDataStats[this.props.cohortIndex].samples) {
      return (
        <div
          className={this.props.cohortIndex===0 ? BaseStyle.cohortBackgroundLeft:  BaseStyle.cohortBackgroundRight}
          style={{
            borderColor: `${standardizedColor}` ,
            borderStyle: 'solid' ,
            backgroundColor: `${standardizedBackgroundColor}` ,
            borderWidth: '5px',
            marginTop: 50,
            marginLeft: this.props.cohortIndex === 0 ? 0 : 182 + 182  + 222 + 250 + 10
          }}
        />
      )
    }
    return <div/>
  }

}

GeneSetBackground.propTypes = {
  cohortColor: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  geneDataStats: PropTypes.any,
  geneHoverData: PropTypes.any,
}
