import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {CnvMutationLegend} from './CnvMutationLegend'
import {GeneSetLegend} from './GeneSetLegend'
import {GeneLegendLabel} from './GeneLegendLabel'
import BaseStyle from '../../css/base.css'
import {DETAIL_WIDTH, LABEL_WIDTH} from '../XenaGeneSetApp'



export class GeneCnvMutationLegend extends PureComponent {


  render() {

    return (
      <tr className={BaseStyle.geneSetLegend} >
        <td colSpan={1} width={DETAIL_WIDTH}>
          <GeneLegendLabel/>
        </td>
        <td colSpan={1} width={LABEL_WIDTH}>
          <div className={BaseStyle.legendTextDiv}>
              Samples affected %
            <GeneSetLegend
              id='densityGrad1'
              maxColor='red'
              maxScore={100} midColor='pink'
              minColor='white' minScore={0} precision={0}
            />
          </div>
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}>
          <div className={BaseStyle.legendDiv}>
            <CnvMutationLegend view={this.props.filter}/>
          </div>
        </td>
      </tr>
    )
  }

}

GeneCnvMutationLegend.propTypes = {
  filter: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
}
