import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import FaArrowDown from 'react-icons/lib/fa/arrow-down'
import FaFolderOpenO from 'react-icons/lib/fa/folder-open-o'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'


export class OpenGeneSetLegend extends PureComponent {

  render() {
    return (
      <tr className={BaseStyle.geneLegend} >
        <td colSpan={1} width={DETAIL_WIDTH}/>
        <td colSpan={1} width={LABEL_WIDTH}>
          <div className={BaseStyle.openGeneSet}>
            <FaArrowDown/> Open Gene Set <FaFolderOpenO/>
          </div>
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}/>
      </tr>
    )
  }
}
