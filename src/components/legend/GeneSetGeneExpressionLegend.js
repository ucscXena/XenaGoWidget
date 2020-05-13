import React from 'react'
import PureComponent from '../PureComponent'
import {GeneSetLegend} from './GeneSetLegend'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'


export class GeneSetGeneExpressionLegend extends PureComponent {


  render() {

    return (
      <tr>
        <td colSpan={1}>
          <div className={BaseStyle.verticalLegendBox}>
            Geneset
          </div>
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Middle</span>
          <pre style={{marginLeft: 10,display:'inline'}}>{this.props.filter} </pre>
          <br/>
          <GeneSetLegend
            id='geneExpressionGeneSetLabelScore'
            // label={this.props.filter + ' score'}
            maxScore={this.props.maxValue}
            minScore={-this.props.maxValue}
          />
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Sample</span>
          <pre style={{marginLeft: 10,display:'inline'}}>Sample Score</pre>
          <br/>
          <GeneSetLegend
            id='geneExpressionGeneSetSampleScore'
            // label={this.props.filter + ' score'}
            maxScore={this.props.maxValue}
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
