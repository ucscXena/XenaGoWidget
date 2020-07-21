import React from 'react'
import PureComponent from '../PureComponent'
import BaseStyle from '../../css/base.css'
import PropTypes from 'prop-types'
import {VIEW_ENUM} from '../../data/ViewEnum'

export class CnvMutationLegend extends PureComponent {

  render() {
    const {view } = this.props
    return (
      <div className={BaseStyle.cnvMutationLegendBox} >
        <table  width='100%'>
          <tbody>
            { view === VIEW_ENUM.COPY_NUMBER &&
              <tr>
                <td>
                  <span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span>
                  &nbsp;
                  <span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong></span>
                </td>
              </tr>
            }
            { view === VIEW_ENUM.MUTATION &&
            <tr>
              <td>
                <span className={BaseStyle.mutation4Color}><strong>Deleterious</strong></span>
                &nbsp;
                <span className={BaseStyle.mutation3Color}><strong>Splice</strong></span>
                &nbsp;
                <span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong></span>
              </td>
            </tr>
            }
            { view === VIEW_ENUM.CNV_MUTATION &&
            <tr>
              <td>
                <span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span> / <span className={BaseStyle.cnvLowColor}><strong>Deletion</strong></span>
                <br/>
                <span className={BaseStyle.mutation4Color} style={{fontSize:'x-small'}}><strong>Deleterious</strong></span>
                <span className={BaseStyle.mutation3Color} style={{fontSize:'x-small'}}><strong>Splice</strong></span>
                <span className={BaseStyle.mutation2Color} style={{fontSize:'x-small'}}><strong>Missense/Inframe</strong></span>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
    )
  }
}

CnvMutationLegend.propTypes = {
  view: PropTypes.any.isRequired,
}
