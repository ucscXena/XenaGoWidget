import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import BaseStyle from '../css/base.css';

export class DetailedLabelTop extends PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const {cohort,pathwayData,width} = this.props;
    return (
      <table>
        <tbody>
          <tr>
            <td className={BaseStyle.cohortAGeneSetViewer} width={width/2 +30}>
              <div className={BaseStyle.geneSetHeaderLabel}>
                {cohort[0].name}
                {pathwayData[0].samples &&
              <div className={BaseStyle.inlinePathwayChip}>
                {pathwayData[0].samples.length}
              </div>
                }
              </div>
            </td>
            <td className={BaseStyle.cohortBGeneSetViewer} width={width/2 +30}>
              <div className={BaseStyle.geneSetHeaderLabel}>
                {cohort[1].name}
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
  pathwayData: PropTypes.any.isRequired,
  width: PropTypes.any.isRequired,
};
