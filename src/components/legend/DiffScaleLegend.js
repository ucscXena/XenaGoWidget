import React from 'react'
import PureComponent from '../PureComponent'
// import {GeneSetLegend} from './GeneSetLegend'
// import {VIEW_ENUM} from '../../data/ViewEnum'
import PropTypes from 'prop-types'
import {VERTICAL_GENESET_DETAIL_WIDTH} from '../XenaGeneSetApp'
// import {GeneLegendLabel} from './GeneLegendLabel'
// import BaseStyle from '../../css/base.css'


export class DiffScaleLegend extends PureComponent {

  calculateDiamond(width,height,cohortIndex) {
    const diamondWidth = 10
    const offset = (width - diamondWidth)
    if(cohortIndex === 0){
      // return `${offset} 0,${offset + diamondWidth / 2} ${diamondHeight}, ${offset + diamondWidth} 0`
      return `${diamondWidth} ${height},${0} ${height /2.0}, ${diamondWidth} 0`
    }
    else{
      return `${offset} ${height},${width} ${height /2.0}, ${offset} 0`
    }
  }

  handleShowDiffLabel = () => {
    this.props.onShowDiffLabel(!this.props.showDiffLabel)
  }

  render() {
    if(!this.props.showScale){
      return (
        <tr style={{height: 24}} >
          <td colSpan={3} style={{height: 24}}/>
        </tr>
      )
    }
    return (
      <tr style={{height: 20}} >
        <td colSpan={1}>
          <svg style={{visibility: this.props.showDiffLabel ? 'visible': 'hidden', width: '100%', height: 20, borderColor: 'black', borderWidth: 1 }}>
            <polyline
              fill={'none'}
              points={`0,0 0,20 0,15 ${VERTICAL_GENESET_DETAIL_WIDTH},15  ${VERTICAL_GENESET_DETAIL_WIDTH},0   ${VERTICAL_GENESET_DETAIL_WIDTH},20`}
              stroke={'black'}
              strokeWidth={1}
            />
            <text
              fontSize={'smaller'}
              x={15}
              y={10}
            >
              {this.props.maxValue.toPrecision(3)}
            </text>
            <text
              fontSize={'smaller'}
              x={55}
              y={10}
            >
              Gene difference
            </text>
            <text
              fontSize={'smaller'}
              x={VERTICAL_GENESET_DETAIL_WIDTH - 20}
              y={10}
            >
              {this.props.minValue}
            </text>
            <polygon
              fill='black'
              points={this.calculateDiamond(VERTICAL_GENESET_DETAIL_WIDTH,20,0)}
              stroke='black'/>
          </svg>
        </td>
        <td colSpan={1} style={{height: 20}}>
          <pre style={{display: 'inline',paddingLeft: 10,paddingBottom: 0,paddingTop: 0, margin: 0, height: 20}}>Gene Diff Scale</pre>
          <input
            checked={this.props.showDiffLabel}
            onChange={this.handleShowDiffLabel}
            style={{display: 'inline'}} type='checkbox'/> Show
        </td>
        <td colSpan={1}>
          <svg style={{visibility: this.props.showDiffLabel ? 'visible': 'hidden', width: '100%', height: 20, borderColor: 'black', borderWidth: 1 }}>
            <polyline
              fill={'none'}
              points={`0,0 0,20 0,15 ${VERTICAL_GENESET_DETAIL_WIDTH},15  ${VERTICAL_GENESET_DETAIL_WIDTH},0   ${VERTICAL_GENESET_DETAIL_WIDTH},20`}
              stroke={'black'}
              strokeWidth={1}
            />
            <text
              fontSize={'smaller'}
              x={10}
              y={10}
            >
              {-this.props.minValue}
            </text>
            <text
              fontSize={'smaller'}
              x={35}
              y={10}
            >
              Gene difference
            </text>
            <text
              fontSize={'smaller'}
              x={VERTICAL_GENESET_DETAIL_WIDTH - 45}
              y={10}
            >
              {-this.props.maxValue.toPrecision(3)}
            </text>
            <polygon
              fill='black'
              points={this.calculateDiamond(VERTICAL_GENESET_DETAIL_WIDTH,20,1)}
              stroke='black'/>
          </svg>
        </td>
      </tr>
    )
  }
}
DiffScaleLegend.propTypes = {
  maxValue: PropTypes.any.isRequired,
  minValue: PropTypes.any.isRequired,
  onShowDiffLabel: PropTypes.any.isRequired,
  showDiffLabel: PropTypes.any.isRequired,
  showScale: PropTypes.any,
}
