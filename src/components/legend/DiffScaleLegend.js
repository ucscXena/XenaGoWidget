import React from 'react'
import PureComponent from '../PureComponent'
// import {GeneSetLegend} from './GeneSetLegend'
// import {VIEW_ENUM} from '../../data/ViewEnum'
import PropTypes from 'prop-types'
// import {GeneLegendLabel} from './GeneLegendLabel'
// import BaseStyle from '../../css/base.css'


export class DiffScaleLegend extends PureComponent {

  render() {
    if(!this.props.showScale){
      return (
        <tr style={{height: 20}} >
          <td colSpan={3} style={{height: 20}}/>
        </tr>
      )
    }
    return (
      <tr style={{height: 20}} >
        <td colSpan={1}>
          <svg style={{width: '100%', height: 20, borderColor: 'black', borderWidth: 1 }}>
            <rect
              height={20}
              key={1}
              style={{fill:'none',strokeWidth:3,stroke:'black'}}
              width={'100%'}
              x={0}
              y={0}
            />

          </svg>
          {/*<GeneLegendLabel/>*/}
        </td>
        <td colSpan={1} style={{height: 20}}>
          <pre style={{display: 'inline',padding: 0, margin: 0, height: 20}}>Gene Diff Scale</pre>
          <input style={{display: 'inline'}} type='checkbox'/> Show
          {/*<div className={BaseStyle.legendTextDiv}>*/}
          {/*  <pre style={{marginLeft: 0,display:'inline'}}>{getMiddleGeneLabelForView(this.props.filter)}</pre>*/}
          {/*  <br/>*/}
          {/*  <GeneSetLegend*/}
          {/*    id='geneExpressionGeneScore'*/}
          {/*    maxScore={2}*/}
          {/*    minScore={-2}*/}
          {/*  />*/}
          {/*</div>*/}
        </td>
        <td colSpan={1}>
          {/*<div className={BaseStyle.legendTextDiv}>*/}
          {/*  <pre style={{marginLeft: 0,display:'inline'}}>{getSampleGeneLabelForView(this.props.filter)}</pre>*/}
          {/*  <br/>*/}
          {/*  <GeneSetLegend*/}
          {/*    id='geneExpressionGeneSampleScore'*/}
          {/*    // label={this.props.filter + ' score'}*/}
          {/*    maxScore={2}*/}
          {/*    minScore={-2}*/}
          {/*  />*/}
          {/*</div>*/}
        </td>
      </tr>
    )
  }
}
DiffScaleLegend.propTypes = {
  maxValue: PropTypes.any.isRequired,
  minValue: PropTypes.any.isRequired,
  showScale: PropTypes.any,
}
