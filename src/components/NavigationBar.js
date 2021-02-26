import React from 'react'
import { Button, AppBar,  Navigation } from 'react-toolbox'
import PureComponent from '../../src/components/PureComponent'
import BaseStyle from '../css/base.css'
import * as PropTypes from 'underscore'
import GoogleLogin, {GoogleLogout} from 'react-google-login'


// eslint-disable-next-line react/no-multi-comp
const GithubIcon = () => (
  <svg style={{height: 30}} viewBox="0 0 284 277">
    <g fill='white' stroke='black' strokeWidth='4'>
      <path
        d="M141.888675,0.0234927555 C63.5359948,0.0234927555 0,63.5477395 0,141.912168 C0,204.6023 40.6554239,257.788232 97.0321356,276.549924 C104.12328,277.86336 106.726656,273.471926 106.726656,269.724287 C106.726656,266.340838 106.595077,255.16371 106.533987,243.307542 C67.0604204,251.890693 58.7310279,226.56652 58.7310279,226.56652 C52.2766299,210.166193 42.9768456,205.805304 42.9768456,205.805304 C30.1032937,196.998939 43.9472374,197.17986 43.9472374,197.17986 C58.1953153,198.180797 65.6976425,211.801527 65.6976425,211.801527 C78.35268,233.493192 98.8906827,227.222064 106.987463,223.596605 C108.260955,214.426049 111.938106,208.166669 115.995895,204.623447 C84.4804813,201.035582 51.3508808,188.869264 51.3508808,134.501475 C51.3508808,119.01045 56.8936274,106.353063 65.9701981,96.4165325 C64.4969882,92.842765 59.6403297,78.411417 67.3447241,58.8673023 C67.3447241,58.8673023 79.2596322,55.0538738 106.374213,73.4114319 C117.692318,70.2676443 129.83044,68.6910512 141.888675,68.63701 C153.94691,68.6910512 166.09443,70.2676443 177.433682,73.4114319 C204.515368,55.0538738 216.413829,58.8673023 216.413829,58.8673023 C224.13702,78.411417 219.278012,92.842765 217.804802,96.4165325 C226.902519,106.353063 232.407672,119.01045 232.407672,134.501475 C232.407672,188.998493 199.214632,200.997988 167.619331,204.510665 C172.708602,208.913848 177.243363,217.54869 177.243363,230.786433 C177.243363,249.771339 177.078889,265.050898 177.078889,269.724287 C177.078889,273.500121 179.632923,277.92445 186.825101,276.531127 C243.171268,257.748288 283.775,204.581154 283.775,141.912168 C283.775,63.5477395 220.248404,0.0234927555 141.888675,0.0234927555"
      />
    </g>
  </svg>
)

// eslint-disable-next-line react/no-multi-comp
const XenaIcon = () => (
  <img alt={'Xena'} src="https://raw.githubusercontent.com/ucscXena/XenaGoWidget/develop/src/images/xenalogo_deW_icon.ico" style={{height: 30,marginRight: 30}}/>
)

export const refreshTokenSetup = (res) => {
  let refreshTiming = (res.tokenId.expires_in || 3600 - 5 * 60) * 1000

  const refreshToken = async () => {
    const newAuthRes = await res.reloadAuthResponse()
    refreshTiming = (newAuthRes.expires_in || 3600 - 5 * 60) * 1000
    console.log('newAuthRes:', newAuthRes)
    console.log('new auth token:', newAuthRes.id_token)
    setTimeout(refreshToken, refreshTiming)
  }
  setTimeout(refreshToken, refreshTiming)
}

// eslint-disable-next-line react/no-multi-comp
export default class NavigationBar extends PureComponent {


  constructor(props) {
    super(props)
    this.state = {
      geneNameSearch: '',
      profile:undefined,
    }
  }

    showHelp = () => {
      window.open('https://ucsc-xena.gitbook.io/project/overview-of-features/gene-sets-about')
    };

    setUser(profile) {
      this.props.setUser(profile)
      this.setState({
        profile:profile
      })
    }

    render() {
      return (
        <div>
          <link
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet"
          />
          <AppBar leftIcon={<XenaIcon />} title='Xena Gene Set Viewer'>
            <Navigation className={BaseStyle.wideNavigation} type='horizontal'>
              <table>
                <tbody>
                  <tr>
                    <td width="2%">
                      &nbsp;
                    </td>
                    <td width="10%">
                      {this.state.profile &&
                      <div>
                        {this.state.profile.profileObj.name} {this.state.profile.profileObj.email}
                      </div>
                      }
                    </td>
                    <td width="20%" >

                      {this.state.profile===undefined&&
                      <GoogleLogin
                        buttonText="Login"
                        clientId="654629507592-9i8vh19esnv2f5is1roofl3c9v7sla54.apps.googleusercontent.com"
                        cookiePolicy={'single_host_origin'}
                        isSignedIn
                        onFailure={(err) => console.error('error', err)}
                        onSuccess={(response) => {
                          console.log('response', response)
                          refreshTokenSetup(response)
                          this.setUser(response)
                          // testA(`authorized:${response.profileObj.email}`).then(
                          //   (res) => {
                          //     console.log('follow up response')
                          //   },
                          //   (err) => {
                          //     console.log('follow up err', err)
                          //   },
                          // )
                        }}
                      />
                      }
                      {this.state.profile!==undefined &&
                      <GoogleLogout
                        buttonText="Logout"
                        clientId="654629507592-9i8vh19esnv2f5is1roofl3c9v7sla54.apps.googleusercontent.com"
                        onFailure={(err) => console.error('error', err)}
                        onLogoutSuccess={() => {
                          this.setUser()
                        }}
                      />
                      }


                        &nbsp;
                    </td>
                    <td width="10%">
                      <a href='https://github.com/ucscXena/XenaGoWidget' style={{marginLeft: 20}}>
                        <GithubIcon/>
                      </a>
                    </td>
                    <td width="5%">
                      <Button
                        floating icon='help' mini onClick={() => this.showHelp()}
                        primary
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Navigation>
          </AppBar>

        </div>)
    }



}

NavigationBar.propTypes = {
  acceptGeneHandler: PropTypes.any,
  // configurationHandler: PropTypes.any,
  geneOptions: PropTypes.any,
  searchHandler: PropTypes.any,
  setUser: PropTypes.any,
}
