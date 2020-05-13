import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'


export class GeneSetGeneExpressionLegend extends PureComponent {


  render() {

    return (
      <tr>
        <td>
          <div className={BaseStyle.verticalLegendBox}>
            Geneset Legend
          </div>
        </td>
        <td colSpan={3}>
          <GeneSetLegend
            id='geneExpressionGeneSetScore'
            label={this.props.filter + ' score'} maxScore={this.props.maxValue}
            minScore={-this.props.maxValue}
          />
        </td>
      </tr>
    )
  }

}

GeneSetGeneExpressionLegend.propTypes = {
  filter: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
}
