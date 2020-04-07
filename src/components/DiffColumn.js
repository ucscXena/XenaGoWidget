import React from 'react'
import PureComponent from './PureComponent'
import PropTypes from 'prop-types'


export class DiffColumn extends PureComponent {

  constructor(props) {
    super(props)
  }


  render(){
    let { labelHeight, width } = this.props
    return (<div
      style={{
        backgroundColor: 'brown',
        color: 'green',
        position: 'absolute',
        zIndex: 2000,
        x: 50,
        y: 50,
        width: width,
        height: labelHeight ,
      }}>
    </div>)
  }

}

DiffColumn.propTypes = {
  associatedData: PropTypes.any,
  cohortIndex: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
  geneData: PropTypes.any,
  labelHeight: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
  // pathways: PropTypes.any.isRequired,
  // selectedCohort: PropTypes.any.isRequired,
  // selectedPathway: PropTypes.any,
  width: PropTypes.any.isRequired,
}
