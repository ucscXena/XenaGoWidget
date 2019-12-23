import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
// import {IconButton} from 'react-toolbox';
import {Dialog} from 'react-toolbox/lib';
import Tooltip from 'react-toolbox/lib/tooltip';
import Link from 'react-toolbox/lib/link';
import {
  getSamplesFromSubCohort
} from '../functions/CohortFunctions';
import {Button} from 'react-toolbox';

const TooltipLink = Tooltip(Link);

const MAGIC_LENGTH = 25 ;

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

    const {cohortIndex,samplesLength,selectedCohort, onEditCohorts} = this.props;

    const label = selectedCohort.name.length>MAGIC_LENGTH ? selectedCohort.name.substr(0,MAGIC_LENGTH-3)+'..' : selectedCohort.name;
    return (
      <div className={cohortIndex===0 ? BaseStyle.topInfoBox : BaseStyle.bottomInfoBox}>
        <TooltipLink
          className={BaseStyle.infoLink} href="#" label={label}
          onClick={()=>this.setState({showInfo: true})}
          tooltip={selectedCohort.name}
        />
        <Dialog
          active={this.state.showInfo}
          onEscKeyDown={() => this.setState({showInfo:false})}
          onOverlayClick={() => this.setState({showInfo:false})}
          title={selectedCohort.name}
          type='normal'
        >
          <div>
            <ul>
              {selectedCohort.selectedSubCohorts.sort().map( s => {
                return (
                  <li key={s}>{s} ({getSamplesFromSubCohort(selectedCohort.name,s).length})</li>
                );
              }
              )}
            </ul>
          </div>
        </Dialog>
        <div className={BaseStyle.samplesBox}>
          {samplesLength} samples
          <Button icon='edit' mini onClick={() => onEditCohorts()} />
        </div>
        { selectedCohort.selectedSubCohorts.length < selectedCohort.subCohorts.length && selectedCohort.selectedSubCohorts.length > 0 &&
          <ul className={BaseStyle.noBullets}>
            {selectedCohort.selectedSubCohorts.sort().map( s => {
              return (
                <li key={s}>{s} ({getSamplesFromSubCohort(selectedCohort.name,s).length})</li>
              );
            }
            )}
          </ul>
        }
      </div>
    );
  }

}

GeneSetInfoBox.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  onEditCohorts: PropTypes.any.isRequired,
  samplesLength: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,
};
