import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import PropTypes from 'prop-types'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'
import GeneSetEditorComponent from '../GeneSetEditorComponent'


export class OpenGeneSetRow extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      geneSetLimit : props.geneSetLimit,
      sortGeneSetBy : props.sortGeneSetBy,
      sortGeneSetByLabel: props.sortGeneSetBy+ ' Gene Sets',
    }
  }

  render() {

    return (
      <tr className={BaseStyle.openGeneSetRow} >
        <td colSpan={3} width={DETAIL_WIDTH+LABEL_WIDTH+DETAIL_WIDTH}>
          <table>
            <tbody>
              <tr style={{height: 30}}>
                <td style={{height: 30}}>
                  <GeneSetEditorComponent
                    {...this.props}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    )
  }
}

OpenGeneSetRow.propTypes = {
  customGeneSets: PropTypes.any,
  geneSetLimit: PropTypes.any.isRequired,
  isCustomGeneSet: PropTypes.any.isRequired,
  onChangeGeneSetLimit: PropTypes.any.isRequired,
  onGeneEdit: PropTypes.any.isRequired,
  selectedGeneSets: PropTypes.any,
  setActiveGeneSets: PropTypes.any.isRequired,
  setGeneSetsOption: PropTypes.any.isRequired,
  sortGeneSetBy: PropTypes.any.isRequired,
}
