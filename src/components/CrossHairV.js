import React from 'react'
import PureComponent from './PureComponent'
import BaseStyle from '../css/base.css'
import PropTypes from 'prop-types'

export default class CrossHairV extends PureComponent{

  constructor(props) {
    super(props)
  }

  render() {
    let {mousing, x, height} = this.props
    if(!mousing) return <div/>
    return (
      <div className={BaseStyle.crosshairV} style={{left: x, height}}/>
    )
  }

}
CrossHairV.propTypes = {
  height: PropTypes.any.isRequired,
  mousing: PropTypes.any.isRequired,
  x: PropTypes.any.isRequired,
}
