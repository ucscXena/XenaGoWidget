import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {CnvMutationLegend} from './CnvMutationLegend'
import {GeneSetLegend} from './GeneSetLegend'
import BaseStyle from '../../css/base.css'


export class GeneCnvMutationLegend extends PureComponent {


  render() {

    return (
      <tr style={{height: 50}} >

        <td colSpan={1} >
          <div className={BaseStyle.verticalLegendBox}>
            Gene
          </div>
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Middle</span>
          <pre style={{marginLeft: 10,display:'inline'}}>Samples affected %</pre>
          <GeneSetLegend
            id='densityGrad1'
            maxColor='red'
            maxScore={100} midColor='pink'
            minColor='white' minScore={0} precision={0}
          />
        </td>
        <td colSpan={1}>
          <span className={BaseStyle.legendLabel}>Sample</span>
          <CnvMutationLegend view={this.props.filter}/>
        </td>
      </tr>
    )
  }

}

GeneCnvMutationLegend.propTypes = {
  filter: PropTypes.any.isRequired,
  maxValue: PropTypes.any.isRequired,
}
