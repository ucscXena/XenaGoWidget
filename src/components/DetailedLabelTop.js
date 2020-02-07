import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';
import Tooltip from 'react-toolbox/lib/tooltip';
import Link from 'react-toolbox/lib/link';

const TooltipLink = Tooltip(Link);

const COHORT_LENGTH= 15;
const SUBCOHORT_LENGTH = 25;
// let getShortName = (name) => (name.length>MAGIC_LENGTH ? name.substr(0,MAGIC_LENGTH-3)+'..' : name);

function getShortName(name,length){
  return (name.length>length? name.substr(0,length-3)+'..' : name);
}

function cleanSubCohortName(name){
  const firstIndex = name.indexOf('.');
  if(firstIndex>0) return name.substr(firstIndex+1);
  return name ;
}

function getSelectedSubCohorts(selectedSubCohorts,length) {
  if(selectedSubCohorts.length===0){ return '';}
  if(selectedSubCohorts.length===1){
    return getShortName(cleanSubCohortName(selectedSubCohorts));
  }
  return getShortName( selectedSubCohorts.map( s => cleanSubCohortName(s)).join(','),length);
}

export class DetailedLabelTop extends PureComponent {

  render() {
    const {cohort,colors,pathwayData,onShowCohortEditor,width} = this.props;

    // const label = selectedCohort.name.length>MAGIC_LENGTH ? selectedCohort.name.substr(0,MAGIC_LENGTH-3)+'..' : selectedCohort.name;
    const cohortAName = getShortName(cohort[0].name,COHORT_LENGTH);
    const subCohortADetails = getSelectedSubCohorts(cohort[0].selectedSubCohorts,SUBCOHORT_LENGTH);
    const cohortBName = getShortName(cohort[1].name,COHORT_LENGTH);
    const subCohortBDetails = getSelectedSubCohorts(cohort[1].selectedSubCohorts,SUBCOHORT_LENGTH);

    return (
      <table>
        <tbody>
          <tr>
            <td className={BaseStyle.cohortAGeneSetViewer} style={{backgroundColor:colors[0]}} width={width/2 +30}>
              <div className={BaseStyle.geneSetHeaderLabel}>
                <TooltipLink
                  className={BaseStyle.infoLink} href="#" label={cohortAName +' '+subCohortADetails}
                  onClick={()=> onShowCohortEditor()}
                  tooltip={cohort[0].name}
                />
                {pathwayData[0].samples &&
              <div className={BaseStyle.inlinePathwayChip}>
                {pathwayData[0].samples.length}
              </div>
                }
              </div>
            </td>
            <td className={BaseStyle.cohortBGeneSetViewer} style={{backgroundColor:colors[1]}} width={width/2 +30}>
              <div className={BaseStyle.geneSetHeaderLabel}>
                <TooltipLink
                  className={BaseStyle.infoLink} href="#" label={cohortBName + ' '+subCohortBDetails}
                  onClick={()=> onShowCohortEditor()}
                  tooltip={cohort[1].name}
                />
                {pathwayData[1].samples &&
              <div className={BaseStyle.inlinePathwayChip}>
                {pathwayData[1].samples.length}
              </div>
                }
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

DetailedLabelTop.propTypes = {
  cohort: PropTypes.any.isRequired,
  colors: PropTypes.any.isRequired,
  onShowCohortEditor: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,
};
