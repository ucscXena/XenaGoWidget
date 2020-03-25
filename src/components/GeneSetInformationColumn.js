import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'
import {DetailedLabelComponent} from './DetailedLabelComponent'

export class GeneSetInformationColumn extends PureComponent {


  constructor(props) {
    super(props)
  }

  render(){

    let {cohortIndex} = this.props
    const cohortColor = this.props.cohortColor[cohortIndex]

    return (
      <div>
        <h2>Hover {cohortIndex}</h2>
        <div>
          Color: {cohortColor}
        </div>
        <DetailedLabelComponent {...this.props}/>
      </div>
    )
  }

}

GeneSetInformationColumn.propTypes = {
  cohort: PropTypes.any.isRequired,
  cohortColor: PropTypes.any.isRequired,
  cohortIndex: PropTypes.any.isRequired,
  onShowCohortEditor: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,

}
