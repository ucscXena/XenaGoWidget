import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'


export class TopLegend extends PureComponent {


  render() {

    return (
      <tr>
        <td colSpan={1}/>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Middle</span>
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Sample</span>
        </td>
      </tr>
    )
  }

}

TopLegend.propTypes = {
}
