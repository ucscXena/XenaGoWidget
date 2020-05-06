import React from 'react'
import PureComponent from '../PureComponent'
import PropTypes from 'prop-types'
import {Chip} from 'react-toolbox'
import BaseStyle from '../../css/base.css'
import {ScoreBadge} from '../ScoreBadge'

export default class CnvMutationScoreBox extends PureComponent {


  render() {
    let {data, cohortIndex} = this.props
    let returnArray = []
    if(cohortIndex===0) {
      if (data.pathway.firstSampleCnvHigh > 0) {
        returnArray.push(
          <Chip key={0}><span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong><ScoreBadge
            score={data.pathway.firstSampleCnvHigh}/></span></Chip>
        )
      }
      if (data.pathway.firstSampleCnvLow > 0) {
        returnArray.push(
          <Chip key={1}><span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong><ScoreBadge
            score={data.pathway.firstSampleCnvLow}/></span></Chip>
        )
      }
      if (data.pathway.firstSampleMutation2 > 0) {
        returnArray.push(
          <Chip key={2}><span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong><ScoreBadge
            score={data.pathway.firstSampleMutation2}/></span></Chip>
        )
      }
      if (data.pathway.firstSampleMutation3 > 0) {
        returnArray.push(
          <Chip key={3}><span className={BaseStyle.mutation3Color}><strong>Splice</strong><ScoreBadge
            score={data.pathway.firstSampleMutation3}/></span></Chip>
        )
      }
      if (data.pathway.firstSampleMutation4 > 0) {
        returnArray.push(
          <Chip key={4}><span className={BaseStyle.mutation4Color}><strong>Deleterious</strong><ScoreBadge
            score={data.pathway.firstSampleMutation4}/></span></Chip>
        )
      }
    }
    if(cohortIndex===1){
      if(data.pathway.secondSampleCnvHigh > 0){
        returnArray.push(
          <Chip key={5}><span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong><ScoreBadge score={data.pathway.secondSampleCnvHigh}/></span></Chip>
        )
      }
      if(data.pathway.secondSampleCnvLow > 0){
        returnArray.push(
          <Chip key={6}><span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong><ScoreBadge score={data.pathway.secondSampleCnvLow}/></span></Chip>
        )
      }
      if(data.pathway.secondSampleMutation2 > 0){
        returnArray.push(
          <Chip key={7}><span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong><ScoreBadge score={data.pathway.secondSampleMutation2}/></span></Chip>
        )
      }
      if(data.pathway.secondSampleMutation3 > 0){
        returnArray.push(
          <Chip key={8}><span className={BaseStyle.mutation3Color}><strong>Splice</strong><ScoreBadge score={data.pathway.secondSampleMutation3}/></span></Chip>
        )
      }
      if(data.pathway.secondSampleMutation4 > 0){
        returnArray.push(
          <Chip key={9}><span className={BaseStyle.mutation4Color}><strong>Deleterious</strong><ScoreBadge score={data.pathway.secondSampleMutation4}/></span></Chip>
        )
      }
    }
    return returnArray
  }
}

CnvMutationScoreBox.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
}
