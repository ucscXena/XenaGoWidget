import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {CnvMutationLegend} from './CnvMutationLegend'
import {GeneSetLegend} from './GeneSetLegend'
import {GeneLegendLabel} from './GeneLegendLabel'
import BaseStyle from '../../css/base.css'



export class GeneCnvMutationLegend extends PureComponent {


  render() {

    return (
      <tr style={{height: 50}} >
        <td colSpan={1} >
          {<GeneLegendLabel/>}
        </td>
        <td colSpan={1}>
          <div className={BaseStyle.legendTextDiv}>
            <pre style={{marginLeft: 0,display:'inline'}}>Samples affected %</pre>
            <GeneSetLegend
              id='densityGrad1'
              maxColor='red'
              maxScore={100} midColor='pink'
              minColor='white' minScore={0} precision={0}
            />
          </div>
        </td>
        <td className={BaseStyle.legendDiv} colSpan={1}>
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
