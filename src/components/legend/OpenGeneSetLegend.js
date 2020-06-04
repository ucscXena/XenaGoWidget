import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import FaArrowDown from 'react-icons/lib/fa/arrow-down'
import FaFolderOpenO from 'react-icons/lib/fa/folder-open-o'


export class OpenGeneSetLegend extends PureComponent {

  render() {
    return (
      <tr style={{height: 50, position:'fixed'}} >
        <td colSpan={1}/>
        <td colSpan={1}>
          <div className={BaseStyle.openGeneSet}>
            <FaArrowDown/> Open Gene Set <FaFolderOpenO/>
          </div>
        </td>
        <td colSpan={1}/>
      </tr>
    )
  }
}
