import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import BaseStyle from '../../css/base.css'
import HoverGeneSetSample from './HoverGeneSetSample'
import HoverGeneSample from './HoverGeneSample'
import HoverGeneLabel from './HoverGeneLabel'
import HoverGeneSetLabel from './HoverGeneSetLabel'
import {findScore} from '../../functions/HoverFunctions'

export default class HoverGeneView extends PureComponent {



  render() {
    let {data, cohortIndex, view} = this.props
    if (data && data.tissue) {
      const score = findScore(data, cohortIndex,view)
      return (
        <div>
          {data.tissue !== 'Header' && data.source === 'GeneSet' && score!==undefined &&
            <HoverGeneSetSample
              cohortIndex={cohortIndex}
              data={data}
              score={score}
              view={view}
            />
          }
          {data.tissue !== 'Header' && data.source !== 'GeneSet' &&
            <HoverGeneSample cohortIndex={cohortIndex} data={data} score={score} view={view}/>
          }
          {data.tissue === 'Header' && data.pathway && data.pathway.gene.length === 1 &&
          <HoverGeneLabel data={data} view={view}/>
          }
          {data.tissue === 'Header' && data.pathway && data.pathway.gene.length > 0 &&
            data.expression && data.expression.allGeneAffected!==undefined && score &&
          <HoverGeneSetLabel cohortIndex={cohortIndex} data={data} score={score} view={view}/>
          }
        </div>
      )
    }


    return(
      <div
        className={BaseStyle.pathwayChip}
        style={{width: 180,wordBreak:'break-all',whiteSpace:'normal'}}
      >
        <div className={BaseStyle.boxHeader}/>
        <hr/>
      </div>
    )
  }
}

HoverGeneView.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any,
  view: PropTypes.any.isRequired,
}
