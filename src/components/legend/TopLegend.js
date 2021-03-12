import React from 'react'
import PropTypes from 'prop-types'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
// import FaArrowDown from 'react-icons/lib/fa/arrow-down'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'


export class TopLegend extends PureComponent {


  render() {

    return (
      <tr className={BaseStyle.middleSampleLegend}>
        <td colSpan={1} width={DETAIL_WIDTH}>
          {/*<FaArrowDown style={{marginLeft:60}}/>*/}
          <span
            className={BaseStyle.samplesLegendLabel}
            style={{
              borderColor:this.props.cohortColors[0],
            }}
          >Samples</span>
          {/*<FaArrowDown/>*/}
        </td>
        <td colSpan={1} width={LABEL_WIDTH}>
          {/*<FaArrowDown style={{marginLeft:40}}/>*/}
          <span
            className={BaseStyle.legendLabel}
            style={{
              borderColor:'gray',
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
              Gene Set Summary</span>
          {/*<FaArrowDown/>*/}
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}>
          {/*<FaArrowDown style={{marginLeft:60}}/>*/}
          <span
            className={BaseStyle.samplesLegendLabel}
            style={{
              borderColor:this.props.cohortColors[1],
              // backgroundColor:'green'
            }}>Samples</span>
          {/*<FaArrowDown/>*/}
        </td>
      </tr>
    )
  }

}

TopLegend.propTypes = {
  cohortColors: PropTypes.any.isRequired
}
