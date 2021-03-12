import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import FaArrowDown from 'react-icons/lib/fa/arrow-down'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'


export class TopLegend extends PureComponent {


  render() {

    return (
      <tr className={BaseStyle.middleSampleLegend}>
        <td colSpan={1} width={DETAIL_WIDTH}>
          <FaArrowDown style={{marginLeft:60}}/>
          <span className={BaseStyle.legendLabel}>Samples</span>
          <FaArrowDown/>
        </td>
        <td colSpan={1} width={LABEL_WIDTH}>
          <FaArrowDown style={{marginLeft:40}}/>
          <span className={BaseStyle.legendLabel}>Gene Set Summary</span>
          <FaArrowDown/>
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}>
          <FaArrowDown style={{marginLeft:60}}/>
          <span className={BaseStyle.legendLabel}>Samples</span>
          <FaArrowDown/>
        </td>
      </tr>
    )
  }

}

TopLegend.propTypes = {
}
