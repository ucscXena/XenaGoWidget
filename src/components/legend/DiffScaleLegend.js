import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {DETAIL_WIDTH, LABEL_WIDTH, VERTICAL_GENESET_DETAIL_WIDTH} from '../XenaGeneSetApp'
import {isViewGeneExpression} from '../../functions/DataFunctions'
import BaseStyle from '../../css/base.css'

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
        <div/>
        // <tr className={BaseStyle.diffScaleLegend} style={{height: 24}} >
        //   <td colSpan={3} style={{height: 24}}/>
        // </tr>
      )
    }

    // const legendText = isViewGeneExpression(this.props.view) ? 't-test gene expr' : 'chi-square test χ2'
    const legendText = isViewGeneExpression(this.props.view) ? 't-test gene expr' : 'χ2 test'
    return (
      <tr className={BaseStyle.diffScaleLegend} >
        <td colSpan={1} style={{paddingLeft: 6}} width={DETAIL_WIDTH}>
          <svg style={{visibility: this.props.showDiffLabel ? 'visible': 'hidden', width: '100%', height: 20, borderColor: 'black', borderWidth: 1 }}>
            <polyline
              fill={'none'}
              points={`0,0 0,20 0,15 ${VERTICAL_GENESET_DETAIL_WIDTH},15  ${VERTICAL_GENESET_DETAIL_WIDTH},0   ${VERTICAL_GENESET_DETAIL_WIDTH},20`}
              stroke={'black'}
              strokeWidth={1}
            />
            <text
              fill={'red'}
              fontFamily={'sans-serif'}
              fontSize={'smaller'}
              fontWeight={'bolder'}
              x={15}
              y={10}
            >
              {this.props.minValue.toFixed(2)}
            </text>
            <text
              fontFamily={'sans-serif'}
              fontSize={'smaller'}
              x={60}
              y={10}
            >
              {legendText}
            </text>
            <text
              fontFamily={'sans-serif'}
              fontSize={'smaller'}
              x={VERTICAL_GENESET_DETAIL_WIDTH - 13}
              y={10}
            >
              {0}
            </text>
            <polygon
              fill='black'
              points={this.calculateDiamond(VERTICAL_GENESET_DETAIL_WIDTH,20,0)}
              stroke='black'/>
          </svg>
        </td>
        <td colSpan={1} style={{fontFamily: 'sans-serif',fontSize: 'small',height: 20}} width={LABEL_WIDTH-5}>
          <span style={{display: 'inline',paddingLeft: 10,paddingBottom: 0,paddingTop: 0, margin: 0, height: 20}}>Gene Diff Scale</span>
          <input
            checked={this.props.showDiffLabel}
            onChange={this.handleShowDiffLabel}
            style={{display: 'inline'}} type='checkbox'/> Show
        </td>
        <td colSpan={1} width={DETAIL_WIDTH}>
          <svg style={{visibility: this.props.showDiffLabel ? 'visible': 'hidden', width: '100%', height: 20, borderColor: 'black', borderWidth: 1 }}>
            <polyline
              fill={'none'}
              points={`0,0 0,20 0,15 ${VERTICAL_GENESET_DETAIL_WIDTH},15  ${VERTICAL_GENESET_DETAIL_WIDTH},0   ${VERTICAL_GENESET_DETAIL_WIDTH},20`}
              stroke={'black'}
              strokeWidth={1}
            />
            <text
              fontFamily={'sans-serif'}
              fontSize={'smaller'}
              x={7}
              y={10}
            >
              {0}
            </text>
            <text
              fontFamily={'sans-serif'}
              fontSize={'smaller'}
              x={25}
              y={10}
            >
              {legendText}
            </text>
            <text
              fill={'blue'}
              fontFamily={'sans-serif'}
              fontSize={'smaller'}
              fontWeight={'bolder'}
              x={VERTICAL_GENESET_DETAIL_WIDTH - 55}
              y={10}
            >
              {-this.props.maxValue.toFixed(2)}
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
  view: PropTypes.string.isRequired,
}
