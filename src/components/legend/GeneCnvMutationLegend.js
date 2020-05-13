import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {CnvMutationLegend} from './CnvMutationLegend'
import {GeneSetLegend} from './GeneSetLegend'


export class GeneCnvMutationLegend extends PureComponent {


  render() {

    return (
      <tr>
        <td colSpan={4}>
          Gene Label
          <GeneSetLegend
            id='densityGrad1' label={'Samples affected %'} maxColor='red'
            maxScore={100} midColor='pink'
            minColor='white' minScore={0} precision={0}
          />

          Sample
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
