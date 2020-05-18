import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import FaArrowRight from 'react-icons/lib/fa/arrow-right'


export class GeneSetLegendLabel extends PureComponent {


  render() {

    return (
      <div className={BaseStyle.verticalLegendBox}>
            Gene Set &nbsp;
        <FaArrowRight/>
      </div>
    )
  }

}

GeneSetLegendLabel.propTypes = {
}
