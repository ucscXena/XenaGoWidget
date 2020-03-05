import React from 'react'
import PureComponent from './PureComponent'
import BaseStyle from '../css/base.css'
import PropTypes from 'prop-types'
import {VIEW_ENUM} from '../data/ViewEnum'

export class CnvMutationLegend extends PureComponent {

  render() {
    return (
      <div className={BaseStyle.cnvMutationLegendBox} >
        <table  width='100%'>
          <tbody>
            <tr>
              { (this.props.view === VIEW_ENUM.CNV_MUTATION || this.props.view === VIEW_ENUM.COPY_NUMBER) &&
              <td>
                <span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span>
                  &nbsp;
                <span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong></span>
              </td>
              }
              {this.props.view === VIEW_ENUM.CNV_MUTATION &&
              <td style={{borderLeft: '2px solid'}}/>
              }
              {(this.props.view === VIEW_ENUM.CNV_MUTATION || this.props.view === VIEW_ENUM.MUTATION) &&
              <td>
                <span className={BaseStyle.mutation4Color}><strong>Deleterious</strong></span>
                &nbsp;
                <span className={BaseStyle.mutation3Color}><strong>Splice</strong></span>
                &nbsp;
                <span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong></span>
              </td>
              }
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

CnvMutationLegend.propTypes = {
  view: PropTypes.any.isRequired,
}
