import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import FaArrowDown from 'react-icons/lib/fa/arrow-down'


export class TopLegend extends PureComponent {


  render() {

    return (
      <tr>
        <td colSpan={1}/>
        <td colSpan={1}>
          <FaArrowDown style={{marginLeft:60}}/>
          <span className={BaseStyle.legendLabel}>Middle</span>
          <FaArrowDown/>
        </td>
        <td colSpan={1}>
          <FaArrowDown style={{marginLeft:60}}/>
          <span className={BaseStyle.legendLabel}>Sample</span>
          <FaArrowDown/>
        </td>
      </tr>
    )
  }

}

TopLegend.propTypes = {
}
