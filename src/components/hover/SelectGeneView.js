import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'

export default class SelectGeneView extends PureComponent {


  render() {
    const {data} = this.props
    if(!data.pathwaySelection) return <div/>
    const pathwaySelection = data.pathwaySelection.pathway

    if (pathwaySelection && data.pathwaySelection.open) {
      return (
        <div className={BaseStyle.pathwayChip}>
          <div className={BaseStyle.boxHeader}>Opened Gene Set</div>
          <div className={BaseStyle.geneHoverPathway} style={{width:180}}>
            {pathwaySelection.golabel.replace(/_/g,' ')}
            {  pathwaySelection.goid ? ` (${pathwaySelection.goid})`  : ''}
          </div>
          <div className={BaseStyle.geneHoverPathway} style={{width:180}}>
            {pathwaySelection.gene.length} Genes
          </div>
        </div>
      )
    }
    else {
      return (
        <div className={BaseStyle.pathwayChip}>
        No Gene Set selected
        </div>
      )
    }
  }
}

SelectGeneView.propTypes = {
  data: PropTypes.any.isRequired,
}
