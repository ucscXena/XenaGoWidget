import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
// import {IconButton} from 'react-toolbox';
import {Dialog} from 'react-toolbox/lib';


export class GeneSetInfoBox extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      showInfo: false,
    };
  }

  showInfo() {

  }

  render(){

    const {cohortIndex,samplesLength,selectedCohort} = this.props;

    // console.log('seleced cohort',selectedCohort);

    return (
      <div className={cohortIndex===0 ? BaseStyle.topInfoBox : BaseStyle.bottomInfoBox}>
        {selectedCohort.name}
        <br/>
        <Dialog
          active={this.state.showInfo}
          onEscKeyDown={() => this.setState({showInfo:false})}
          onOverlayClick={() => this.setState({showInfo:false})}
          title="Cohort Info"
          type='small'
        >
          <div>
            {selectedCohort.selectedSubCohorts}
          </div>
        </Dialog>

        <button className={BaseStyle.samplesBox} onClick={() => alert('show info')} type='button'>
          { selectedCohort.selectedSubCohorts.length } / {selectedCohort.subCohorts.length } cohorts selected
        </button>

        {/*<IconButton icon='info' onClick={() => this.setState({showInfo: true})} style={{marginBottom: 5}}/>*/}

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
