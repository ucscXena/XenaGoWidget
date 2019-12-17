import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';


export class GeneSetInfoBox extends PureComponent {

  render(){

    const {cohortIndex,samplesLength,selectedCohort} = this.props;

    // console.log('seleced cohort',selectedCohort);

    return (
      <div className={cohortIndex===0 ? BaseStyle.topInfoBox : BaseStyle.bottomInfoBox}>
        {selectedCohort.name}
        <br/>

        <button className={BaseStyle.samplesBox} onClick={() => alert('show info')} type='button'>
          { selectedCohort.selectedSubCohorts.length } / {selectedCohort.subCohorts.length } cohorts selected
        </button>

        <br/>
        <div className={BaseStyle.samplesBox}>
          {samplesLength} samples
        </div>
      </div>
    );
  }

}

GeneSetInfoBox.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  samplesLength: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,
};
