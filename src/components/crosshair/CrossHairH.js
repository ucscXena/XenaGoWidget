import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'

export default class CrossHairH extends PureComponent{

  constructor(props) {
    super(props)
    this.state = {
      y : -1,
      mousing: false,
    }
  }

  render() {
    let {mousing, y} = this.props
    const isVisible = mousing && y > 305
    return (
      <div className={BaseStyle.crosshairH} style={{top: y, visibility: isVisible ? 'visible' : 'hidden'}}/>
    )
  }

}
CrossHairH.propTypes = {
  mousing: PropTypes.any.isRequired,
  y: PropTypes.any.isRequired,
}
